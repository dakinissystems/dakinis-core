import { mapCmdkScopeToSearch } from "@dakinis/shared-ux/command-palette";
import { dakinisTenantJsonFetch } from "./api.js";

/**
 * @param {object} session
 * @param {string} q
 * @param {string} [scope="all"]
 * @param {{ signal?: AbortSignal }} [options]
 */
export async function dakinisFetchSearchHits(session, q, scope = "all", options = {}) {
  const searchScope = mapCmdkScopeToSearch(scope);
  const params = new URLSearchParams({
    q: String(q || "").trim(),
    scope: searchScope,
  });
  const json = await dakinisTenantJsonFetch(`/api/search/query?${params}`, session, {
    signal: options.signal,
  });
  return json?.data?.hits || [];
}
