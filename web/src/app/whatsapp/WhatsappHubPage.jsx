import { useLocation } from "react-router-dom";
import { useLocale } from "../../context/LocaleContext.jsx";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import WhatsappConversationsTab from "./WhatsappConversationsTab.jsx";
import WhatsappContactsTab from "./WhatsappContactsTab.jsx";
import WhatsappTemplatesTab from "./WhatsappTemplatesTab.jsx";
import WhatsappAutomationsTab from "./WhatsappAutomationsTab.jsx";
import WhatsappAiTab from "./WhatsappAiTab.jsx";
import BusinessNavHero from "../../components/business/BusinessNavHero.jsx";
import { dakinisIsBusinessDemoSession, dakinisIsBusinessFacingSession } from "../../utils/businessDemoMode.js";

const DAKINIS_WA_TABS = [
  { path: "/app/whatsapp/conversations", key: "conversations" },
  { path: "/app/whatsapp/contacts", key: "contacts" },
  { path: "/app/whatsapp/templates", key: "templates" },
  { path: "/app/whatsapp/automations", key: "automations" },
  { path: "/app/whatsapp/ai", key: "ai" }
];

export default function WhatsappHubPage({ navigate }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const location = useLocation();
  const businessName = session?.business?.name || "Dakinis";
  const isDemo = dakinisIsBusinessDemoSession(session);
  const isBusinessFacing = dakinisIsBusinessFacingSession(session);
  const visibleTabs = isDemo
    ? DAKINIS_WA_TABS.filter((tab) => tab.key === "conversations" || tab.key === "contacts")
    : DAKINIS_WA_TABS;

  const activeTab =
    DAKINIS_WA_TABS.find((tab) => location.pathname.startsWith(tab.path))?.key || "conversations";

  if (!session?.token) {
    return (
      <section className="modules comm-page">
        <div className="container">
          <h2>{t("app.whatsapp.title")}</h2>
          <p className="lead">{t("app.whatsapp.loginLead")}</p>
          <button className="btn" type="button" onClick={() => navigate("/login")}>
            {t("app.goLogin")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="modules comm-page wa-hub business-app-page">
      <div className="container">
        {isBusinessFacing ? <BusinessNavHero navigate={navigate} compact /> : null}
        <p className="kicker">{isBusinessFacing ? t("businessDemo.whatsapp.kicker") : t("app.whatsapp.kicker")}</p>
        <h2>{isBusinessFacing ? t("businessDemo.whatsapp.title") : t("app.whatsapp.heading")}</h2>
        <p className="lead">{isBusinessFacing ? t("businessDemo.whatsapp.pageLead") : t("app.whatsapp.lead")}</p>

        <nav className="wa-subnav" aria-label={t("app.whatsapp.navAria")}>
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`btn btn-outline${activeTab === tab.key ? " is-active" : ""}`}
              onClick={() => navigate(tab.path)}
            >
              {t(`app.whatsapp.nav.${tab.key}`)}
            </button>
          ))}
        </nav>

        <div className="wa-tab-panel card" style={{ marginTop: "1.25rem" }}>
          {activeTab === "conversations" ? <WhatsappConversationsTab t={t} demoMode={isDemo} /> : null}
          {activeTab === "contacts" ? <WhatsappContactsTab t={t} /> : null}
          {activeTab === "templates" ? (
            <WhatsappTemplatesTab t={t} businessName={businessName} />
          ) : null}
          {activeTab === "automations" ? <WhatsappAutomationsTab t={t} /> : null}
          {activeTab === "ai" ? <WhatsappAiTab t={t} /> : null}
        </div>

        <p className="kpi-label" style={{ marginTop: "1rem" }}>
          {t("app.communications.legalHint")}{" "}
          <button type="button" className="link-btn" onClick={() => navigate("/privacy")}>
            {t("app.communications.legalLink")}
          </button>
        </p>

        {!isDemo ? (
          <div className="system-page-actions" style={{ marginTop: "1.25rem" }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate("/app/crm")}>
              {t("app.crm.title")}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate("/hub")}>
              {t("appNav.hub")}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
