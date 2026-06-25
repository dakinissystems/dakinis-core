import { useEffect, useState } from "react";
import { useLocale } from "../../context/LocaleContext.jsx";
import BusinessNavHero from "../../components/business/BusinessNavHero.jsx";
import { dakinisIsBusinessFacingSession } from "../../utils/businessDemoMode.js";
import {
  dakinisTenantIndustryDashboard,
  dakinisTenantHealthScore,
  dakinisTenantAiSuggestions,
  dakinisTenantBenchmark,
  dakinisTenantGrowthScore,
  dakinisTenantRecommendations,
  dakinisTenantFinanceSummary
} from "../../services/tenant-intelligence.js";

export default function LiveTenantDashboard({ session, navigate }) {
  const { t } = useLocale();
  const [industryDash, setIndustryDash] = useState(null);
  const [health, setHealth] = useState(null);
  const [aiTips, setAiTips] = useState(null);
  const [benchmark, setBenchmark] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [finance, setFinance] = useState(null);

  useEffect(() => {
    if (!session?.token) return undefined;
    let cancelled = false;
    Promise.all([
      dakinisTenantIndustryDashboard(session),
      dakinisTenantHealthScore(session),
      dakinisTenantAiSuggestions(session).catch(() => null),
      dakinisTenantBenchmark(session).catch(() => null),
      dakinisTenantGrowthScore(session).catch(() => null),
      dakinisTenantRecommendations(session).catch(() => null),
      dakinisTenantFinanceSummary(session).catch(() => null)
    ])
      .then(([dashJson, healthJson, aiJson, benchJson, growthJson, recJson, finJson]) => {
        if (cancelled) return;
        setIndustryDash(dashJson?.data?.dashboard || null);
        setHealth(healthJson?.data?.health || null);
        setAiTips(aiJson?.data || null);
        setBenchmark(benchJson?.data?.benchmark || null);
        setGrowth(growthJson?.data?.growth || null);
        setRecommendations(recJson?.data?.recommendations || []);
        setFinance(finJson?.data?.summary || null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [session?.token, session?.business?.id]);

  const businessName = session.business?.name || t("businessDemo.dashboard.fallbackBusiness");
  const businessFacing = dakinisIsBusinessFacingSession(session);

  return (
    <section className="modules business-app-page">
      <div className="container">
        {businessFacing ? <BusinessNavHero navigate={navigate} /> : null}

        <p className="kicker">{t("app.dashboard.kicker", { name: businessName })}</p>
        <h2>{industryDash?.industry || t("app.dashboard.heading")}</h2>
        <p className="lead">{t("app.dashboard.lead")}</p>

        <div className="commercial-business-dashboard__kpis" style={{ marginTop: "1rem" }}>
          {health ? (
            <article className="card commercial-kpi-card">
              <p className="kpi-label">{t("app.dashboard.healthScore")}</p>
              <p className="kpi-value">{health.score}/100</p>
              <p className="kpi-label">{health.statusLabel}</p>
            </article>
          ) : null}
          {growth ? (
            <article className="card commercial-kpi-card">
              <p className="kpi-label">{t("app.dashboard.growthScore")}</p>
              <p className="kpi-value">{growth.score}/100</p>
              <p className="kpi-label">{growth.statusLabel}</p>
            </article>
          ) : null}
          {finance ? (
            <article className="card commercial-kpi-card">
              <p className="kpi-label">{t("app.dashboard.finance30d")}</p>
              <p className="kpi-value">{finance.income} €</p>
              <p className="kpi-label">
                {t("app.dashboard.margin", { pct: finance.marginPct })}
              </p>
            </article>
          ) : null}
          {industryDash?.kpis?.slice(0, 1).map((kpi) => (
            <article className="card commercial-kpi-card" key={kpi.key}>
              <p className="kpi-label">{kpi.label}</p>
              <p className="kpi-value">{kpi.value}</p>
            </article>
          ))}
        </div>

        {industryDash?.kpis?.length > 1 ? (
          <div className="module-grid" style={{ margin: "1rem 0" }}>
            {industryDash.kpis.slice(1).map((kpi) => (
              <article className="card" key={kpi.key}>
                <p className="kpi-label">{kpi.label}</p>
                <p className="kpi-value">{kpi.value}</p>
              </article>
            ))}
          </div>
        ) : null}

        {aiTips?.suggestions?.length ? (
          <div className="card" style={{ marginTop: "1rem" }}>
            <h3>{t("app.dashboard.aiSuggestions")}</h3>
            <ul>
              {aiTips.suggestions.map((item) => (
                <li key={item.id}>
                  <strong>{item.question}</strong> — {item.answer}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {benchmark ? (
          <div className="card" style={{ marginTop: "1rem" }}>
            <h3>{t("app.dashboard.benchmark")}</h3>
            <p>
              {benchmark.sectorLabel}: {benchmark.yourScore} vs {benchmark.sectorAverage}
            </p>
          </div>
        ) : null}

        {recommendations.length ? (
          <div className="module-grid" style={{ marginTop: "1rem" }}>
            {recommendations.map((rec) => (
              <article className="card" key={rec.id}>
                <h3>{rec.title}</h3>
                <p>{rec.description}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
