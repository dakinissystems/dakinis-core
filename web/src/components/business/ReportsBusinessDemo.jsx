import { useLocale } from "../../context/LocaleContext.jsx";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import { DAKINIS_REPORTS_DEMO_SERIES } from "../../data/businessDemoContent.js";
import BusinessDemoOptionsMenu from "./BusinessDemoOptionsMenu.jsx";

const DAKINIS_REPORTS_KPIS = [
  { key: "revenue", value: "8.450 €", trendKey: "businessDemo.reports.trends.revenue" },
  { key: "orders", value: "186", trendKey: "businessDemo.reports.trends.orders" },
  { key: "avgTicket", value: "45,40 €", trendKey: "businessDemo.reports.trends.avgTicket" }
];

export default function ReportsBusinessDemo() {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const max = Math.max(...DAKINIS_REPORTS_DEMO_SERIES.map((s) => s.value), 1);
  const businessName = session?.business?.name || t("businessDemo.dashboard.fallbackBusiness");

  return (
    <div className="reports-business-demo">
      <div className="reports-business-demo__kpis">
        {DAKINIS_REPORTS_KPIS.map((item) => (
          <article key={item.key} className="card commercial-kpi-card commercial-kpi-card--reports">
            <p className="kpi-label">{t(`businessDemo.reports.${item.key}`)}</p>
            <p className="kpi-value">{item.value}</p>
            <p className="commercial-kpi-card__trend commercial-kpi-card__trend--up">{t(item.trendKey)}</p>
          </article>
        ))}
      </div>

      <article className="card reports-business-demo__chart">
        <header className="reports-business-demo__head">
          <div>
            <p className="kicker">{businessName}</p>
            <h3>{t("businessDemo.reports.chartTitle")}</h3>
            <p className="kpi-label">{t("businessDemo.reports.chartLead")}</p>
          </div>
          <div className="reports-business-demo__head-actions">
            <span className="reports-business-demo__period">{t("businessDemo.reports.periodLabel")}</span>
            <BusinessDemoOptionsMenu context="reports" subjectName={businessName} />
          </div>
        </header>
        <div className="reports-chart" role="img" aria-label={t("businessDemo.reports.chartAria")}>
          {DAKINIS_REPORTS_DEMO_SERIES.map((point) => (
            <div key={point.label} className="reports-chart__bar-wrap">
              <span className="reports-chart__value">{point.value}%</span>
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
