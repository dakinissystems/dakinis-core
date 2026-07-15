import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import { dakinisQueryOne } from "../db/query.js";
import {
  dakinisFetchHubDashboard,
  dakinisInternalConfigured,
} from "../lib/internal-client.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Resuelve UUID IdP (platform_user_id) para Internal API hub dashboard.
 * @param {import('http').IncomingMessage} req
 */
async function dakinisResolvePlatformUserId(req) {
  const auth = req.dakinisAuth;
  if (!auth?.userId) return null;

  const row = await dakinisQueryOne(
    "SELECT platform_user_id FROM users WHERE id = ?",
    [auth.userId]
  );
  const platformId = String(row?.platform_user_id || "").trim();
  if (UUID_RE.test(platformId)) return platformId;

  if (UUID_RE.test(String(auth.userId))) return String(auth.userId);
  return null;
}

/**
 * GET /api/hub/dashboard
 * Proxy autenticado → Internal API hub dashboard (Mi día).
 */
export async function dakinisHandleHubDashboard(req) {
  const platformUserId = await dakinisResolvePlatformUserId(req);
  if (!platformUserId) {
    return dakinisJsonSuccess(
      {
        stub: true,
        miDiaEnabled: false,
        widgetValues: {},
        actions: [],
        notifications: [],
        timeline: [],
        message: "platform_user_id no disponible — usa SSO IdP para Mi día completo",
      },
      "hub"
    );
  }

  if (!dakinisInternalConfigured()) {
    return dakinisJsonSuccess(
      {
        stub: true,
        userId: platformUserId,
        miDiaEnabled: false,
        widgetValues: {},
        actions: [],
        notifications: [],
        timeline: [],
        message: "Internal API no configurada (DAKINIS_INTERNAL_URL)",
      },
      "hub"
    );
  }

  const result = await dakinisFetchHubDashboard(platformUserId);
  if (!result.ok) {
    return dakinisJsonError(
      result.status || 502,
      "HUB_UPSTREAM_ERROR",
      result.data?.error || result.data?.message || "Hub dashboard fetch failed"
    );
  }

  return dakinisJsonSuccess(result.data, "hub");
}
