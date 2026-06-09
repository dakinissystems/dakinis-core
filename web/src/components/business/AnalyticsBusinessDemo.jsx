import { useMemo, useState } from "react";
import { useLocale } from "../../context/LocaleContext.jsx";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import { dakinisGetAnalyticsDemoData } from "../../data/businessDemoContent.js";
import BusinessDemoOptionsMenu from "./BusinessDemoOptionsMenu.jsx";

const DAKINIS_PERIOD_SCALE = { "7d": 0.35, "30d": 1, "90d": 2.4 };

export default function AnalyticsBusinessDemo({ benchmark: benchmarkProp = null }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const [period, setPeriod] = useState("30d");
  const vertical = session?.business?.type || "restaurante";
  const businessName = session?.business?.name || t("businessDemo.dashboard.fallbackBusiness");
  const base = useMemo(() => dakinisGetAnalyticsDemoData(vertical), [vertical]);
  const scale = DAKINIS_PERIOD_SCALE[period] ?? 1;

  const benchmark = benchmarkProp?.comparisons?.length ? benchmarkProp : base.benchmark;
  const series = useMemo(
    () => base.series.map((p) => ({ ...p, value: Math.round(p.value * scale) })),
    [base.series, scale]
  );
  const max = Math.max(...series.map((s) => s.value), 1);

  const kpis = useMemo(() => {
    const orders = Math.round(base.kpis.orders * scale);
    return [
      { key: "revenue", value: base.kpis.revenue, trendKey: "businessDemo.analytics.trends.revenue" },
      { key: "orders", value: String(orders), trendKey: "businessDemo.analytics.trends.orders" },
      { key: "avgTicket", value: base.kpis.avgTicket, trendKey: "businessDemo.analytics.trends.avgTicket" },
      { key: "conversion", value: base.kpis.conversion, trendKey: "businessDemo.analytics.trends.conversion" }
    ];
  }, [base.kpis, base.kpis.orders, scale]);

  return (
    <div className="analytics-demo">
      <div className="analytics-demo__toolbar">
        <div className="analytics-demo__period" role="tablist" aria-label={t("businessDemo.analytics.periodAria")}>
          {(["7d", "30d", "90d"]).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={period === id}
              className={`analytics-demo__period-btn${period === id ? " is-active" : ""}`}
              onClick={() => setPeriod(id)}
            >
              {t(`businessDemo.analytics.periods.${id}`)}
            </button>
          ))}
        </div>
        <BusinessDemoOptionsMenu context="reports" subjectName={businessName} />
      </div>

      <div className="analytics-demo__kpis">
        {kpis.map((item) => (
          <article key={item.key} className="card commercial-kpi-card commercial-kpi-card--reports">
            <p className="kpi-label">{t(`businessDemo.analytics.${item.key}`)}</p>
            <p className="kpi-value">{item.value}</p>
            <p className="commercial-kpi-card__trend commercial-kpi-card__trend--up">{t(item.trendKey)}</p>
          </article>
        ))}
      </div>

      <div className="analytics-demo__grid">
        <article className="card analytics-demo__panel">
          <header className="analytics-demo__panel-head">
            <h3>{t("businessDemo.analytics.salesTitle")}</h3>
            <p className="kpi-label">{t("businessDemo.analytics.salesLead")}</p>
          </header>
          <div className="reports-chart" role="img" aria-label={t("businessDemo.analytics.chartAria")}>
            {series.map((point) => (
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

        <article className="card analytics-demo__panel">
          <header className="analytics-demo__panel-head">
            <h3>{t("businessDemo.analytics.channelsTitle")}</h3>
            <p className="kpi-label">{t("businessDemo.analytics.channelsLead")}</p>
          </header>
          <ul className="analytics-channel-list">
            {base.channels.map((ch) => (
              <li key={ch.key} className="analytics-channel-list__item">
                <div className="analytics-channel-list__meta">
                  <span>{t(`businessDemo.analytics.channels.${ch.key}`)}</span>
                  <strong>{ch.amount}</strong>
                </div>
                <div className="analytics-channel-list__track" aria-hidden>
                  <span className="analytics-channel-list__fill" style={{ width: `${ch.pct}%` }} />
                </div>
                <span className="analytics-channel-list__pct">{ch.pct}%</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <article className="card analytics-demo__panel analytics-demo__funnel">
        <header className="analytics-demo__panel-head">
          <h3>{t("businessDemo.analytics.funnelTitle")}</h3>
          <p className="kpi-label">{t("businessDemo.analytics.funnelLead")}</p>
        </header>
        <ul className="analytics-funnel">
          {base.funnel.map((step) => (
            <li key={step.key} className="analytics-funnel__step">
              <div className="analytics-funnel__label">
                <span>{t(`businessDemo.analytics.funnel.${step.key}`)}</span>
                <strong>{step.count}</strong>
              </div>
              <div className="analytics-funnel__track" aria-hidden>
                <span className="analytics-funnel__fill" style={{ width: `${step.widthPct}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </article>

      <div className="analytics-demo__grid">
        <article className="card analytics-demo__panel">
          <header className="analytics-demo__panel-head">
            <h3>{t("businessDemo.analytics.benchmarkTitle")}</h3>
            <p className="kpi-label">
              {t("businessDemo.analytics.benchmarkLead", {
                industry: t(`businessDemo.analytics.industries.${base.industry}`)
              })}
            </p>
          </header>
          <ul className="analytics-benchmark-list">
            {benchmark.comparisons.slice(0, 5).map((row) => (
              <li key={row.key} className="analytics-benchmark-list__item">
                <div className="analytics-benchmark-list__head">
                  <span>{row.label}</span>
                  <span
                    className={`analytics-benchmark-list__delta${
                      row.deltaPct > 5 ? " analytics-benchmark-list__delta--up" : row.deltaPct < -5 ? " analytics-benchmark-list__delta--down" : ""
                    }`}
                  >
                    {row.deltaPct > 0 ? "+" : ""}
                    {row.deltaPct}%
                  </span>
                </div>
                <div className="analytics-benchmark-list__values">
                  <span>
                    {t("businessDemo.analytics.you")}: <strong>{row.tenantValue}{row.unit}</strong>
                  </span>
                  <span>
                    {t("businessDemo.analytics.sector")}: {row.sectorAverage}{row.unit}
                  </span>
                </div>
                <p className="analytics-benchmark-list__narrative">{row.narrative}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="card analytics-demo__panel">
          <header className="analytics-demo__panel-head">
            <h3>{t("businessDemo.analytics.topTitle")}</h3>
            <p className="kpi-label">{t("businessDemo.analytics.topLead")}</p>
          </header>
          <div className="analytics-top-grid">
            <div>
              <h4>{t("businessDemo.analytics.topProducts")}</h4>
              <ul className="analytics-top-list">
                {base.topProducts.map((row) => (
                  <li key={row.name}>
                    <span>{row.name}</span>
                    <span>
                      {row.value} · {row.share}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4>{t("businessDemo.analytics.topClients")}</h4>
              <ul className="analytics-top-list">
                {base.topClients.map((row) => (
                  <li key={row.name}>
                    <span>{row.name}</span>
                    <span>
                      {row.value} · {row.share}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
