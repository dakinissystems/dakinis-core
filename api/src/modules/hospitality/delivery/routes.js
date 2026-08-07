import { dakinisIsHospitalityBusiness } from "@dakinis/shared/catalog/hospitality.js";
import { dakinisQueryOne } from "../../../db/query.js";
import { dakinisJsonError, dakinisJsonSuccess } from "../../../api/responses.js";
import { dakinisRequireTenantJwt, dakinisRequireTenantJwtAdmin } from "../../../api/tenant-supply.js";
import {
  dakinisDeliveryDashboard,
  dakinisListDeliveryIntegrations,
  dakinisListDeliveryProviderHealth,
  dakinisUpsertDeliveryIntegration,
  dakinisDeliverySimulateManualOrder,
  dakinisHandleProviderWebhook,
  dakinisEnsureDeliveryListeners
} from "./DeliveryService.js";
import { dakinisListDeliveryJobs } from "./DeliveryQueue.js";
import { dakinisDeliveryTelemetrySnapshot } from "./DeliveryTelemetry.js";
import {
  dakinisListPriceLists,
  dakinisUpsertPriceListItem,
  dakinisPatchPriceListRules,
  dakinisEnsureDefaultPriceLists
} from "../PriceListService.js";
import { dakinisGlovoWebhook, dakinisUberWebhook, dakinisJustEatWebhook } from "./webhooks/index.js";

dakinisEnsureDeliveryListeners();

function dakinisParseJson(rawBody) {
  try {
    return JSON.parse(rawBody || "{}");
  } catch {
    return null;
  }
}

function dakinisMeta(req) {
  return { businessId: req.dakinisBusiness?.id, businessSlug: req.dakinisBusiness?.slug };
}

function dakinisHospitalityGate(req) {
  if (!req.dakinisBusiness || !dakinisIsHospitalityBusiness(req.dakinisBusiness.type)) {
    return dakinisJsonError(403, "FORBIDDEN", "Modulo delivery solo para hosteleria");
  }
  return null;
}

function dakinisHeaders(req) {
  const h = req.headers || {};
  const out = {};
  for (const [k, v] of Object.entries(h)) out[String(k).toLowerCase()] = v;
  return out;
}

/** Resuelve businessId desde query/header/body para webhooks públicos. */
async function dakinisResolveWebhookBusiness(req, rawBody) {
  const url = new URL(req.url || "/", "http://local");
  const slug = url.searchParams.get("business") || url.searchParams.get("slug") || "";
  const body = dakinisParseJson(rawBody) || {};
  const key = slug || body.businessSlug || body.store_id || req.headers?.["x-business-slug"] || "";
  if (!key) return null;
  return dakinisQueryOne(`SELECT id, slug, name, type FROM business WHERE lower(slug) = lower(?) OR id = ?`, [
    key,
    key
  ]);
}

export async function dakinisHandleDeliveryDashboardGet(req) {
  const gate = dakinisHospitalityGate(req);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;
  const data = await dakinisDeliveryDashboard(req.dakinisBusiness.id);
  return dakinisJsonSuccess(data, req.dakinisBusiness.type, dakinisMeta(req));
}

/** Health agregado de proveedores (una sola llamada para el panel). */
export async function dakinisHandleDeliveryProvidersGet(req) {
  const gate = dakinisHospitalityGate(req);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;
  const providers = await dakinisListDeliveryProviderHealth(req.dakinisBusiness.id);
  return dakinisJsonSuccess(
    { providers, telemetry: dakinisDeliveryTelemetrySnapshot() },
    req.dakinisBusiness.type,
    dakinisMeta(req)
  );
}

export async function dakinisHandleDeliveryIntegrationsGet(req) {
  const gate = dakinisHospitalityGate(req);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;
  const integrations = await dakinisListDeliveryIntegrations(req.dakinisBusiness.id);
  return dakinisJsonSuccess({ integrations }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleDeliveryIntegrationsPatch(req, providerId, rawBody) {
  const gate = dakinisHospitalityGate(req);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwtAdmin(req);
  if (jwtErr) return jwtErr;
  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  const row = await dakinisUpsertDeliveryIntegration(req.dakinisBusiness.id, providerId, body);
  return dakinisJsonSuccess({ integration: row }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleDeliverySimulatePost(req, rawBody) {
  const gate = dakinisHospitalityGate(req);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwtAdmin(req);
  if (jwtErr) return jwtErr;
  const body = dakinisParseJson(rawBody) || {};
  const result = await dakinisDeliverySimulateManualOrder(req.dakinisBusiness.id, body, {
    venueName: req.dakinisBusiness.name
  });
  if (result.error) return dakinisJsonError(result.error.status, result.error.code, result.error.message);
  return dakinisJsonSuccess({ order: result.order, duplicate: !!result.duplicate }, req.dakinisBusiness.type, {
    ...dakinisMeta(req),
    status: result.duplicate ? 200 : 201
  });
}

export async function dakinisHandleDeliveryJobsGet(req) {
  const gate = dakinisHospitalityGate(req);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;
  const { jobs, counts } = await dakinisListDeliveryJobs(req.dakinisBusiness.id);
  return dakinisJsonSuccess({ jobs, counts }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandlePriceListsGet(req) {
  const gate = dakinisHospitalityGate(req);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;
  await dakinisEnsureDefaultPriceLists(req.dakinisBusiness.id);
  const lists = await dakinisListPriceLists(req.dakinisBusiness.id);
  return dakinisJsonSuccess({ lists }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandlePriceListPatch(req, listKey, rawBody) {
  const gate = dakinisHospitalityGate(req);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwtAdmin(req);
  if (jwtErr) return jwtErr;
  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  if (body.itemId != null && body.priceEur != null) {
    const r = await dakinisUpsertPriceListItem(req.dakinisBusiness.id, listKey, body.itemId, body.priceEur);
    if (r.error) return dakinisJsonError(r.error.status, r.error.code, r.error.message);
  }
  const rules = await dakinisPatchPriceListRules(req.dakinisBusiness.id, listKey, body);
  if (rules.error) return dakinisJsonError(rules.error.status, rules.error.code, rules.error.message);

  const lists = await dakinisListPriceLists(req.dakinisBusiness.id);
  return dakinisJsonSuccess({ lists }, req.dakinisBusiness.type, dakinisMeta(req));
}

/** Webhooks públicos (identifican tenant por ?business=slug). */
export async function dakinisHandlePublicDeliveryWebhook(req, provider, rawBody) {
  const biz = await dakinisResolveWebhookBusiness(req, rawBody);
  if (!biz || !dakinisIsHospitalityBusiness(biz.type)) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "Indica ?business=slug del tenant hospitality");
  }
  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  const headers = dakinisHeaders(req);

  let result;
  if (provider === "glovo") result = await dakinisGlovoWebhook(biz.id, body, headers);
  else if (provider === "uber" || provider === "ubereats") result = await dakinisUberWebhook(biz.id, body, headers);
  else if (provider === "justeat") result = await dakinisJustEatWebhook(biz.id, body, headers);
  else result = await dakinisHandleProviderWebhook(biz.id, provider, body.event, body, headers);

  if (result?.error) return dakinisJsonError(result.error.status, result.error.code, result.error.message);
  return dakinisJsonSuccess(result, biz.type, { businessId: biz.id, businessSlug: biz.slug });
}

/**
 * Router helper — true si consumió la ruta.
 * @returns {Promise<object|null>}
 */
export async function dakinisHandleHospitalityDeliveryRoute(req, rawBody, path) {
  if (path === "/api/tenant/restaurant/delivery/dashboard" && req.method === "GET") {
    return dakinisHandleDeliveryDashboardGet(req);
  }
  if (path === "/api/tenant/hospitality/delivery/dashboard" && req.method === "GET") {
    return dakinisHandleDeliveryDashboardGet(req);
  }
  if (
    (path === "/api/tenant/restaurant/delivery/providers" ||
      path === "/api/tenant/hospitality/delivery/providers") &&
    req.method === "GET"
  ) {
    return dakinisHandleDeliveryProvidersGet(req);
  }
  if (
    (path === "/api/tenant/restaurant/delivery/integrations" ||
      path === "/api/tenant/hospitality/delivery/integrations") &&
    req.method === "GET"
  ) {
    return dakinisHandleDeliveryIntegrationsGet(req);
  }
  const intPatch = /^\/api\/tenant\/(?:restaurant|hospitality)\/delivery\/integrations\/([^/]+)$/.exec(path);
  if (intPatch && req.method === "PATCH") {
    return dakinisHandleDeliveryIntegrationsPatch(req, intPatch[1], rawBody);
  }
  if (
    (path === "/api/tenant/restaurant/delivery/simulate" || path === "/api/tenant/hospitality/delivery/simulate") &&
    req.method === "POST"
  ) {
    return dakinisHandleDeliverySimulatePost(req, rawBody);
  }
  if (
    (path === "/api/tenant/restaurant/delivery/jobs" || path === "/api/tenant/hospitality/delivery/jobs") &&
    req.method === "GET"
  ) {
    return dakinisHandleDeliveryJobsGet(req);
  }
  if (
    (path === "/api/tenant/restaurant/price-lists" || path === "/api/tenant/hospitality/price-lists") &&
    req.method === "GET"
  ) {
    return dakinisHandlePriceListsGet(req);
  }
  const plPatch = /^\/api\/tenant\/(?:restaurant|hospitality)\/price-lists\/([^/]+)$/.exec(path);
  if (plPatch && req.method === "PATCH") {
    return dakinisHandlePriceListPatch(req, plPatch[1], rawBody);
  }

  const wh = /^\/api\/integrations\/(glovo|uber|ubereats|justeat|manual|failure|stress|replay)\/webhook$/.exec(path);
  if (wh && req.method === "POST") {
    const provider = wh[1] === "uber" ? "ubereats" : wh[1];
    return dakinisHandlePublicDeliveryWebhook(req, provider, rawBody);
  }

  return null;
}
