export const LIVE_TENANT_DASHBOARD_INITIAL = {
  industryDash: null,
  health: null,
  aiTips: null,
  benchmark: null,
  growth: null,
  recommendations: [],
  finance: null
};

export function liveTenantDashboardReducer(state, action) {
  switch (action.type) {
    case "loaded":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
