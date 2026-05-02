import { useCallback, useEffect, useMemo, useState } from "react";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisCreatePlatformModules } from "@dakinis/shared";
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
import { dakinisBuildModuleFunctionMap } from "../utils/moduleMap.js";

const logoSimple = "/Logo%20Simple.jpeg";
const dakinisSystemRegistry = dakinisGetSystemRegistry();

export default function SystemPage({ activeSystemKey, navigate }) {
  const { session } = useDakinisSession();

  const sistemaSwitcherEntries = useMemo(() => {
    const all = Object.entries(dakinisSystemRegistry);
    if (!session?.token) return all;
    if (session.user?.role === "platform_admin") return all;
    const tenantType = session.business?.type;
    if (tenantType) return all.filter(([key]) => key === tenantType);
    return all;
  }, [session]);
  const selectedSystem = dakinisSystemRegistry[activeSystemKey] || dakinisSystemRegistry.clinica;
  const systemPageContent =
    DAKINIS_SYSTEM_PAGE_CONTENT[activeSystemKey] || DAKINIS_SYSTEM_PAGE_CONTENT.clinica;
  const activeMockup = DAKINIS_SYSTEM_MOCKUPS[activeSystemKey] || DAKINIS_SYSTEM_MOCKUPS.clinica;
  const tenantSlugForVertical = DAKINIS_BUSINESS_SLUG_BY_VERTICAL[activeSystemKey];
  const entityName = DAKINIS_ENTITY_BY_VERTICAL[activeSystemKey];

  const apiSession = useMemo(() => {
    if (session?.token && session.business?.slug === tenantSlugForVertical) {
      return session;
    }
    return {
      token: undefined,
      business: { slug: tenantSlugForVertical, id: undefined }
    };
  }, [session, tenantSlugForVertical]);

  const [remoteConfig, setRemoteConfig] = useState(null);
  const [configStatus, setConfigStatus] = useState("idle");
  const [configError, setConfigError] = useState("");
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

  useEffect(() => {
    const controller = new AbortController();

    async function dakinisLoadRemoteConfig() {
      setConfigStatus("loading");
      setConfigError("");
      try {
        const json = await dakinisTenantJsonFetch("/api/config", apiSession, {
          signal: controller.signal,
          businessId: tenantSlugForVertical,
          businessTypeHeader: activeSystemKey
        });
        setRemoteConfig(json?.data?.config || null);
        setConfigStatus("success");
      } catch (error) {
        if (error.name === "AbortError") return;
        setRemoteConfig(null);
        setConfigStatus("error");
        setConfigError(error instanceof Error ? error.message : "Error de configuracion");
      }
    }

    dakinisLoadRemoteConfig();
    return () => controller.abort();
  }, [activeSystemKey, tenantSlugForVertical, apiSession]);

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

  const modules = useMemo(
    () =>
      dakinisCreatePlatformModules({
        ...selectedSystem.config,
        ...(remoteConfig ? { ...remoteConfig } : {}),
        dashboard: { currency: "EUR", ...(remoteConfig?.dashboard || {}) }
      }),
    [selectedSystem, remoteConfig]
  );

  const moduleFunctionMap = useMemo(() => dakinisBuildModuleFunctionMap(modules), [modules]);

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
        <button type="button" className="btn btn-outline" onClick={() => navigate("/")}>
          Volver a sistemas
        </button>
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
        <p className="lead">
          Vertical: {selectedSystem.label} | Slot {modules.config.agenda.slotMinutes} min | Cliente perdido:{" "}
          {modules.config.crm.lostClientDays} dias | Config API:{" "}
          {configStatus === "loading"
            ? "cargando..."
            : configStatus === "success"
              ? "tenant + tipo"
              : "fallback local"}
          {configStatus === "error" ? ` (${configError})` : ""}
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

        <h3>Carga de datos (persistencia por tenant)</h3>
        {recordsError ? (
          <p className="lead" style={{ color: "#fdba74" }}>
            API registros: {recordsError}. Mostrando local o datos mixtos.
          </p>
        ) : recordsSynced ? (
          <p className="lead">
            Registros leidos desde SQLite para este tenant y entidad <code>{entityName}</code>.
          </p>
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

        <h3>Integracion tecnica</h3>
        <p className="lead">
          Headers efectivos para esta vista: <code>x-business-id={tenantSlugForVertical}</code>
          {" + JWT o maestra "}
          <code>dakinis-dev-key</code>
        </p>
        <pre className="config-box">{JSON.stringify(modules.config, null, 2)}</pre>
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
          {Object.entries(moduleFunctionMap).map(([moduleName, functionNames]) => (
            <article className="card" key={`tech-${moduleName}`}>
              <h3>{moduleName}</h3>
              <ul>
                {functionNames.map((functionName) => (
                  <li key={`${moduleName}-${functionName}`}>{functionName}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <section className="cta">
          <div className="cta-card">
            <img src={logoSimple} alt="Isotipo Dakinis" className="cta-logo" />
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
