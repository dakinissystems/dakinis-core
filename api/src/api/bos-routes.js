import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import { dakinisCompareToSector } from "@dakinis/shared/catalog/sector-benchmarks.js";
import { dakinisGatherTenantSignals } from "../services/tenant-intelligence-store.js";
import { dakinisGatherGrowthSignals } from "../services/intelligence-data-store.js";
import { dakinisLoadModuleOverrides } from "../services/tenant-intelligence-store.js";
import { dakinisResolveTenantModules } from "@dakinis/shared/catalog/tenant-modules.js";
import { dakinisGetIndustryTemplate } from "@dakinis/shared/catalog/business-templates.js";
import {
  dakinisGetBillingSummary,
  dakinisGetAiUsageSummary,
  dakinisExecutePendingAction,
  dakinisGetPendingAction,
  dakinisMarketplaceInstallModule,
  dakinisComputeRealSectorBenchmark,
  dakinisGetPortalSettings,
  dakinisUpsertPortalSettings,
  dakinisResolvePortalByKey,
  dakinisCreateNetworkOrder,
  dakinisListNetworkOrders
} from "../services/bos-store.js";
import {
  dakinisIntelligenceAsk,
  dakinisIntelligenceAskWithAgents
} from "../services/dakinis-intelligence-service.js";

function dakinisParseJson(rawBody) {
  try {
    return JSON.parse(rawBody || "{}");
  } catch {
    return null;
  }
}

function dakinisMeta(b) {
  return { businessId: b.id, businessSlug: b.slug };
}

function dakinisRequireJwt(req) {
  if (!req.dakinisAuth || req.dakinisAuth.method !== "jwt") {
    return dakinisJsonError(403, "FORBIDDEN", "Requiere sesion JWT");
  }
  return null;
}

export async function dakinisHandleBillingSummaryGet(req) {
  const summary = await dakinisGetBillingSummary(req.dakinisBusiness);
  return dakinisJsonSuccess({ billing: summary }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleAiUsageGet(req, url) {
  const days = Number(url?.searchParams?.get("days") || 30);
  const usage = await dakinisGetAiUsageSummary(req.dakinisBusiness.id, days);
  return dakinisJsonSuccess({ usage }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleBenchmarkRealGet(req) {
  const real = await dakinisComputeRealSectorBenchmark(req.dakinisBusiness.type);
  const base = await dakinisGatherTenantSignals(req.dakinisBusiness);
  const growth = await dakinisGatherGrowthSignals(req.dakinisBusiness.id, base);
  const staticBench = dakinisCompareToSector(req.dakinisBusiness.type, {
    salesMonthDeltaPct: growth.salesMonthDeltaPct,
    crmContacts: base.crmContacts,
    reservations7d: base.reservations7d,
    occupancyPct: Math.min(95, 40 + (base.reservations7d || 0) * 2)
  });

  const comparisons = [];
  if (real?.metrics) {
    for (const [key, avg] of Object.entries(real.metrics)) {
      let tenantValue = 0;
      if (key === "crm_contacts_avg") tenantValue = base.crmContacts || 0;
      if (key === "activities_30d_avg") tenantValue = base.activities7d || 0;
      if (key === "whatsapp_messages_30d_avg") tenantValue = base.whatsappMessages7d || 0;
      const delta = avg > 0 ? ((tenantValue - avg) / avg) * 100 : 0;
      comparisons.push({
        key,
        tenantValue,
        networkAverage: avg,
        deltaPct: Math.round(delta * 10) / 10,
        narrative:
          delta > 8
            ? `${Math.round(delta)}% por encima de la red Dakinis (${real.sampleSize} negocios)`
            : delta < -8
              ? `${Math.abs(Math.round(delta))}% por debajo de la red Dakinis`
              : "En línea con la red Dakinis"
      });
    }
  }

  return dakinisJsonSuccess(
    {
      real,
      static: staticBench,
      networkComparisons: comparisons,
      preferred: real?.sampleSize >= 3 ? "dakinis_network_anonymized" : "sector_reference"
    },
    req.dakinisBusiness.type,
    dakinisMeta(req.dakinisBusiness)
  );
}

export async function dakinisHandleMarketplaceInstallPost(req, rawBody) {
  const err = dakinisRequireJwt(req);
  if (err) return err;
  const body = dakinisParseJson(rawBody);
  const moduleKey = String(body?.moduleKey || "").trim();
  if (!moduleKey) return dakinisJsonError(400, "VALIDATION_ERROR", "moduleKey requerido");

  const overrides = await dakinisMarketplaceInstallModule(req.dakinisBusiness.id, moduleKey);
  const modules = dakinisResolveTenantModules(req.dakinisBusiness, overrides);
  return dakinisJsonSuccess(
    { installed: moduleKey, overrides, modules: modules.marketplace },
    req.dakinisBusiness.type,
    dakinisMeta(req.dakinisBusiness)
  );
}

export async function dakinisHandleIntelligenceActionExecutePost(req, actionId) {
  const err = dakinisRequireJwt(req);
  if (err) return err;
  const row = await dakinisGetPendingAction(req.dakinisBusiness.id, actionId);
  if (!row) return dakinisJsonError(404, "NOT_FOUND", "Accion no encontrada");
  if (row.status !== "pending") {
    return dakinisJsonError(409, "ALREADY_HANDLED", `Accion ya ${row.status}`);
  }
  const result = await dakinisExecutePendingAction(req.dakinisBusiness, row);
  const { dakinisRun } = await import("../db/query.js");
  const { dakinisSqlTimestampNow } = await import("../db/dialect.js");
  const ts = dakinisSqlTimestampNow();
  await dakinisRun(
    `UPDATE tenant_pending_actions SET status = ?, executed_at = ${ts} WHERE id = ?`,
    [result.executed ? "executed" : "failed", actionId]
  );
  return dakinisJsonSuccess({ actionId, ...result }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandlePortalSettingsGet(req) {
  const portal = await dakinisGetPortalSettings(req.dakinisBusiness.id);
  const template = dakinisGetIndustryTemplate(req.dakinisBusiness.type);
  return dakinisJsonSuccess(
    { portal, suggestedFeatures: template?.portalFeatures || [] },
    req.dakinisBusiness.type,
    dakinisMeta(req.dakinisBusiness)
  );
}

export async function dakinisHandlePortalSettingsPatch(req, rawBody) {
  const err = dakinisRequireJwt(req);
  if (err) return err;
  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  const portal = await dakinisUpsertPortalSettings(req.dakinisBusiness.id, body);
  return dakinisJsonSuccess({ portal }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandlePublicPortalGet(slug) {
  const portal = await dakinisResolvePortalByKey(slug);
  if (!portal) {
    return dakinisJsonError(404, "NOT_FOUND", "Portal cliente no disponible", { slug });
  }
  return dakinisJsonSuccess({ portal }, "public", { public: true });
}

export async function dakinisHandleNetworkOrdersGet(req) {
  const orders = await dakinisListNetworkOrders(req.dakinisBusiness.id);
  return dakinisJsonSuccess({ orders }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleNetworkOrdersPost(req, rawBody) {
  const err = dakinisRequireJwt(req);
  if (err) return err;
  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  try {
    const order = await dakinisCreateNetworkOrder(req.dakinisBusiness.id, body);
    return dakinisJsonSuccess(
      {
        order: {
          id: order.id,
          toBusinessId: order.to_business_id,
          status: order.status,
          lines: JSON.parse(order.lines_json || "[]")
        }
      },
      req.dakinisBusiness.type,
      dakinisMeta(req.dakinisBusiness)
    );
  } catch (e) {
    return dakinisJsonError(400, e?.code || "ERROR", e instanceof Error ? e.message : "Error");
  }
}

export async function dakinisHandleCopilotPost(req, rawBody) {
  const body = dakinisParseJson(rawBody) || {};
  const base = await dakinisGatherTenantSignals(req.dakinisBusiness);
  const signals = await dakinisGatherGrowthSignals(req.dakinisBusiness.id, base);
  const result = await dakinisIntelligenceAskWithAgents(req.dakinisBusiness, signals, {
    question: body.question || body.prompt,
    telemetrySource: "copilot",
    userId: req.dakinisAuth?.userId || req.user?.id || null
  });
  return dakinisJsonSuccess({ copilot: result }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export function dakinisHandleBosRoute(req, rawBody, url) {
  const path = url.pathname;

  if (req.method === "GET" && path === "/api/v1/tenant/billing/summary") {
    return dakinisHandleBillingSummaryGet(req);
  }
  if (req.method === "GET" && path === "/api/v1/tenant/ai/usage") {
    return dakinisHandleAiUsageGet(req, url);
  }
  if (req.method === "GET" && path === "/api/v1/tenant/benchmark/real") {
    return dakinisHandleBenchmarkRealGet(req);
  }
  if (req.method === "POST" && path === "/api/v1/tenant/marketplace/install") {
    return dakinisHandleMarketplaceInstallPost(req, rawBody);
  }
  if (req.method === "POST" && path === "/api/v1/tenant/copilot") {
    return dakinisHandleCopilotPost(req, rawBody);
  }
  const actionExec = /^\/api\/v1\/tenant\/intelligence\/actions\/([^/]+)\/execute$/.exec(path);
  if (actionExec && req.method === "POST") {
    return dakinisHandleIntelligenceActionExecutePost(req, decodeURIComponent(actionExec[1]));
  }
  if (req.method === "GET" && path === "/api/v1/tenant/portal/settings") {
    return dakinisHandlePortalSettingsGet(req);
  }
  if (req.method === "PATCH" && path === "/api/v1/tenant/portal/settings") {
    return dakinisHandlePortalSettingsPatch(req, rawBody);
  }
  if (req.method === "GET" && path === "/api/v1/tenant/network/orders") {
    return dakinisHandleNetworkOrdersGet(req);
  }
  if (req.method === "POST" && path === "/api/v1/tenant/network/orders") {
    return dakinisHandleNetworkOrdersPost(req, rawBody);
  }

  return null;
}
