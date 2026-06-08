import { dakinisGetDemoCommercialMetrics } from "../../data/demoCommercialContent.js";
import { useLocale } from "../../context/LocaleContext.jsx";

export default function ExecutiveDashboardPanel({ verticalKey, compact = false }) {
  const { t } = useLocale();
  const metrics = dakinisGetDemoCommercialMetrics(verticalKey);

  return (
    <section className={`executive-dashboard${compact ? " executive-dashboard--compact" : ""}`}>
      <div className="executive-dashboard__head">
        <div>
          <p className="kicker">{t("commercial.executive.kicker")}</p>
          <h3 style={{ margin: "0.25rem 0 0" }}>{t("commercial.executive.title")}</h3>
          {!compact ? (
            <p className="lead" style={{ margin: "0.35rem 0 0", fontSize: "0.95rem" }}>
              {t("commercial.executive.lead")}
            </p>
          ) : null}
        </div>
        <span className="mockup-badge">{t("commercial.executive.demoBadge")}</span>
      </div>

      <div className="executive-dashboard__kpis">
        <article className="card executive-dashboard__kpi">
          <p className="kpi-label">{t("commercial.executive.monthSales")}</p>
          <p className="kpi-value">{metrics.monthSales}</p>
        </article>
        <article className="card executive-dashboard__kpi">
          <p className="kpi-label">{t("commercial.executive.newClients")}</p>
          <p className="kpi-value">{metrics.newClients}</p>
        </article>
        <article className="card executive-dashboard__kpi">
          <p className="kpi-label">{t("commercial.executive.topProduct")}</p>
          <p className="kpi-value executive-dashboard__kpi-text">{metrics.topProduct}</p>
        </article>
        <article className="card executive-dashboard__kpi">
          <p className="kpi-label">{t("commercial.executive.estimatedProfit")}</p>
          <p className="kpi-value">{metrics.estimatedProfit}</p>
        </article>
      </div>

      <article className="card executive-dashboard__alerts">
        <h4 style={{ marginTop: 0 }}>{t("commercial.executive.alertsTitle")}</h4>
        <ul className="executive-dashboard__alert-list">
          {metrics.alerts.map((alert) => (
            <li key={alert.text} className={`executive-dashboard__alert executive-dashboard__alert--${alert.severity}`}>
              {alert.text}
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
