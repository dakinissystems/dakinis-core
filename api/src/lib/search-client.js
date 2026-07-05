/**
 * Cliente HTTP hacia dakinis-search (Hub Ctrl+K / Knowledge index).
 */

function dakinisSearchBaseUrl() {
  const direct = (process.env.DAKINIS_SEARCH_URL || "").replace(/\/$/, "");
  if (direct) return direct;
  const gateway = (process.env.DAKINIS_GATEWAY_URL || "").replace(/\/$/, "");
  if (gateway) return `${gateway}/search`;
  return "http://dakinis-search.railway.internal:4082";
}

/**
 * @param {string} path
 * @param {RequestInit} [init]
 */
export async function dakinisSearchRequest(path, init = {}) {
  const url = `${dakinisSearchBaseUrl()}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", ...(init.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

/** @param {string} q @param {string} [scope="all"] */
export async function dakinisSearchQuery(q, scope = "all") {
  const params = new URLSearchParams({
    q: String(q || ""),
    scope: String(scope || "all"),
  });
  return dakinisSearchRequest(`/v1/query?${params}`);
}

export function dakinisSearchConfigured() {
  return Boolean(process.env.DAKINIS_SEARCH_URL || process.env.DAKINIS_GATEWAY_URL);
}
