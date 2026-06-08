import { useCallback, useEffect, useMemo, useState } from "react";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisGetSystemRegistry } from "@dakinis/shared/catalog/system-registry.js";
import {
  DAKINIS_BUSINESS_SLUG_BY_VERTICAL,
  DAKINIS_ENTITY_BY_VERTICAL
} from "@dakinis/shared/catalog/business-mapping.js";
import { dakinisGetSystemPageContent } from "../data/getSystemPageContent.js";
import { DAKINIS_SYSTEM_MOCKUPS, dakinisBuildDefaultFormValues } from "../data/systemPages.js";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisTenantJsonFetch } from "../services/api.js";
import DemoTenantSystemWelcome from "../components/DemoTenantSystemWelcome.jsx";
import SupplyDeliveriesAndAlerts from "../components/SupplyDeliveriesAndAlerts.jsx";
import InventoryLotsPanel from "../components/InventoryLotsPanel.jsx";
import TenantTeamSection from "../components/TenantTeamSection.jsx";
import RestaurantStockSection from "../components/RestaurantStockSection.jsx";
import RestaurantComandasSection from "../components/RestaurantComandasSection.jsx";
import RestaurantAdminPanel from "../components/RestaurantAdminPanel.jsx";
import RestaurantRoleNav, {
  dakinisReadRestaurantRole,
  dakinisWriteRestaurantRole
} from "../components/RestaurantRoleNav.jsx";
import { dakinisIsSeedDemoTenantSession } from "../utils/demoSession.js";
import PasswordInput from "../components/PasswordInput.jsx";

import { DAKINIS_LOGO_SIMPLE } from "../config/brand-assets.js";
import { DAKINIS_CONTACT_WHATSAPP_URL } from "../config/contact-urls.js";
const dakinisSystemRegistry = dakinisGetSystemRegistry();

export default function SystemPage({ activeSystemKey, navigate }) {
  const { session } = useDakinisSession();
  const { locale, t } = useLocale();

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
  const systemPageContent = dakinisGetSystemPageContent(locale, activeSystemKey);
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
  const [restaurantRole, setRestaurantRole] = useState(dakinisReadRestaurantRole);

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
        setRecordsError(error instanceof Error ? error.message : t("system.recordsLoadError"));
        setRecordsSynced(false);
      }
    },
    [apiSession, entityName, tenantSlugForVertical, activeSystemKey]
  );

  useEffect(() => {
    if (!session?.token) {
      setRecordsError("");
      setRecordsSynced(false);
      return undefined;
    }
    const controller = new AbortController();
    reloadRecordsFromApi(controller.signal);
    return () => controller.abort();
  }, [reloadRecordsFromApi, session?.token]);

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
        error instanceof Error ? error.message : t("system.saveLocalFallback");
      setRecordsError((prevE) => prevE || fallbackMsg);
    }
  }

  return (
    <section className="modules">
      <div className="container">
        <p className="kicker">{t("system.tenant", { slug: tenantSlugForVertical })}</p>
        <h2>{systemPageContent.pageTitle}</h2>
        <p className="lead">{systemPageContent.pageDescription}</p>
        {showDemoWelcome ? (
          <DemoTenantSystemWelcome activeSystemKey={activeSystemKey} session={session} navigate={navigate} />
        ) : null}
        <div className="hero-card">
          <h3>{t("system.resultsTitle", { label: selectedSystem.label })}</h3>
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
          <div className="system-page-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate("/")}>
              {hideVerticalSwitcher ? t("system.home") : t("system.backToSystems")}
            </button>
            {session?.token ? (
              <button type="button" className="btn btn-outline" onClick={() => navigate("/app/dashboard")}>
                {t("system.openRealApp")}
              </button>
            ) : null}
            <button
              type="button"
              className="btn"
              onClick={() => navigate(`/vista/${encodeURIComponent(activeSystemKey)}`)}
            >
              {t("system.mockupPreview")}
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
            {t("system.sessionLocked", { label: selectedSystem.label })}
          </p>
        )}
        <p className="lead">
          {t("system.adaptedLead", { label: selectedSystem.label })}
        </p>

        <h3>{t("system.dailyOps")}</h3>
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

        <h3>{t("system.automations")}</h3>
        <div className="two-col">
          <article className="card">
            <ul>
              {systemPageContent.automations.map((automation) => (
                <li key={`${activeSystemKey}-${automation}`}>{automation}</li>
              ))}
            </ul>
          </article>
          <article className="card">
            <h3>{t("system.quickActions")}</h3>
            <div className="pill-grid">
              {systemPageContent.quickActions.map((action) => (
                <span key={`${activeSystemKey}-${action}`}>{action}</span>
              ))}
            </div>
          </article>
        </div>

        {systemPageContent.suppliersProducts && activeSystemKey !== "restaurante" ? (
          <>
            <h3>{systemPageContent.suppliersProducts.sectionTitle}</h3>
            <p className="lead">{systemPageContent.suppliersProducts.sectionLead}</p>
            <div className="system-suppliers-grid">
              <article className="card mockup-table-card">
                <h4>{t("system.suppliers")}</h4>
                <table className="mockup-table">
                  <thead>
                    <tr>
                      <th>{t("system.colName")}</th>
                      <th>{t("system.colContact")}</th>
                      <th>{t("system.colScope")}</th>
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
              <article className="card mockup-table-card">
                <h4>{t("system.products")}</h4>
                <table className="mockup-table">
                  <thead>
                    <tr>
                      <th>{t("system.colSupplier")}</th>
                      <th>{t("system.colItem")}</th>
                      <th>{t("system.colRef")}</th>
                      <th>{t("system.colNotes")}</th>
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

            <InventoryLotsPanel
              apiSession={apiSession}
              tenantSlugForVertical={tenantSlugForVertical}
              activeSystemKey={activeSystemKey}
            />
          </>
        ) : null}

        {activeSystemKey === "restaurante" ? (
          <>
            <RestaurantRoleNav
              role={restaurantRole}
              onRoleChange={(next) => {
                setRestaurantRole(next);
                dakinisWriteRestaurantRole(next);
              }}
            />
            {restaurantRole === "admin" ? (
              <RestaurantAdminPanel
                apiSession={apiSession}
                tenantSlugForVertical={tenantSlugForVertical}
                activeSystemKey={activeSystemKey}
                systemPageContent={systemPageContent}
              />
            ) : null}
            {restaurantRole === "cocina" ? (
              <RestaurantComandasSection
                apiSession={apiSession}
                tenantSlugForVertical={tenantSlugForVertical}
                activeSystemKey={activeSystemKey}
                role="cocina"
              />
            ) : null}
            {restaurantRole === "camarero" ? (
              <RestaurantComandasSection
                apiSession={apiSession}
                tenantSlugForVertical={tenantSlugForVertical}
                activeSystemKey={activeSystemKey}
                role="camarero"
              />
            ) : null}
          </>
        ) : null}

        <h3>{t("system.dataLoad")}</h3>
        {recordsError ? (
          <p className="lead" style={{ color: "#fdba74" }}>
            {t("system.recordsError", { error: recordsError })}
          </p>
        ) : recordsSynced ? (
          <p className="lead">{t("system.recordsSynced")}</p>
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
              ) : field.type === "password" ? (
                <PasswordInput
                  value={mockFormValues[field.key] || ""}
                  onChange={(event) => dakinisHandleMockFieldChange(field.key, event.target.value)}
                  placeholder={field.placeholder || ""}
                  autoComplete="new-password"
                  required
                />
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
            {t("system.saveEntity", { entity: activeMockup.entityLabel })}
          </button>
        </form>

        <h3>{t("system.listing")}</h3>
        <article className="card">
          {records.length === 0 ? (
            <p className="lead">{t("system.noRecords")}</p>
          ) : (
            <div className="mockup-table-wrap">
              <table className="mockup-table" data-stack="responsive">
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
                        <td key={`${record.id}-${column.key}`} data-label={column.label}>
                          {record[column.key] || "-"}
                        </td>
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

        <h3>{t("system.includes")}</h3>
        <p className="lead">{t("system.includesLead")}</p>
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
              <p>{t("system.ctaPanel")}</p>
            </div>
            <a href={DAKINIS_CONTACT_WHATSAPP_URL} className="btn" target="_blank" rel="noreferrer">
              {systemPageContent.ctaLabel}
            </a>
          </div>
        </section>
      </div>
    </section>
  );
}
