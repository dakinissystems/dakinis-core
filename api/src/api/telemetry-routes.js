import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";

import {
  dakinisEndFeatureSession,
  dakinisGetAdoptionSummary,
  dakinisListRecentFeatureSessions,
  dakinisStartFeatureSession
} from "../services/telemetry-store.js";

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

function dakinisResolveUserId(req) {
  return req.dakinisAuth?.userId || req.user?.id || null;
}

export async function dakinisHandleTelemetryFeaturePost(req, rawBody) {
  const body = dakinisParseJson(rawBody);
  if (!body) {
    return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  }

  const event = String(body.event || body.action || "start").toLowerCase();
  const businessId = req.dakinisBusiness.id;
  const userId = dakinisResolveUserId(req);

  if (event === "end") {
    const sessionId = String(body.sessionId || body.id || "").trim();
    if (!sessionId) {
      return dakinisJsonError(400, "MISSING_SESSION", "sessionId requerido para cerrar sesion");
    }
    const closed = await dakinisEndFeatureSession(businessId, sessionId);
    if (!closed) {
      return dakinisJsonError(503, "TELEMETRY_UNAVAILABLE", "Telemetria no disponible");
    }
    return dakinisJsonSuccess({ telemetry: closed }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
  }

  const feature = String(body.feature || "").trim();
  if (!feature) {
    return dakinisJsonError(400, "MISSING_FEATURE", "feature requerido");
  }

  const started = await dakinisStartFeatureSession(businessId, userId, feature, {
    ...(body.meta && typeof body.meta === "object" ? body.meta : {}),
    path: body.path || body.meta?.path || null
  });
  if (!started) {
    return dakinisJsonError(503, "TELEMETRY_UNAVAILABLE", "Telemetria no disponible");
  }
  return dakinisJsonSuccess({ telemetry: started }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleTelemetryAdoptionGet(req, url) {
  const days = Number(url?.searchParams?.get("days") || 30);
  const includeRecent = url?.searchParams?.get("recent") === "1";
  const adoption = await dakinisGetAdoptionSummary(req.dakinisBusiness.id, days);
  const payload = { adoption };
  if (includeRecent) {
    payload.recent = await dakinisListRecentFeatureSessions(req.dakinisBusiness.id, 15);
  }
  return dakinisJsonSuccess(payload, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export function dakinisHandleTelemetryRoute(req, rawBody, url) {
  const path = url.pathname;

  if (req.method === "POST" && path === "/api/v1/tenant/telemetry/feature") {
    return dakinisHandleTelemetryFeaturePost(req, rawBody);
  }
  if (req.method === "GET" && path === "/api/v1/tenant/telemetry/adoption") {
    return dakinisHandleTelemetryAdoptionGet(req, url);
  }

  return null;
}
