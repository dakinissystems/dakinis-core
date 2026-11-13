export const LIVE_TENANT_DASHBOARD_INITIAL = {
  industryDash: null,
  health: null,
  aiTips: null,
  benchmark: null,
  growth: null,
  recommendations: [],
  finance: null,
  errors: {},
  loadedAt: null
};

export function dakinisMergeDashboardLoad(previous, results) {
  const byKey = Object.fromEntries(results.map((row) => [row.key, row]));
  const errors = {};
  for (const row of results) {
    if (!row.ok) errors[row.key] = row.message;
  }
  const value = (key) => (byKey[key]?.ok ? byKey[key].value : null);
  return {
    errors,
    industryDash: value("panel")?.data?.dashboard ?? previous.industryDash,
    health: value("salud")?.data?.health ?? previous.health,
    aiTips: value("sugerencias")?.data ?? previous.aiTips,
    growth: value("crecimiento")?.data?.growth ?? previous.growth,
    recommendations: value("recomendaciones")?.data?.recommendations ?? previous.recommendations,
    finance: value("finanzas")?.data?.summary ?? previous.finance,
    benchmark: null
  };
}

export function liveTenantDashboardReducer(state, action) {
  switch (action.type) {
    case "loaded":
      return {
        ...state,
        ...action.payload,
        errors: action.errors || {},
        loadedAt: action.loadedAt || null
      };
    default:
      return state;
  }
}
