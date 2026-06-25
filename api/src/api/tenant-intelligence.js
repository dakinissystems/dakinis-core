import { dakinisRunIndustryAiHeuristics } from "@dakinis/shared/catalog/industry-ai-playbooks.js";
import { dakinisComputeTenantHealthScore } from "@dakinis/shared/catalog/tenant-health-score.js";
import { dakinisNormalizeCommercialPlan } from "@dakinis/shared/catalog/plan-modules.js";
import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import { dakinisGatherTenantSignals } from "./tenant-signals.js";
import { dakinisCallCoreAdvisorAi, dakinisAiConfigured } from "../lib/dakinis-ai-client.js";
import {
  dakinisAiAssertQuota,
  dakinisAiRecordUsage,
  dakinisAiUsageHistory,
  dakinisAiUsageSnapshot
} from "../lib/ai-usage.js";
import { dakinisPublishEvent } from "../lib/event-bus.js";
import { dakinisHandleTenantDashboardRoute } from "./tenant-dashboard-routes.js";

function dakinisParseJson(rawBody) {
  try {
    return JSON.parse(rawBody || "{}");
  } catch {
    return null;
  }
}

function dakinisMeta(req) {
  const b = req.dakinisBusiness;
  return { businessId: b.id, businessSlug: b.slug };
}

function dakinisRequireJwt(req) {
  if (!req.dakinisAuth || req.dakinisAuth.method !== "jwt") {
    return dakinisJsonError(403, "FORBIDDEN", "Inicia sesion en el negocio para usar el asistente IA");
  }
  return null;
}

async function dakinisBuildAdvisorContext(business) {
  const signals = await dakinisGatherTenantSignals(business.id, business.type);
  const healthScore = dakinisComputeTenantHealthScore(business, signals);
  const heuristics = dakinisRunIndustryAiHeuristics(business, signals);
  return { signals, healthScore, heuristics };
}

function dakinisMatchHeuristic(heuristics, question) {
  const q = String(question || "").toLowerCase();
  return heuristics.find((h) => q.includes(String(h.question || "").toLowerCase().slice(0, 12))) || heuristics[0] || null;
}

function dakinisDegradedCopilotResponse(heuristics, question, reason = "unknown") {
  const match = dakinisMatchHeuristic(heuristics, question);
  return {
    answer: match?.answer || "Registra más actividad en CRM e inventario para obtener respuestas personalizadas.",
    source: "heuristic",
    degraded: true,
    degradedReason: reason,
    actions: []
  };
}

async function dakinisHandleIntelligenceAsk(req, rawBody) {
  const jwtErr = dakinisRequireJwt(req);
  if (jwtErr) return jwtErr;

  const business = req.dakinisBusiness;
  if (String(business.type).toLowerCase() === "platform") {
    return dakinisJsonError(403, "FORBIDDEN", "No aplica a cuentas de plataforma");
  }

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const question = String(body.question || body.message || body.userMessage || "").trim();
  if (!question) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "question es obligatorio");
  }
  if (question.length > 2000) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "question demasiado larga (max 2000)");
  }

  const userId = req.dakinisAuth.userId || req.dakinisAuth.sub || null;
  const { signals, healthScore, heuristics } = await dakinisBuildAdvisorContext(business);
  const planTier = dakinisNormalizeCommercialPlan(business.plan);

  const quota = await dakinisAiAssertQuota(business.id, business.plan);
  if (!quota.ok) {
    const reason = quota.error === "plan_upgrade_required" ? "plan_upgrade_required" : "ai_quota_exceeded";
    const copilot = dakinisDegradedCopilotResponse(heuristics, question, reason);
    copilot.upgradeRequired = quota.error === "plan_upgrade_required";
    copilot.quotaExceeded = quota.error === "ai_quota_exceeded";
    return dakinisJsonSuccess(
      {
        copilot,
        intelligence: { answer: copilot.answer, degraded: true, degradedReason: reason },
        heuristics: heuristics.slice(0, 3),
        quota
      },
      business.type,
      dakinisMeta(req)
    );
  }

  if (!dakinisAiConfigured()) {
    const copilot = dakinisDegradedCopilotResponse(heuristics, question, "ai_not_configured");
    return dakinisJsonSuccess(
      {
        copilot,
        intelligence: { answer: copilot.answer, degraded: true, degradedReason: "ai_not_configured" },
        heuristics: heuristics.slice(0, 3)
      },
      business.type,
      dakinisMeta(req)
    );
  }

  const ai = await dakinisCallCoreAdvisorAi({
    businessId: business.id,
    userId,
    userMessage: question,
    context: {
      businessId: business.id,
      businessName: business.name,
      businessType: business.type,
      plan: planTier,
      signals,
      healthScore: { score: healthScore.score, status: healthScore.status }
    },
    heuristicTips: heuristics.slice(0, 4),
    locale: body.locale || "es"
  });

  if (!ai.ok) {
    const reason = ai.error === "ai_unreachable" ? "ai_unreachable" : "ai_error";
    const copilot = dakinisDegradedCopilotResponse(heuristics, question, reason);
    return dakinisJsonSuccess(
      {
        copilot,
        intelligence: { answer: copilot.answer, degraded: true, degradedReason: reason },
        aiError: ai.error,
        aiMessage: ai.message
      },
      business.type,
      dakinisMeta(req)
    );
  }

  await dakinisAiRecordUsage(business.id, userId, "advisor");
  await dakinisPublishEvent("intelligence.question", {
    tenantId: business.id,
    userId,
    requestId: ai.requestId
  });

  const usage = await dakinisAiUsageSnapshot(business.id, business.plan);
  const copilot = {
    answer: ai.answer || ai.narrative,
    actions: ai.actions || [],
    toolResults: ai.toolResults,
    model: ai.model,
    provider: ai.provider,
    requestId: ai.requestId,
    degraded: false
  };

  return dakinisJsonSuccess(
    {
      copilot,
      intelligence: { answer: copilot.answer, actions: copilot.actions, toolResults: ai.toolResults },
      usage
    },
    business.type,
    dakinisMeta(req)
  );
}

export async function dakinisHandleTenantIntelligenceRoute(req, rawBody, path) {
  const dashboardResult = await dakinisHandleTenantDashboardRoute(req, rawBody, path);
  if (dashboardResult) return dashboardResult;

  if (path === "/api/v1/tenant/copilot" && req.method === "POST") {
    return dakinisHandleIntelligenceAsk(req, rawBody);
  }
  if (path === "/api/v1/tenant/intelligence/ask" && req.method === "POST") {
    return dakinisHandleIntelligenceAsk(req, rawBody);
  }

  if (path === "/api/v1/tenant/ai/usage" && req.method === "GET") {
    const jwtErr = dakinisRequireJwt(req);
    if (jwtErr) return jwtErr;
    const business = req.dakinisBusiness;
    const days = Math.min(90, Math.max(7, Number(new URL(req.url || "", "http://x").searchParams.get("days")) || 30));
    const snapshot = await dakinisAiUsageSnapshot(business.id, business.plan);
    const history = await dakinisAiUsageHistory(business.id, days);
    return dakinisJsonSuccess({ usage: snapshot, history }, business.type, dakinisMeta(req));
  }

  if (path.startsWith("/api/v1/tenant/intelligence/actions/") && req.method === "POST") {
    const jwtErr = dakinisRequireJwt(req);
    if (jwtErr) return jwtErr;
    const actionId = decodeURIComponent(path.split("/").pop() || "");
    await dakinisPublishEvent("intelligence.action.queued", {
      tenantId: req.dakinisBusiness.id,
      actionId,
      userId: req.dakinisAuth.userId
    });
    return dakinisJsonSuccess({ queued: true, actionId }, req.dakinisBusiness.type, dakinisMeta(req));
  }

  if (path === "/api/v1/tenant/ai/suggestions" && req.method === "GET") {
    const jwtErr = dakinisRequireJwt(req);
    if (jwtErr) return jwtErr;
    const business = req.dakinisBusiness;
    const signals = await dakinisGatherTenantSignals(business.id, business.type);
    const suggestions = dakinisRunIndustryAiHeuristics(business, signals);
    return dakinisJsonSuccess({ suggestions }, business.type, dakinisMeta(req));
  }

  if (path === "/api/v1/tenant/health-score" && req.method === "GET") {
    const jwtErr = dakinisRequireJwt(req);
    if (jwtErr) return jwtErr;
    const business = req.dakinisBusiness;
    const signals = await dakinisGatherTenantSignals(business.id, business.type);
    const health = dakinisComputeTenantHealthScore(business, signals);
    return dakinisJsonSuccess({ health }, business.type, dakinisMeta(req));
  }

  return null;
}
