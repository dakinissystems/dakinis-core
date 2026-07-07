import { dakinisTenantJsonFetch } from "./api.js";

export function dakinisTenantProfile(session) {
  return dakinisTenantJsonFetch("/api/v1/tenant/profile", session);
}

export function dakinisTenantIndustryDashboard(session) {
  return dakinisTenantJsonFetch("/api/v1/tenant/dashboard", session);
}

export function dakinisTenantHealthScore(session) {
  return dakinisTenantJsonFetch("/api/v1/tenant/health-score", session);
}

function dakinisTenantOnboarding(session) {
  return dakinisTenantJsonFetch("/api/v1/tenant/onboarding", session);
}

export function dakinisTenantAdvanceOnboarding(session, body = {}) {
  return dakinisTenantJsonFetch("/api/v1/tenant/onboarding/advance", session, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export function dakinisTenantPatchSettings(session, patch) {
  return dakinisTenantJsonFetch("/api/v1/tenant/settings", session, {
    method: "PATCH",
    body: JSON.stringify(patch)
  });
}

export function dakinisTenantBranches(session) {
  return dakinisTenantJsonFetch("/api/v1/tenant/branches", session);
}

export function dakinisTenantAiSuggestions(session) {
  return dakinisTenantJsonFetch("/api/v1/tenant/ai/suggestions", session);
}

export function dakinisTenantBenchmark(session) {
  return dakinisTenantJsonFetch("/api/v1/tenant/benchmark", session);
}

export function dakinisTenantGrowthScore(session) {
  return dakinisTenantJsonFetch("/api/v1/tenant/growth-score", session);
}

export function dakinisTenantRecommendations(session) {
  return dakinisTenantJsonFetch("/api/v1/tenant/recommendations", session);
}

function dakinisTenantIntelligenceAsk(session, question) {
  return dakinisTenantJsonFetch("/api/v1/tenant/intelligence/ask", session, {
    method: "POST",
    body: JSON.stringify({ question })
  });
}

export function dakinisTenantFinanceSummary(session) {
  return dakinisTenantJsonFetch("/api/v1/tenant/finance/summary", session);
}

export function dakinisTenantBillingSummary(session) {
  return dakinisTenantJsonFetch("/api/v1/tenant/billing/summary", session);
}

export function dakinisTenantAiUsage(session, days = 30) {
  return dakinisTenantJsonFetch(`/api/v1/tenant/ai/usage?days=${days}`, session);
}

function dakinisTenantBenchmarkReal(session) {
  return dakinisTenantJsonFetch("/api/v1/tenant/benchmark/real", session);
}

export function dakinisTenantCopilot(session, question, context) {
  const body = { question };
  if (context && typeof context === "object") body.context = context;
  return dakinisTenantJsonFetch("/api/v1/tenant/copilot", session, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export function dakinisTenantExecuteAction(session, actionId) {
  return dakinisTenantJsonFetch(`/api/v1/tenant/intelligence/actions/${encodeURIComponent(actionId)}/execute`, session, {
    method: "POST",
    body: "{}"
  });
}

export function dakinisTenantMarketplaceInstall(session, moduleKey) {
  return dakinisTenantJsonFetch("/api/v1/tenant/marketplace/install", session, {
    method: "POST",
    body: JSON.stringify({ moduleKey })
  });
}

export function dakinisTenantPortalSettings(session) {
  return dakinisTenantJsonFetch("/api/v1/tenant/portal/settings", session);
}

export function dakinisTenantPatchPortalSettings(session, patch) {
  return dakinisTenantJsonFetch("/api/v1/tenant/portal/settings", session, {
    method: "PATCH",
    body: JSON.stringify(patch)
  });
}

export function dakinisTenantTelemetryFeature(session, body) {
  return dakinisTenantJsonFetch("/api/v1/tenant/telemetry/feature", session, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export function dakinisTenantTelemetryAdoption(session, days = 30) {
  return dakinisTenantJsonFetch(`/api/v1/tenant/telemetry/adoption?days=${days}&recent=1`, session);
}

function dakinisPublicIndustryTemplates() {
  return fetch("/api/public/industry-templates").then((r) => r.json());
}
