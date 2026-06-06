import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import { dakinisCompareToSector } from "@dakinis/shared/catalog/sector-benchmarks.js";
import { dakinisComputeGrowthScore } from "@dakinis/shared/catalog/tenant-growth-score.js";
import {
  dakinisGetWorkspaceCatalog,
  dakinisFilterKpisForWorkspace
} from "@dakinis/shared/catalog/tenant-workspaces.js";
import { dakinisBuildModuleRecommendations } from "@dakinis/shared/catalog/module-recommendations.js";
import { dakinisPlanModuleDenialOrNull } from "./plan-access.js";
import { dakinisGatherTenantSignals } from "../services/tenant-intelligence-store.js";
import { dakinisLoadModuleOverrides } from "../services/tenant-intelligence-store.js";
import {
  dakinisGatherGrowthSignals,
  dakinisListGoals,
  dakinisUpsertGoal,
  dakinisFinanceSummary,
  dakinisListFinanceEntries,
  dakinisCreateFinanceEntry,
  dakinisListKnowledgeDocs,
  dakinisGetKnowledgeDoc,
  dakinisUpsertKnowledgeDoc,
  dakinisLoadModuleUsageMap,
  dakinisTrackModuleUsage
} from "../services/intelligence-data-store.js";
import {
  dakinisIntelligenceAskWithAgents,
  dakinisIntelligenceIsLlmEnabled
} from "../services/dakinis-intelligence-service.js";
import { dakinisGetIndustryTemplate } from "@dakinis/shared/catalog/business-templates.js";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun } from "../db/query.js";
import { randomUUID } from "node:crypto";

function dakinisParseJson(rawBody) {
  try {
    return JSON.parse(rawBody || "{}");
  } catch {
    return null;
  }
}

function dakinisMeta(business) {
  return { businessId: business.id, businessSlug: business.slug };
}

function dakinisRequireJwt(req) {
  if (!req.dakinisAuth || req.dakinisAuth.method !== "jwt") {
    return dakinisJsonError(403, "FORBIDDEN", "Requiere sesion JWT");
  }
  return null;
}

async function dakinisBuildIndustryDashboardKpis(business, signals) {
  const template = dakinisGetIndustryTemplate(business.type);
  return (template?.dashboardKpis || []).map((k) => ({
    ...k,
    value: signals.reservations7d || signals.crmContacts || 0
  }));
}

export async function dakinisHandleBenchmarkGet(req) {
  const signals = await dakinisGatherGrowthSignals(req.dakinisBusiness.id, await dakinisGatherTenantSignals(req.dakinisBusiness));
  const tenantMetrics = {
    salesMonthDeltaPct: signals.salesMonthDeltaPct,
    crmContacts: signals.crmContacts,
    reservations7d: signals.reservations7d,
    occupancyPct: Math.min(95, 40 + (signals.reservations7d || 0) * 2),
    stockAlerts: signals.stockAlerts
  };
  const benchmark = dakinisCompareToSector(req.dakinisBusiness.type, tenantMetrics);
  return dakinisJsonSuccess({ benchmark, tenantMetrics }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleGrowthScoreGet(req) {
  const base = await dakinisGatherTenantSignals(req.dakinisBusiness);
  const signals = await dakinisGatherGrowthSignals(req.dakinisBusiness.id, base);
  const growth = dakinisComputeGrowthScore(req.dakinisBusiness, signals);
  return dakinisJsonSuccess({ growth, signals }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleWorkspacesGet(req) {
  const signals = await dakinisGatherTenantSignals(req.dakinisBusiness);
  const kpis = await dakinisBuildIndustryDashboardKpis(req.dakinisBusiness, signals);
  const workspaces = dakinisGetWorkspaceCatalog().map((ws) => ({
    ...ws,
    kpis: dakinisFilterKpisForWorkspace(ws.key, kpis)
  }));
  return dakinisJsonSuccess({ workspaces }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleRecommendationsGet(req) {
  const overrides = await dakinisLoadModuleOverrides(req.dakinisBusiness.id);
  const usage = await dakinisLoadModuleUsageMap(req.dakinisBusiness.id);
  const recommendations = dakinisBuildModuleRecommendations(req.dakinisBusiness, overrides, usage);
  return dakinisJsonSuccess({ recommendations }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleIntelligenceAskPost(req, rawBody) {
  const body = dakinisParseJson(rawBody) || {};
  const base = await dakinisGatherTenantSignals(req.dakinisBusiness);
  const signals = await dakinisGatherGrowthSignals(req.dakinisBusiness.id, base);
  await dakinisTrackModuleUsage(req.dakinisBusiness.id, "ia");
  const result = await dakinisIntelligenceAskWithAgents(req.dakinisBusiness, signals, {
    question: body.question,
    telemetrySource: "intelligence",
    userId: req.dakinisAuth?.userId || req.user?.id || null
  });
  return dakinisJsonSuccess(
    { ...result, llmEnabled: dakinisIntelligenceIsLlmEnabled() },
    req.dakinisBusiness.type,
    dakinisMeta(req.dakinisBusiness)
  );
}

export async function dakinisHandleGoalsGet(req) {
  const goals = await dakinisListGoals(req.dakinisBusiness.id);
  return dakinisJsonSuccess({ goals }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleGoalsPost(req, rawBody) {
  const err = dakinisRequireJwt(req);
  if (err) return err;
  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  const goal = await dakinisUpsertGoal(req.dakinisBusiness.id, body);
  return dakinisJsonSuccess({ goal }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleFinanceSummaryGet(req) {
  const summary = await dakinisFinanceSummary(req.dakinisBusiness.id);
  return dakinisJsonSuccess({ summary }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleFinanceEntriesGet(req) {
  const entries = await dakinisListFinanceEntries(req.dakinisBusiness.id);
  return dakinisJsonSuccess({ entries }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleFinanceEntriesPost(req, rawBody) {
  const err = dakinisRequireJwt(req);
  if (err) return err;
  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  const entry = await dakinisCreateFinanceEntry(req.dakinisBusiness.id, body);
  return dakinisJsonSuccess({ entry }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleKnowledgeListGet(req, url) {
  const q = url.searchParams.get("q") || "";
  const docs = await dakinisListKnowledgeDocs(req.dakinisBusiness.id, q);
  return dakinisJsonSuccess({ docs }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleKnowledgeGet(req, docId) {
  const doc = await dakinisGetKnowledgeDoc(req.dakinisBusiness.id, docId);
  if (!doc) return dakinisJsonError(404, "NOT_FOUND", "Documento no encontrado");
  return dakinisJsonSuccess({ doc }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleKnowledgePost(req, rawBody) {
  const err = dakinisRequireJwt(req);
  if (err) return err;
  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  const doc = await dakinisUpsertKnowledgeDoc(req.dakinisBusiness.id, body);
  return dakinisJsonSuccess({ doc }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleNetworkLinksGet(req) {
  const rows = await dakinisQueryAll(
    `SELECT * FROM tenant_network_links WHERE from_business_id = ? OR to_business_id = ?`,
    [req.dakinisBusiness.id, req.dakinisBusiness.id]
  ).catch(() => []);
  return dakinisJsonSuccess({ links: rows }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleNetworkLinksPost(req, rawBody) {
  const err = dakinisRequireJwt(req);
  if (err) return err;
  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  const toId = String(body.toBusinessId || "").trim();
  const linkType = String(body.linkType || "supplier").trim();
  if (!toId) return dakinisJsonError(400, "VALIDATION_ERROR", "toBusinessId requerido");
  const target = await dakinisQueryOne("SELECT id FROM business WHERE id = ? OR slug = ?", [toId, toId]);
  if (!target) return dakinisJsonError(404, "NOT_FOUND", "Negocio destino no encontrado");

  const id = `net_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
  await dakinisRun(
    `INSERT INTO tenant_network_links (id, from_business_id, to_business_id, link_type, status, metadata_json)
     VALUES (?, ?, ?, ?, 'pending', '{}')`,
    [id, req.dakinisBusiness.id, target.id, linkType]
  );
  return dakinisJsonSuccess({ linkId: id, status: "pending" }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export function dakinisHandleIntelligenceV2Route(req, rawBody, url) {
  const path = url.pathname;

  if (req.method === "GET" && path === "/api/v1/tenant/benchmark") return dakinisHandleBenchmarkGet(req);
  if (req.method === "GET" && path === "/api/v1/tenant/growth-score") return dakinisHandleGrowthScoreGet(req);
  if (req.method === "GET" && path === "/api/v1/tenant/workspaces") return dakinisHandleWorkspacesGet(req);
  if (req.method === "GET" && path === "/api/v1/tenant/recommendations") return dakinisHandleRecommendationsGet(req);
  if (req.method === "POST" && path === "/api/v1/tenant/intelligence/ask") {
    return dakinisHandleIntelligenceAskPost(req, rawBody);
  }
  if (req.method === "GET" && path === "/api/v1/tenant/goals") return dakinisHandleGoalsGet(req);
  if (req.method === "POST" && path === "/api/v1/tenant/goals") return dakinisHandleGoalsPost(req, rawBody);
  if (req.method === "GET" && path === "/api/v1/tenant/finance/summary") return dakinisHandleFinanceSummaryGet(req);
  if (req.method === "GET" && path === "/api/v1/tenant/finance/entries") return dakinisHandleFinanceEntriesGet(req);
  if (req.method === "POST" && path === "/api/v1/tenant/finance/entries") {
    return dakinisHandleFinanceEntriesPost(req, rawBody);
  }
  if (req.method === "GET" && path === "/api/v1/tenant/knowledge") return dakinisHandleKnowledgeListGet(req, url);
  if (req.method === "POST" && path === "/api/v1/tenant/knowledge") return dakinisHandleKnowledgePost(req, rawBody);
  const kbDocMatch = /^\/api\/v1\/tenant\/knowledge\/([^/]+)$/.exec(path);
  if (kbDocMatch && req.method === "GET") {
    return dakinisHandleKnowledgeGet(req, decodeURIComponent(kbDocMatch[1]));
  }
  if (req.method === "GET" && path === "/api/v1/tenant/network/links") return dakinisHandleNetworkLinksGet(req);
  if (req.method === "POST" && path === "/api/v1/tenant/network/links") {
    return dakinisHandleNetworkLinksPost(req, rawBody);
  }

  return null;
}
