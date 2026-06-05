import { useEffect, useState } from "react";
import { useLocale } from "../../context/LocaleContext.jsx";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import {
  dakinisAppointmentCanSchedule,
  dakinisAppointmentLink,
  dakinisAppointmentSlots
} from "../../services/appointments.js";
import { dakinisWhatsappRules } from "../../services/whatsapp.js";
import {
  dakinisTenantIndustryDashboard,
  dakinisTenantHealthScore,
  dakinisTenantAiSuggestions,
  dakinisTenantBenchmark,
  dakinisTenantGrowthScore,
  dakinisTenantRecommendations,
  dakinisTenantFinanceSummary
} from "../../services/tenant-intelligence.js";

function JsonBox({ data }) {
  return <pre className="config-box">{JSON.stringify(data, null, 2)}</pre>;
}

export default function DashboardPage({ navigate }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [industryDash, setIndustryDash] = useState(null);
  const [health, setHealth] = useState(null);
  const [aiTips, setAiTips] = useState(null);
  const [benchmark, setBenchmark] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [finance, setFinance] = useState(null);

  useEffect(() => {
    if (!session?.token) return;
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

  if (!session?.token) {
    return (
      <section className="modules">
        <div className="container">
          <h2>{t("app.dashboard.title")}</h2>
          <p className="lead">{t("app.loginRequired")}</p>
          <button className="btn" type="button" onClick={() => navigate("/login")}>
            {t("app.goLogin")}
          </button>
        </div>
      </section>
    );
  }

  async function run(label, fn) {
    setLoading(true);
    setError("");
    try {
      const data = await fn();
      setResult({ label, data });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("app.apiError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="modules">
      <div className="container">
        <p className="kicker">
          {t("app.dashboard.kicker", { slug: session.business?.slug || session.business?.id })}
        </p>
        <h2>{industryDash?.industry || t("app.dashboard.heading")}</h2>
        <p className="lead">{t("app.dashboard.lead")}</p>

        <div className="module-grid" style={{ marginBottom: "1rem" }}>
          {health ? (
            <article className="card">
              <h3 style={{ marginTop: 0 }}>Health Score</h3>
              <p style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>{health.score}/100</p>
              <p className="lead">{health.statusLabel}</p>
            </article>
          ) : null}
          {growth ? (
            <article className="card">
              <h3 style={{ marginTop: 0 }}>Growth Score</h3>
              <p style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>{growth.score}/100</p>
              <p className="lead">{growth.statusLabel}</p>
            </article>
          ) : null}
          {finance ? (
            <article className="card">
              <h3 style={{ marginTop: 0 }}>Finanzas (30 días)</h3>
              <p className="lead">
                Ingresos {finance.income} € · Margen {finance.marginPct}%
              </p>
            </article>
          ) : null}
        </div>

        {benchmark?.highlights?.length ? (
          <div className="card" style={{ marginBottom: "1rem" }}>
            <h3 style={{ marginTop: 0 }}>Benchmark sectorial</h3>
            <ul>
              {benchmark.highlights.map((h) => (
                <li key={h.key}>
                  <strong>{h.label}:</strong> {h.narrative} (tú: {h.tenantValue}, media: {h.sectorAverage}
                  {h.unit})
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {recommendations.length ? (
          <div className="card" style={{ marginBottom: "1rem" }}>
            <h3 style={{ marginTop: 0 }}>Recomendaciones</h3>
            <ul>
              {recommendations.slice(0, 4).map((r) => (
                <li key={`${r.moduleKey}-${r.action}`}>
                  <strong>{r.label}</strong> — {r.reason}
                  {r.upgradeTo ? ` (plan ${r.upgradeTo})` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {industryDash?.kpis?.length ? (
          <div className="module-grid" style={{ marginBottom: "1rem" }}>
            {industryDash.kpis.map((kpi) => (
              <article className="card" key={kpi.key}>
                <p className="kicker">{kpi.label}</p>
                <p style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>{kpi.value}</p>
              </article>
            ))}
          </div>
        ) : null}

        {aiTips?.suggestions?.length ? (
          <div className="card" style={{ marginBottom: "1rem" }}>
            <h3 style={{ marginTop: 0 }}>{aiTips.assistant || "Asistente Dakinis"}</h3>
            <ul>
              {aiTips.suggestions.map((s) => (
                <li key={s.question}>
                  <strong>{s.question}</strong> — {s.answer}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="pill-grid" style={{ marginBottom: "1rem" }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/app/crm")}>
            {t("appNav.crm")}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/app/whatsapp")}>
            {t("appNav.messages")}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/app/settings")}>
            {t("appNav.settings")}
          </button>
        </div>

        <div className="module-grid">
          <article className="card">
            <h3>{t("app.dashboard.appointments")}</h3>
            <div className="pill-grid">
              <button
                type="button"
                className="btn"
                disabled={loading}
                onClick={() =>
                  run("slots", () => dakinisAppointmentSlots("2026-05-06T09:00:00Z", "2026-05-06T18:00:00Z"))
                }
              >
                {t("app.dashboard.slots")}
              </button>
              <button
                type="button"
                className="btn"
                disabled={loading}
                onClick={() =>
                  run("can-schedule", () =>
                    dakinisAppointmentCanSchedule([], "2026-05-06T10:00:00Z", 45)
                  )
                }
              >
                {t("app.dashboard.canSchedule")}
              </button>
              <button
                type="button"
                className="btn"
                disabled={loading}
                onClick={() => run("booking-link", () => dakinisAppointmentLink(session.business?.slug))}
              >
                {t("app.dashboard.link")}
              </button>
            </div>
          </article>

          <article className="card">
            <h3>{t("app.dashboard.whatsapp")}</h3>
            <button
              type="button"
              className="btn"
              disabled={loading}
              onClick={() => run("whatsapp-rules", () => dakinisWhatsappRules())}
            >
              {t("app.dashboard.rules")}
            </button>
          </article>
        </div>

        {error ? <p className="lead" style={{ color: "#f97316" }}>{error}</p> : null}
        {result ? <JsonBox data={result} /> : null}
      </div>
    </section>
  );
}
