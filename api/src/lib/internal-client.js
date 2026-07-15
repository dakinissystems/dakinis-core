/**
 * Cliente HTTP hacia dakinis-internal-api (Hub dashboard, eventos).
 */

function dakinisInternalBaseUrl() {
  const direct = (process.env.DAKINIS_INTERNAL_URL || "").replace(/\/$/, "");
  if (direct) return direct;
  const gateway = (process.env.DAKINIS_GATEWAY_URL || "").replace(/\/$/, "");
  if (gateway) return `${gateway}/internal`;
  return "http://dakinis-internal-api.railway.internal:4083";
}

function dakinisInternalServiceKey() {
  return String(
    process.env.DAKINIS_INTERNAL_SERVICE_KEY || process.env.INTERNAL_API_KEY || ""
  ).trim();
}

/**
 * @param {string} path
 * @param {RequestInit} [init]
 */
export async function dakinisInternalRequest(path, init = {}) {
  const url = `${dakinisInternalBaseUrl()}${path}`;
  const key = dakinisInternalServiceKey();
  const headers = {
    Accept: "application/json",
    ...(init.headers || {}),
  };
  if (key) {
    headers.Authorization = `Bearer ${key}`;
    headers["X-Internal-Api-Key"] = key;
  }
  const res = await fetch(url, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export function dakinisInternalConfigured() {
  return Boolean(
    process.env.DAKINIS_INTERNAL_URL ||
      process.env.DAKINIS_GATEWAY_URL ||
      process.env.DAKINIS_INTERNAL_SERVICE_KEY ||
      process.env.INTERNAL_API_KEY
  );
}

/** @param {string} platformUserId UUID IdP */
export async function dakinisFetchHubDashboard(platformUserId) {
  return dakinisInternalRequest(`/hub/dashboard/${encodeURIComponent(platformUserId)}`);
}
