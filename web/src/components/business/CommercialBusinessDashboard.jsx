import { useLocale } from "../../context/LocaleContext.jsx";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import { dakinisGetBusinessDashboardKpis } from "../../data/businessDemoContent.js";
import BusinessNavHero from "./BusinessNavHero.jsx";
import BusinessDemoOptionsMenu from "./BusinessDemoOptionsMenu.jsx";

const DAKINIS_DASHBOARD_KPI_META = [
  { key: "activeClients", trendKey: "businessDemo.dashboard.trends.clients", accent: "clients" },
  { key: "monthSales", trendKey: "businessDemo.dashboard.trends.sales", accent: "sales" },
  { key: "products", trendKey: "businessDemo.dashboard.trends.products", accent: "products" },
  { key: "conversion", trendKey: "businessDemo.dashboard.trends.conversion", accent: "conversion" }
];

export default function CommercialBusinessDashboard({ navigate }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const vertical = session?.business?.type || "clinica";
  const kpis = dakinisGetBusinessDashboardKpis(vertical);
  const businessName = session?.business?.name || t("businessDemo.dashboard.fallbackBusiness");

  return (
    <div className="commercial-business-dashboard">
      <BusinessNavHero navigate={navigate} />

      <header className="card commercial-business-dashboard__welcome">
        <div className="commercial-business-dashboard__welcome-copy">
          <p className="kicker">{t("businessDemo.dashboard.kicker")}</p>
          <h2>{t("businessDemo.dashboard.greeting", { name: businessName })}</h2>
          <p className="lead">{t("businessDemo.dashboard.lead")}</p>
        </div>
        <div className="commercial-business-dashboard__welcome-meta">
          <span className="mockup-badge">{t("commercial.executive.demoBadge")}</span>
          <BusinessDemoOptionsMenu context="dashboard" subjectName={businessName} />
        </div>
      </header>

      <div className="commercial-business-dashboard__kpis">
        {DAKINIS_DASHBOARD_KPI_META.map((meta) => (
          <article
            key={meta.key}
            className={`card commercial-kpi-card commercial-kpi-card--${meta.accent}`}
          >
            <p className="kpi-label">{t(`businessDemo.dashboard.${meta.key}`)}</p>
            <p className="kpi-value">{kpis[meta.key]}</p>
            <p className="commercial-kpi-card__trend commercial-kpi-card__trend--up">
              {t(meta.trendKey)}
            </p>
          </article>
        ))}
      </div>

      {kpis.alerts?.length ? (
        <article className="card commercial-business-dashboard__alerts">
          <h3>{t("commercial.executive.alertsTitle")}</h3>
          <ul className="executive-dashboard__alert-list">
            {kpis.alerts.map((alert) => (
              <li
                key={alert.text}
                className={`executive-dashboard__alert executive-dashboard__alert--${alert.severity}`}
              >
                {alert.text}
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      <div className="commercial-business-dashboard__insights card">
        <h3>{t("businessDemo.dashboard.insightsTitle")}</h3>
        <ul className="commercial-business-dashboard__insight-list">
          {t("businessDemo.dashboard.insights").map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <div className="commercial-business-dashboard__actions">
        <button
          type="button"
          className="btn"
          onClick={() => navigate(`/sistema/${encodeURIComponent(vertical)}`)}
        >
          {vertical === "restaurante"
            ? t("businessDemo.dashboard.ctaRestaurant")
            : t("businessDemo.dashboard.ctaOperations")}
        </button>
        <button type="button" className="btn btn-outline" onClick={() => navigate("/app/ventas")}>
          {t("businessDemo.dashboard.ctaPipeline")}
        </button>
        <button type="button" className="btn btn-outline" onClick={() => navigate("/app/whatsapp")}>
          {t("businessDemo.dashboard.ctaWhatsapp")}
        </button>
        <button type="button" className="btn btn-outline" onClick={() => navigate("/app/reportes")}>
          {t("appNav.reports")}
        </button>
      </div>
    </div>
  );
}
