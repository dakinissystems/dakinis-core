import { useEffect, useReducer } from "react";
import { dakinisIsHospitalityBusiness } from "@dakinis/shared/catalog/hospitality.js";
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
import { dakinisRestaurantTaskPath } from "../../utils/restaurantTaskStorage.js";
import {
  LIVE_TENANT_DASHBOARD_INITIAL,
  liveTenantDashboardReducer
} from "./liveTenantDashboardReducer.js";

const KPI_GROUPS = [
  { id: "performance", title: "Rendimiento", keys: ["ventas_hoy", "ingresos_mes", "margen"] },
  { id: "ops", title: "Operación", keys: ["comandas_abiertas", "mesas_ocupadas"] },
  { id: "attention", title: "Atención", keys: ["stock_alertas", "alertas"] }
];

function dakinisKpiGroup(key) {
  return KPI_GROUPS.find((group) => group.keys.includes(key))?.id || "performance";
}

function dakinisTaskLabel(t, key) {
  const task = HOSPITALITY_KPI_TASK[key];
  if (!task) return "";
  return t(
    {
      sala: "restaurant.taskSala",
      cocina: "restaurant.taskCocina",
      inventario: "restaurant.taskInventario",
      caja: "restaurant.taskCaja"
    }[task]
  );
}

function DashboardGroups({ t, health, growth, finance, kpis, hospitality, openKpi }) {
  const grouped = new Map(KPI_GROUPS.map((group) => [group.id, []]));
  for (const kpi of kpis) {
    const id = dakinisKpiGroup(kpi.key);
    grouped.get(id).push(kpi);
  }
  if (finance) grouped.get("performance").unshift({ key: "finance-30d", label: t("app.dashboard.finance30d"), finance: true });
  if (growth?.factors?.length) grouped.get("performance").unshift({ key: "growth", label: t("app.dashboard.growthScore"), growth: true });
  if (health) grouped.get("attention").unshift({ key: "health", label: t("app.dashboard.healthScore"), health: true });

  return (
    <div className="dashboard-groups" style={{ marginTop: "1rem", display: "grid", gap: "1rem" }}>
      {KPI_GROUPS.map((group) => {
        const items = grouped.get(group.id) || [];
        if (!items.length) return null;
        return (
          <section key={group.id} aria-label={group.title}>
            <h3 style={{ margin: "0 0 0.6rem", fontSize: "1.05rem" }}>{group.title}</h3>
            <div className="module-grid">
              {items.map((item) => {
                if (item.health) {
                  return (
                    <article className="card" key={item.key}>
                      <p className="kpi-label">{item.label}</p>
                      <p className="kpi-value">{health.score}/100</p>
                      <p className="kpi-label">{health.statusLabel}</p>
                      {Array.isArray(health.factors) && health.factors.length ? (
                        <ul className="kpi-label">
                          {health.factors.map((factor) => (
                            <li key={factor.key}>{factor.label}</li>
                          ))}
                        </ul>
                      ) : null}
                    </article>
                  );
                }
                if (item.growth) {
                  return (
                    <article className="card" key={item.key}>
                      <p className="kpi-label">{item.label}</p>
                      <p className="kpi-value">{growth.score}/100</p>
                      <p className="kpi-label">{growth.statusLabel}</p>
                      <ul className="kpi-label">
                        {growth.factors.map((factor) => (
                          <li key={factor.key}>{factor.label}</li>
                        ))}
                      </ul>
                    </article>
                  );
                }
                if (item.finance) {
                  return (
                    <article className="card" key={item.key}>
                      <p className="kpi-label">{item.label}</p>
                      {finance.available && finance.income != null ? (
                        <>
                          <p className="kpi-value">{finance.income} €</p>
                          <p className="kpi-label">{t("app.dashboard.margin", { pct: finance.marginPct })}</p>
                        </>
                      ) : (
                        <p className="kpi-value" style={{ fontSize: "1rem" }}>Datos no disponibles</p>
                      )}
                      {hospitality ? (
                        <button type="button" className="btn btn-outline" onClick={() => openKpi("ventas_hoy")}>
                          {t("restaurant.taskCaja")}
                        </button>
                      ) : null}
                    </article>
                  );
                }
                const missing = item.value == null || item.value === "" || item.value === "Datos no disponibles";
                return (
                  <article className="card" key={item.key}>
                    <p className="kpi-label">{item.label}</p>
                    <p className="kpi-value" style={missing ? { fontSize: "1rem" } : undefined}>
                      {missing ? "Datos no disponibles" : item.value}
                    </p>
                    {HOSPITALITY_KPI_TASK[item.key] && hospitality ? (
                      <button type="button" className="btn btn-outline" onClick={() => openKpi(item.key)}>
                        {dakinisTaskLabel(t, item.key)}
                      </button>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

const HOSPITALITY_KPI_TASK = {
  mesas_ocupadas: "sala",
  comandas_abiertas: "cocina",
  stock_alertas: "inventario",
  ventas_hoy: "caja"
};

export default function LiveTenantDashboard({ session, navigate }) {
  const { t } = useLocale();
  const [data, dispatch] = useReducer(liveTenantDashboardReducer, LIVE_TENANT_DASHBOARD_INITIAL);
  const { industryDash, health, aiTips, benchmark, growth, recommendations, finance } = data;

  const sessionToken = session?.token;

  useEffect(() => {
    if (!sessionToken) return undefined;
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
        dispatch({
          type: "loaded",
          payload: {
            industryDash: dashJson?.data?.dashboard || null,
            health: healthJson?.data?.health || null,
            aiTips: aiJson?.data || null,
            benchmark: benchJson?.data?.benchmark || null,
            growth: growthJson?.data?.growth || null,
            recommendations: recJson?.data?.recommendations || [],
            finance: finJson?.data?.summary || null
          }
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // Intentionally token-only: billing refresh must not re-fire this fan-out.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- session object identity churns
  }, [sessionToken]);

  const businessName = session.business?.name || t("businessDemo.dashboard.fallbackBusiness");
  const businessFacing = dakinisIsBusinessFacingSession(session);
  const hospitality = dakinisIsHospitalityBusiness(session.business?.type);

  function openKpi(key) {
    if (!hospitality) return;
    const task = HOSPITALITY_KPI_TASK[key];
    if (!task) return;
    const extras = task === "inventario" ? { sub: "alerts" } : {};
    navigate(dakinisRestaurantTaskPath(session.business.type, task, extras));
  }

  return (
    <section className="modules business-app-page">
      <div className="container">
        {businessFacing ? <BusinessNavHero navigate={navigate} /> : null}

        <p className="kicker">{t("app.dashboard.kicker", { name: businessName })}</p>
        <h2>{industryDash?.industry || t("app.dashboard.heading")}</h2>
        <p className="lead">{t("app.dashboard.lead")}</p>

        <DashboardGroups
          t={t}
          health={health}
          growth={growth}
          finance={finance}
          kpis={industryDash?.kpis || []}
          hospitality={hospitality}
          openKpi={openKpi}
        />

        {aiTips?.suggestions?.length ? (
          <div className="card" style={{ marginTop: "1rem" }}>
            <h3>{t("app.dashboard.aiSuggestions")}</h3>
            <ul>
              {aiTips.suggestions.map((item) => {
                const text = `${item.question || ""} ${item.answer || ""}`;
                const stock = /stock|inventario|reponer/i.test(text);
                return (
                  <li key={item.id}>
                    <strong>{item.question}</strong> — {item.answer}
                    {hospitality ? (
                      <div>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => openKpi(stock ? "stock_alertas" : "ventas_hoy")}
                        >
                          {stock ? t("restaurant.taskInventario") : t("restaurant.taskCaja")}
                        </button>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {benchmark?.comparisons?.length ? (
          <div className="card" style={{ marginTop: "1rem" }}>
            <h3>{t("app.dashboard.benchmark")}</h3>
            <p className="kpi-label">{benchmark.sectorSampleLabel}</p>
            <ul>
              {benchmark.comparisons.map((row) => (
                <li key={row.key}>
                  {row.label}: {row.tenantValue}
                  {row.unit ? ` ${row.unit}` : ""} · media {row.sectorAverage}
                </li>
              ))}
            </ul>
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
