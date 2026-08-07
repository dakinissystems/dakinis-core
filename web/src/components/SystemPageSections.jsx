import DemoTenantSystemWelcome from "./DemoTenantSystemWelcome.jsx";
import SupplyDeliveriesAndAlerts from "./SupplyDeliveriesAndAlerts.jsx";
import InventoryLotsPanel from "./InventoryLotsPanel.jsx";
import TenantTeamSection from "./TenantTeamSection.jsx";
import RestaurantComandasSection from "./RestaurantComandasSection.jsx";
import RestaurantAdminPanel from "./RestaurantAdminPanel.jsx";
import RestaurantTaskDock from "./RestaurantTaskDock.jsx";
import RestaurantOpsHeader from "./RestaurantOpsHeader.jsx";
import RestaurantInventoryModule from "./RestaurantInventoryModule.jsx";
import RestaurantDeliveryPanel from "./RestaurantDeliveryPanel.jsx";
import RestaurantBusinessIntro from "./business/RestaurantBusinessIntro.jsx";
import PasswordInput from "./PasswordInput.jsx";
import { DAKINIS_LOGO_SIMPLE } from "../config/brand-assets.js";
import { dakinisEffectiveTenantSlug } from "../utils/tenantSlug.js";

const TASK_LABEL_KEYS = {
  sala: "restaurant.taskSala",
  cocina: "restaurant.taskCocina",
  inventario: "restaurant.taskInventario",
  delivery: "restaurant.taskDelivery",
  caja: "restaurant.taskCaja",
  config: "restaurant.taskConfig"
};

export function SystemPageHeader({
  t,
  showDemoWelcome,
  session,
  selectedSystem,
  systemPageContent,
  activeSystemKey,
  tenantSlugForVertical,
  navigate,
  hideVerticalSwitcher,
  sistemaSwitcherEntries
}) {
  return (
    <>
      <p className="kicker">
        {showDemoWelcome
          ? t("system.businessKicker", { name: session.business?.name || selectedSystem.label })
          : t("system.tenant", { slug: tenantSlugForVertical })}
      </p>
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
            <button type="button" className="btn" onClick={() => navigate("/app/dashboard")}>
              {t("system.openDashboard")}
            </button>
          ) : null}
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
      <p className="lead">{t("system.adaptedLead", { label: selectedSystem.label })}</p>
    </>
  );
}

export function SystemPageWorkflowSection({ t, activeSystemKey, systemPageContent }) {
  return (
    <>
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
    </>
  );
}

export function SystemPageSuppliersSection({
  t,
  systemPageContent,
  activeSystemKey,
  apiSession,
  tenantSlugForVertical
}) {
  if (!systemPageContent.suppliersProducts || activeSystemKey === "restaurante") return null;

  return (
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
              {systemPageContent.suppliersProducts.supplierRows.map((row) => (
                <tr key={`sup-${activeSystemKey}-${row.name}`}>
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
              {systemPageContent.suppliersProducts.productRows.map((row) => (
                <tr key={`prod-${activeSystemKey}-${row.reference}-${row.product}`}>
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
  );
}

export function SystemPageRestauranteSection({
  activeSystemKey,
  showDemoWelcome,
  session,
  dakinisIsSeedDemoTenantSession,
  restaurantTask,
  setRestaurantTask,
  taskSub,
  isRestaurantOps,
  openCommercialMode,
  apiSession,
  tenantSlugForVertical,
  systemPageContent,
  t
}) {
  if (activeSystemKey !== "restaurante") return null;

  const businessName =
    session?.business?.name || systemPageContent?.pageTitle || t("restaurant.businessKicker");
  const crumb = ["Restaurante", t(TASK_LABEL_KEYS[restaurantTask] || "restaurant.taskSala")];

  const moduleBody = (() => {
    switch (restaurantTask) {
      case "cocina":
        return (
          <RestaurantComandasSection
            apiSession={apiSession}
            tenantSlugForVertical={tenantSlugForVertical}
            activeSystemKey={activeSystemKey}
            staffRole="cocina"
            opsMode
          />
        );
      case "inventario":
        return (
          <RestaurantInventoryModule
            apiSession={apiSession}
            tenantSlugForVertical={tenantSlugForVertical}
            activeSystemKey={activeSystemKey}
            systemPageContent={systemPageContent}
            initialSub={taskSub}
          />
        );
      case "delivery":
        return (
          <RestaurantDeliveryPanel
            apiSession={apiSession}
            fetchOpts={{
              businessId: dakinisEffectiveTenantSlug(apiSession, tenantSlugForVertical),
              businessTypeHeader: activeSystemKey
            }}
            t={t}
          />
        );
      case "caja":
        return (
          <RestaurantComandasSection
            apiSession={apiSession}
            tenantSlugForVertical={tenantSlugForVertical}
            activeSystemKey={activeSystemKey}
            staffRole="admin"
            opsMode
          />
        );
      case "config":
        return (
          <RestaurantAdminPanel
            apiSession={apiSession}
            tenantSlugForVertical={tenantSlugForVertical}
            activeSystemKey={activeSystemKey}
            systemPageContent={systemPageContent}
            sections={
              String(taskSub || "").toLowerCase() === "allergens" ||
              String(taskSub || "").toLowerCase() === "alergenos"
                ? ["allergens", "floor", "menu", "supply"]
                : ["floor", "menu", "supply", "allergens"]
            }
          />
        );
      case "sala":
      default:
        return (
          <RestaurantComandasSection
            apiSession={apiSession}
            tenantSlugForVertical={tenantSlugForVertical}
            activeSystemKey={activeSystemKey}
            staffRole="camarero"
            opsMode
          />
        );
    }
  })();

  if (isRestaurantOps) {
    return (
      <div className="restaurant-ops">
        <RestaurantOpsHeader
          businessName={businessName}
          breadcrumb={crumb}
          showCommercialLink={Boolean(showDemoWelcome || dakinisIsSeedDemoTenantSession?.(session))}
          onShowCommercial={openCommercialMode}
          stats={[]}
        />
        <RestaurantTaskDock task={restaurantTask} onTaskChange={setRestaurantTask} />
        <div className="restaurant-ops__module">{moduleBody}</div>
      </div>
    );
  }

  return (
    <>
      {showDemoWelcome || dakinisIsSeedDemoTenantSession(session) ? <RestaurantBusinessIntro /> : null}
      <RestaurantTaskDock task={restaurantTask} onTaskChange={setRestaurantTask} />
      <div className="restaurant-ops__module">{moduleBody}</div>
    </>
  );
}

export function SystemPageRecordsSection({
  t,
  activeSystemKey,
  showDemoWelcome,
  recordsError,
  recordsSynced,
  activeMockup,
  mockFormValues,
  dakinisHandleMockFieldChange,
  dakinisHandleMockSubmit,
  records,
  session,
  apiSession,
  tenantSlugForVertical
}) {
  if (activeSystemKey === "restaurante") return null;

  return (
    <>
      <h3>{showDemoWelcome ? t("system.dataSectionDemo") : t("system.dataLoad")}</h3>
      {recordsError ? (
        <p className="lead" style={{ color: "#fdba74" }}>
          {showDemoWelcome ? t("system.recordsErrorFriendly") : t("system.recordsError", { error: recordsError })}
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
    </>
  );
}

export function SystemPageModulesFooter({ t, selectedSystem, systemPageContent, activeSystemKey, navigate }) {
  return (
    <>
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
          <button type="button" className="btn" onClick={() => navigate(`/demo/${activeSystemKey}`)}>
            {systemPageContent.ctaLabel}
          </button>
        </div>
      </section>
    </>
  );
}
