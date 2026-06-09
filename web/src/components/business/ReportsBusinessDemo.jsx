import { useLocale } from "../../context/LocaleContext.jsx";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import { DAKINIS_REPORTS_DEMO_SERIES } from "../../data/businessDemoContent.js";

export default function ReportsBusinessDemo() {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const max = Math.max(...DAKINIS_REPORTS_DEMO_SERIES.map((s) => s.value), 1);

  return (
    <div className="reports-business-demo">
      <div className="reports-business-demo__kpis">
        <article className="card">
          <p className="kpi-label">{t("businessDemo.reports.revenue")}</p>
          <p className="kpi-value">8.450 €</p>
        </article>
        <article className="card">
          <p className="kpi-label">{t("businessDemo.reports.orders")}</p>
          <p className="kpi-value">186</p>
        </article>
        <article className="card">
          <p className="kpi-label">{t("businessDemo.reports.avgTicket")}</p>
          <p className="kpi-value">45,40 €</p>
        </article>
      </div>

      <article className="card reports-business-demo__chart">
        <h3 style={{ marginTop: 0 }}>{t("businessDemo.reports.chartTitle")}</h3>
        <p className="kpi-label">{session?.business?.name}</p>
        <div className="reports-chart" role="img" aria-label={t("businessDemo.reports.chartAria")}>
          {DAKINIS_REPORTS_DEMO_SERIES.map((point) => (
            <div key={point.label} className="reports-chart__bar-wrap">
              <div
                className="reports-chart__bar"
                style={{ height: `${Math.round((point.value / max) * 100)}%` }}
                title={`${point.label}: ${point.value}%`}
              />
              <span className="reports-chart__label">{point.label}</span>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
