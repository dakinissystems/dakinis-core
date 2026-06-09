import { useLocale } from "../../context/LocaleContext.jsx";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import { dakinisGetBusinessDashboardKpis } from "../../data/businessDemoContent.js";
import BusinessNavHero from "./BusinessNavHero.jsx";

export default function CommercialBusinessDashboard({ navigate }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const vertical = session?.business?.type || "clinica";
  const kpis = dakinisGetBusinessDashboardKpis(vertical);
  const businessName = session?.business?.name || t("businessDemo.dashboard.fallbackBusiness");

  return (
    <div className="commercial-business-dashboard">
      <BusinessNavHero navigate={navigate} />

      <div className="commercial-business-dashboard__welcome">
        <p className="kicker">{t("businessDemo.dashboard.kicker")}</p>
        <h2>{t("businessDemo.dashboard.greeting", { name: businessName })}</h2>
        <p className="lead">{t("businessDemo.dashboard.lead")}</p>
        <span className="mockup-badge">{t("commercial.executive.demoBadge")}</span>
      </div>

      <div className="commercial-business-dashboard__kpis">
        <article className="card commercial-kpi-card">
          <p className="kpi-label">{t("businessDemo.dashboard.activeClients")}</p>
          <p className="kpi-value">{kpis.activeClients}</p>
        </article>
        <article className="card commercial-kpi-card">
          <p className="kpi-label">{t("businessDemo.dashboard.monthSales")}</p>
          <p className="kpi-value">{kpis.monthSales}</p>
        </article>
        <article className="card commercial-kpi-card">
          <p className="kpi-label">{t("businessDemo.dashboard.products")}</p>
          <p className="kpi-value">{kpis.products}</p>
        </article>
        <article className="card commercial-kpi-card">
          <p className="kpi-label">{t("businessDemo.dashboard.conversion")}</p>
          <p className="kpi-value">{kpis.conversion}</p>
        </article>
      </div>

      {kpis.alerts?.length ? (
        <article className="card commercial-business-dashboard__alerts">
          <h3 style={{ marginTop: 0 }}>{t("commercial.executive.alertsTitle")}</h3>
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

      <div className="commercial-business-dashboard__actions">
        <button type="button" className="btn" onClick={() => navigate("/app/ventas")}>
          {t("businessDemo.dashboard.ctaPipeline")}
        </button>
        <button type="button" className="btn btn-outline" onClick={() => navigate("/app/whatsapp")}>
          {t("businessDemo.dashboard.ctaWhatsapp")}
        </button>
      </div>
    </div>
  );
}
