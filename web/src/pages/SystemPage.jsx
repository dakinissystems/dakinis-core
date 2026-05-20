import { useCallback, useEffect, useMemo, useState } from "react";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisGetSystemRegistry } from "@dakinis/shared/catalog/system-registry.js";
import {
  DAKINIS_BUSINESS_SLUG_BY_VERTICAL,
  DAKINIS_ENTITY_BY_VERTICAL
} from "@dakinis/shared/catalog/business-mapping.js";
import {
  DAKINIS_SYSTEM_PAGE_CONTENT,
  DAKINIS_SYSTEM_MOCKUPS,
  dakinisBuildDefaultFormValues
} from "../data/systemPages.js";
import { dakinisTenantJsonFetch } from "../services/api.js";
import DemoTenantSystemWelcome from "../components/DemoTenantSystemWelcome.jsx";
import SupplyDeliveriesAndAlerts from "../components/SupplyDeliveriesAndAlerts.jsx";
import TenantTeamSection from "../components/TenantTeamSection.jsx";
import RestaurantStockSection from "../components/RestaurantStockSection.jsx";
import { dakinisIsSeedDemoTenantSession } from "../utils/demoSession.js";

import { DAKINIS_LOGO_SIMPLE } from "../config/brand-assets.js";
const dakinisSystemRegistry = dakinisGetSystemRegistry();

export default function SystemPage({ activeSystemKey, navigate }) {
  const { session } = useDakinisSession();

  const hideVerticalSwitcher =
    Boolean(session?.token) && session?.user?.role !== "platform_admin";

  const showDemoWelcome =
    Boolean(session?.token) && hideVerticalSwitcher && dakinisIsSeedDemoTenantSession(session);

  const sistemaSwitcherEntries = useMemo(() => {
    if (hideVerticalSwitcher) return [];
    const all = Object.entries(dakinisSystemRegistry);
    if (!session?.token) return all;
    if (session.user?.role === "platform_admin") return all;
    const tenantType = session.business?.type;
    if (tenantType) return all.filter(([key]) => key === tenantType);
    return all;
  }, [session, hideVerticalSwitcher]);
  const selectedSystem = dakinisSystemRegistry[activeSystemKey] || dakinisSystemRegistry.clinica;
  const systemPageContent =
    DAKINIS_SYSTEM_PAGE_CONTENT[activeSystemKey] || DAKINIS_SYSTEM_PAGE_CONTENT.clinica;
  const activeMockup = DAKINIS_SYSTEM_MOCKUPS[activeSystemKey] || DAKINIS_SYSTEM_MOCKUPS.clinica;
  const tenantSlugForVertical = DAKINIS_BUSINESS_SLUG_BY_VERTICAL[activeSystemKey];
  const entityName = DAKINIS_ENTITY_BY_VERTICAL[activeSystemKey];

  const apiSession = useMemo(() => {
    if (
      session?.token &&
      session.business?.slug &&
      session.business?.type === activeSystemKey
    ) {
      return session;
    }
    return {
      token: undefined,
      business: { slug: tenantSlugForVertical, id: undefined }
    };
  }, [session, tenantSlugForVertical, activeSystemKey]);

  const [records, setRecords] = useState(() => [...activeMockup.initialRecords]);
  const [recordsError, setRecordsError] = useState("");
  const [recordsSynced, setRecordsSynced] = useState(false);
  const [mockFormValues, setMockFormValues] = useState(() => dakinisBuildDefaultFormValues(activeMockup));

  useEffect(() => {
    setMockFormValues(dakinisBuildDefaultFormValues(activeMockup));
    setRecords([...activeMockup.initialRecords]);
    setRecordsError("");
    setRecordsSynced(false);
  }, [activeSystemKey, activeMockup]);

  const reloadRecordsFromApi = useCallback(
    async (signal) => {
      setRecordsError("");
      try {
        const json = await dakinisTenantJsonFetch(
          `/api/tenant/mock-records?entity=${encodeURIComponent(entityName)}`,
          apiSession,
          {
            signal,
            businessId: tenantSlugForVertical,
            businessTypeHeader: activeSystemKey
          }
        );
        const fromApi = json?.data?.records;
        if (Array.isArray(fromApi)) {
          setRecords(fromApi);
          setRecordsSynced(true);
        }
      } catch (error) {
        if (error?.name === "AbortError") return;
        setRecordsError(error instanceof Error ? error.message : "No se cargaron registros");
        setRecordsSynced(false);
      }
    },
    [apiSession, entityName, tenantSlugForVertical, activeSystemKey]
  );

  useEffect(() => {
    const controller = new AbortController();
    reloadRecordsFromApi(controller.signal);
    return () => controller.abort();
  }, [reloadRecordsFromApi]);

  function dakinisHandleMockFieldChange(fieldKey, value) {
    setMockFormValues((prev) => ({
      ...prev,
      [fieldKey]: value
    }));
  }

  async function dakinisHandleMockSubmit(event) {
    event.preventDefault();
    const id = `${activeSystemKey}-${Date.now()}`;
    const newRecord = { ...mockFormValues, id };
    setMockFormValues(dakinisBuildDefaultFormValues(activeMockup));

    try {
      await dakinisTenantJsonFetch("/api/tenant/mock-records", apiSession, {
        method: "POST",
        businessId: tenantSlugForVertical,
        businessTypeHeader: activeSystemKey,
        body: { record: newRecord }
      });
      await reloadRecordsFromApi();
    } catch (error) {
      setRecords((prev) => [newRecord, ...prev]);
      setRecordsSynced(false);
      const fallbackMsg =
        error instanceof Error ? error.message : "Guardado solo en local hasta que la API este disponible";
      setRecordsError((prevE) => prevE || fallbackMsg);
    }
  }

  return (
    <section className="modules">
      <div className="container">
        <p className="kicker">Tenant: {tenantSlugForVertical}</p>
        <h2>{systemPageContent.pageTitle}</h2>
        <p className="lead">{systemPageContent.pageDescription}</p>
        {showDemoWelcome ? (
          <DemoTenantSystemWelcome activeSystemKey={activeSystemKey} session={session} navigate={navigate} />
        ) : null}
        <div className="hero-card">
          <h3>Resultados que buscas en {selectedSystem.label}</h3>
          <ul>
            {systemPageContent.highlights.map((item) => (
              <li key={`${activeSystemKey}-${item}`}>{item}</li>
            ))}
          </ul>
        </div>
        <section className="system-kpis">
          {systemPageContent.kpis.map((kpi) => (
            <article className="card" key={`${activeSystemKey}-${kpi.label}`}>
              <p className="kpi-label">{kpi.label}</p>
              <p className="kpi-value">{kpi.value}</p>
            </article>
          ))}
        </section>
        {!showDemoWelcome ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate("/")}>
              {hideVerticalSwitcher ? "Inicio" : "Volver a sistemas"}
            </button>
            {session?.token ? (
              <button type="button" className="btn btn-outline" onClick={() => navigate("/app/dashboard")}>
                Abrir app real (/api/v1)
              </button>
            ) : null}
            <button
              type="button"
              className="btn"
              onClick={() => navigate(`/vista/${encodeURIComponent(activeSystemKey)}`)}
            >
              Vista previa del panel (mockup)
            </button>
          </div>
        ) : null}
        {!hideVerticalSwitcher ? (
          <div className="system-switcher">
            {sistemaSwitcherEntries.map(([systemKey, systemInfo]) => (
              <button
                key={systemKey}
                type="button"
                className={`system-btn${activeSystemKey === systemKey ? " active" : ""}`}
                onClick={() => navigate(`/sistema/${encodeURIComponent(systemKey)}`)}
              >
                {systemInfo.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="lead" style={{ marginTop: "0.75rem" }}>
            Sesión activa: no puedes cambiar de vertical; solo el panel de tu negocio (
            <strong>{selectedSystem.label}</strong>
            ).
          </p>
        )}
        <p className="lead">
          Esta vista muestra cómo trabaja Dakinis adaptado a <strong>{selectedSystem.label}</strong>: agendas, datos de
          clientes y avisos, sin exponer aspectos internos para visitantes que exploran la demo.
        </p>

        <h3>Operacion diaria del negocio</h3>
        <div className="module-grid">
          {systemPageContent.workflow.map((block) => (
            <article className="card" key={`${activeSystemKey}-${block.title}`}>
              <h3>{block.title}</h3>
              <ul>
                {block.items.map((item) => (
                  <li key={`${block.title}-${item}`}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <h3>Automatizaciones activas</h3>
        <div className="two-col">
          <article className="card">
            <ul>
              {systemPageContent.automations.map((automation) => (
                <li key={`${activeSystemKey}-${automation}`}>{automation}</li>
              ))}
            </ul>
          </article>
          <article className="card">
            <h3>Acciones rapidas</h3>
            <div className="pill-grid">
              {systemPageContent.quickActions.map((action) => (
                <span key={`${activeSystemKey}-${action}`}>{action}</span>
              ))}
            </div>
          </article>
        </div>

        {systemPageContent.suppliersProducts ? (
          <>
            <h3>{systemPageContent.suppliersProducts.sectionTitle}</h3>
            <p className="lead">{systemPageContent.suppliersProducts.sectionLead}</p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1rem",
                marginBottom: "1.25rem"
              }}
            >
              <article className="card" style={{ overflow: "auto" }}>
                <h4>Proveedores o aliados</h4>
                <table className="mockup-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Contacto</th>
                      <th>Ámbito</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systemPageContent.suppliersProducts.supplierRows.map((row, i) => (
                      <tr key={`sup-${activeSystemKey}-${i}`}>
                        <td>{row.name}</td>
                        <td>{row.contact}</td>
                        <td>{row.niche}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>
              <article className="card" style={{ overflow: "auto" }}>
                <h4>Productos o servicios por proveedor</h4>
                <table className="mockup-table">
                  <thead>
                    <tr>
                      <th>Proveedor</th>
                      <th>Ítem</th>
                      <th>Ref.</th>
                      <th>Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {systemPageContent.suppliersProducts.productRows.map((row, i) => (
                      <tr key={`prod-${activeSystemKey}-${i}`}>
                        <td>{row.supplier}</td>
                        <td>{row.product}</td>
                        <td>{row.reference}</td>
                        <td>{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>
            </div>

            <SupplyDeliveriesAndAlerts
              apiSession={apiSession}
              tenantSlugForVertical={tenantSlugForVertical}
              activeSystemKey={activeSystemKey}
              supplierNames={systemPageContent.suppliersProducts.supplierRows.map((r) => r.name)}
              productRefs={systemPageContent.suppliersProducts.productRows.map((r) => r.reference)}
              fallbackDeliveries={systemPageContent.suppliersProducts.incomingDeliveries ?? []}
              fallbackAlerts={systemPageContent.suppliersProducts.merchandiseAlerts ?? []}
            />
          </>
        ) : null}

        {activeSystemKey === "restaurante" ? (
          <RestaurantStockSection
            apiSession={apiSession}
            tenantSlugForVertical={tenantSlugForVertical}
            activeSystemKey={activeSystemKey}
          />
        ) : null}

        <h3>Carga de datos (persistencia por tenant)</h3>
        {recordsError ? (
          <p className="lead" style={{ color: "#fdba74" }}>
            API registros: {recordsError}. Mostrando local o datos mixtos.
          </p>
        ) : recordsSynced ? (
          <p className="lead">Últimos datos guardados en tu espacio demo y listos para usar en pantalla.</p>
        ) : null}

        <form className="mockup-form card" onSubmit={dakinisHandleMockSubmit}>
          {activeMockup.formFields.map((field) => (
            <label className="mockup-field" key={`${activeSystemKey}-${field.key}`}>
              <span>{field.label}</span>
              {field.type === "select" ? (
                <select
                  value={mockFormValues[field.key] || ""}
                  onChange={(event) => dakinisHandleMockFieldChange(field.key, event.target.value)}
                >
                  {(field.options || []).map((option) => (
                    <option key={`${field.key}-${option}`} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder || ""}
                  value={mockFormValues[field.key] || ""}
                  onChange={(event) => dakinisHandleMockFieldChange(field.key, event.target.value)}
                  required
                />
              )}
            </label>
          ))}
          <button type="submit" className="btn">
            Guardar {activeMockup.entityLabel}
          </button>
        </form>

        <h3>Listado desde base de datos</h3>
        <article className="card">
          {records.length === 0 ? (
            <p className="lead">Sin registros aun para este tenant.</p>
          ) : (
            <div className="mockup-table-wrap">
              <table className="mockup-table">
                <thead>
                  <tr>
                    {activeMockup.tableColumns.map((column) => (
                      <th key={`${activeSystemKey}-${column.key}`}>{column.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      {activeMockup.tableColumns.map((column) => (
                        <td key={`${record.id}-${column.key}`}>{record[column.key] || "-"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <TenantTeamSection
          session={session}
          apiSession={apiSession}
          tenantSlugForVertical={tenantSlugForVertical}
          activeSystemKey={activeSystemKey}
        />

        <h3>Tu sistema incluye</h3>
        <p className="lead">
          Piezas funcionales disponibles para tu tipo de negocio; el detalle técnico y la parametrización quedan bajo tu
          control en la implementación.
        </p>
        <div className="module-grid">
          {selectedSystem.modules.map((moduleInfo) => (
            <article className="card" key={`biz-${moduleInfo.title}`}>
              <h3>{moduleInfo.title}</h3>
              <ul>
                {moduleInfo.features.map((feature) => (
                  <li key={`${moduleInfo.title}-${feature}`}>{feature}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <section className="cta">
          <div className="cta-card">
            <img src={DAKINIS_LOGO_SIMPLE} alt="Isotipo Dakinis" className="cta-logo" width={48} height={48} />
            <div>
              <h2>{selectedSystem.label}</h2>
              <p>Un panel por cliente, datos aislados.</p>
            </div>
            <a href="https://wa.me/" className="btn">
              {systemPageContent.ctaLabel}
            </a>
          </div>
        </section>
      </div>
    </section>
  );
}
