import { dakinisNormalizeCommercialPlan, dakinisPlanHasModule } from "@dakinis/shared/catalog/plan-modules.js";
import { dakinisGetSystemRegistry } from "@dakinis/shared/catalog/system-registry.js";
import { useLocale } from "../context/LocaleContext.jsx";

const dakinisSystemRegistry = dakinisGetSystemRegistry();

function dakinisGreetingName(session) {
  const email = String(session?.user?.email || "").trim();
  if (!email) return "";
  const local = email.split("@")[0] || "";
  const part = local.split(/[._-]/)[0] || "";
  if (!part) return "";
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

function dakinisGreetingPeriod(locale) {
  const hour = new Date().getHours();
  if (locale === "en") {
    if (hour < 12) return "morning";
    if (hour < 20) return "afternoon";
    return "evening";
  }
  if (hour < 12) return "morning";
  if (hour < 20) return "afternoon";
  return "evening";
}

function dakinisCountApplicationTiles(tiles, session) {
  return tiles.filter((tile) => {
    if (tile.status === "roadmap") return false;
    if (tile.id === "my-business" && (!session?.business?.type || !dakinisSystemRegistry[session.business.type])) {
      return false;
    }
    if (tile.id === "inventory" && session?.business?.type !== "restaurante") return false;
    return true;
  }).length;
}

/**
 * @param {{
 *   session: object,
 *   applicationTiles: object[],
 *   marketplaceCount: number,
 *   navigate: (path: string) => void
 * }} props
 */
export default function HubDashboard({ session, applicationTiles, marketplaceCount, navigate }) {
  const { t, locale } = useLocale();
  const name = dakinisGreetingName(session);
  const period = dakinisGreetingPeriod(locale);
  const greeting = t(`hub.dashboard.greeting.${period}`, { name: name || t("hub.dashboard.guestName") });
  const tenantLabel = session?.business?.name || t("hub.dashboard.tenantUnknown");
  const appCount = dakinisCountApplicationTiles(applicationTiles, session);
  const plan = dakinisNormalizeCommercialPlan(session?.business?.plan);
  const canWhatsApp = dakinisPlanHasModule(plan, "whatsapp");
  const canCrm = dakinisPlanHasModule(plan, "crm");
  const vertical = session?.business?.type;
  const inventoryPath =
    vertical === "restaurante" ? `/sistema/${encodeURIComponent(vertical)}` : "/app/dashboard";

  const quickActions = [
    {
      id: "client",
      label: t("hub.dashboard.actionNewClient"),
      path: "/app/crm",
      disabled: !canCrm
    },
    {
      id: "order",
      label: t("hub.dashboard.actionNewOrder"),
      path: inventoryPath,
      disabled: false
    },
    {
      id: "whatsapp",
      label: t("hub.dashboard.actionSendWhatsApp"),
      path: "/app/whatsapp",
      disabled: !canWhatsApp
    },
    {
      id: "inventory",
      label: t("hub.dashboard.actionOpenInventory"),
      path: inventoryPath,
      disabled: vertical !== "restaurante"
    }
  ];

  return (
    <div className="hub-dashboard card">
      <div className="hub-dashboard__head">
        <div>
          <h3 className="hub-dashboard__greeting">{greeting}</h3>
          <ul className="hub-dashboard__stats">
            <li>{t("hub.dashboard.statModules", { count: appCount })}</li>
            <li>{t("hub.dashboard.statIntegrations", { count: marketplaceCount })}</li>
            <li>{t("hub.dashboard.statBusiness", { name: tenantLabel })}</li>
          </ul>
        </div>
      </div>
      <div className="hub-dashboard__actions">
        <p className="kpi-label">{t("hub.dashboard.quickActions")}</p>
        <div className="hub-dashboard__action-row">
          {quickActions.map((action) => (
            <button
              key={action.id}
              type="button"
              className="btn btn-outline"
              disabled={action.disabled}
              onClick={() => !action.disabled && navigate(action.path)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
