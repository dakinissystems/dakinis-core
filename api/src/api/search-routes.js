import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import { dakinisSearchQuery, dakinisSearchConfigured } from "../lib/search-client.js";

/** Alinea scopes UI Command Palette con Search API. */
function dakinisMapCmdkScopeToSearch(scope) {
  const map = {
    customers: "clients",
    documents: "documentation",
    orders: "global",
  };
  return map[scope] || scope || "all";
}

/**
 * GET /api/search/query?q=&scope=
 * Proxy autenticado hacia Search (Hub Ctrl+K).
 */
export async function dakinisHandleSearchQuery(req, url) {
  const q = url.searchParams.get("q") || "";
  const scopeRaw = url.searchParams.get("scope") || "all";
  const scope = dakinisMapCmdkScopeToSearch(scopeRaw);

  if (!dakinisSearchConfigured()) {
    return dakinisJsonError(503, "SEARCH_UNAVAILABLE", "Search service not configured");
  }

  const result = await dakinisSearchQuery(q, scope);
  if (!result.ok) {
    return dakinisJsonError(
      result.status || 502,
      "SEARCH_UPSTREAM_ERROR",
      result.data?.error || "Search query failed"
    );
  }

  const payload = result.data || {};
  return dakinisJsonSuccess(
    {
      query: payload.query ?? q,
      scope: payload.scope ?? scope,
      hits: payload.hits || [],
      total: payload.total ?? (payload.hits || []).length,
      mode: payload.mode || "unknown",
    },
    "search"
  );
}
