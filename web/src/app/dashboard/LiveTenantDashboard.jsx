import { useEffect, useReducer, useState } from "react";
import { dakinisIsHospitalityBusiness } from "@dakinis/shared/catalog/hospitality.js";
import { useLocale } from "../../context/LocaleContext.jsx";
import BusinessNavHero from "../../components/business/BusinessNavHero.jsx";
import { dakinisIsBusinessFacingSession } from "../../utils/businessDemoMode.js";
import {
  dakinisTenantIndustryDashboard,
  dakinisTenantHealthScore,
  dakinisTenantAiSuggestions,
  dakinisTenantGrowthScore,
  dakinisTenantRecommendations,
  dakinisTenantFinanceSummary
} from "../../services/tenant-intelligence.js";
import { dakinisRestaurantTaskPath } from "../../utils/restaurantTaskStorage.js";
import {
  LIVE_TENANT_DASHBOARD_INITIAL,
  dakinisMergeDashboardLoad,
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

const HEALTH_FACTOR_GROUPS = [
  { id: "setup", title: "Configuración", keys: ["onboarding"] },
  { id: "ops", title: "Salud operativa", keys: ["operations"] },
  { id: "commercial", title: "Actividad comercial", keys: ["crm", "activity", "engagement"] },
  { id: "adoption", title: "Adopción", keys: ["team"] }
];

function HealthFactors({ factors }) {
  const list = Array.isArray(factors) ? factors : [];
  return (
    <>
      {HEALTH_FACTOR_GROUPS.map((group) => {
        const rows = list.filter((factor) => group.keys.includes(factor.key));
        if (!rows.length) return null;
        return (
          <article className="card dashboard-kpi" key={group.id}>
            <p className="kpi-label">{group.title}</p>
            {group.id === "setup" ? (
              <p className="kpi-label">Un negocio sin configurar no es una incidencia operativa.</p>
            ) : null}
            <ul className="kpi-label dashboard-kpi__factors">
              {rows.map((factor) => (
                <li key={factor.key}>{factor.label}</li>
              ))}
            </ul>
          </article>
        );
      })}
    </>
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
    <div className="dashboard-groups" style={{ marginTop: "0.75rem", display: "grid", gap: "0.65rem" }}>
      {KPI_GROUPS.map((group) => {
        const items = grouped.get(group.id) || [];
        if (!items.length) return null;
        return (
          <section key={group.id} aria-label={group.title}>
            <h3 style={{ margin: "0 0 0.35rem", fontSize: "1.05rem" }}>{group.title}</h3>
            <div className="module-grid dashboard-groups__grid">
              {items.map((item) => {
                if (item.health) {
                  return <HealthFactors key={item.key} factors={health.factors} />;
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
  const { industryDash, health, aiTips, growth, recommendations, finance, errors, loadedAt } = data;
  const [reloadNonce, setReloadNonce] = useState(0);

  const sessionToken = session?.token;

  useEffect(() => {
    if (!sessionToken) return undefined;
    let cancelled = false;
    const jobs = [
      ["panel", () => dakinisTenantIndustryDashboard(session)],
      ["salud", () => dakinisTenantHealthScore(session)],
      ["sugerencias", () => dakinisTenantAiSuggestions(session)],
      ["crecimiento", () => dakinisTenantGrowthScore(session)],
      ["recomendaciones", () => dakinisTenantRecommendations(session)],
      ["finanzas", () => dakinisTenantFinanceSummary(session)]
    ];
    Promise.all(
      jobs.map(async ([key, run]) => {
        try {
          return { key, ok: true, value: await run() };
        } catch (err) {
          const message = err instanceof Error ? err.message : "No se ha podido cargar";
          return { key, ok: false, message };
        }
      })
    ).then((results) => {
      if (cancelled) return;
      const merged = dakinisMergeDashboardLoad(data, results);
      dispatch({
        type: "loaded",
        loadedAt: new Date().toISOString(),
        errors: merged.errors,
        payload: merged
      });
    });
    return () => {
      cancelled = true;
    };
    // Token and an explicit retry. A failed module does not borrar los que sí llegaron.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- session object identity churns
  }, [sessionToken, reloadNonce]);

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
        <p className="kicker">{t("app.dashboard.kicker", { name: businessName })}</p>
        <h2>{industryDash?.industry || t("app.dashboard.heading")}</h2>
        <p className="lead">{t("app.dashboard.lead")}</p>
        {loadedAt ? (
          <p className="kpi-label">
            Actualizado a las {new Date(loadedAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
          </p>
        ) : null}
        {Object.keys(errors).length ? (
          <article className="card dashboard-load-error">
            <h3 style={{ marginTop: 0 }}>Hay módulos que no se han cargado</h3>
            <ul>
              {Object.entries(errors).map(([key, message]) => (
                <li key={key}>
                  <strong>
                    {{
                      panel: "Panel",
                      salud: "Salud",
                      sugerencias: "Sugerencias",
                      crecimiento: "Crecimiento",
                      recomendaciones: "Recomendaciones",
                      finanzas: "Finanzas"
                    }[key] || key}
                  </strong>
                  : {message}
                </li>
              ))}
            </ul>
            <button type="button" className="btn" onClick={() => setReloadNonce((value) => value + 1)}>
              Reintentar
            </button>
          </article>
        ) : null}

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

        {businessFacing ? <BusinessNavHero navigate={navigate} compact quiet /> : null}

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
