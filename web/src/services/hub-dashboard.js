import { dakinisTenantJsonFetch } from "./api.js";

/**
 * @param {object} session
 */
export async function dakinisFetchHubDashboard(session) {
  const json = await dakinisTenantJsonFetch("/api/hub/dashboard", session);
  return json?.data || json || null;
}
