import { DakinisApiError, dakinisTenantJsonFetch } from "./api.js";
import { dakinisDefaultFloorTables } from "../utils/restaurantFloorPlan.js";

function dakinisNormalizeFloorPayload(data) {
  const tables = data?.tables;
  const sessions = data?.sessions ?? {};
  return {
    tables: Array.isArray(tables) && tables.length ? tables : dakinisDefaultFloorTables(),
    sessions: sessions && typeof sessions === "object" && !Array.isArray(sessions) ? sessions : {}
  };
}

/**
 * Plano de mesas: GET /floor (ligero). Si falla, mesas por defecto.
 * No usa /kitchen (evita duplicar carga y 429).
 */
export async function dakinisFetchRestaurantFloor(apiSession, fetchOpts) {
  try {
    const json = await dakinisTenantJsonFetch("/api/tenant/restaurant/floor", apiSession, fetchOpts);
    return dakinisNormalizeFloorPayload(json?.data);
  } catch (err) {
    if (
      err instanceof DakinisApiError &&
      (err.status === 404 || err.status === 429 || err.code === "NOT_FOUND" || err.code === "RATE_LIMIT_EXCEEDED")
    ) {
      return { tables: dakinisDefaultFloorTables(), sessions: {} };
    }
    throw err;
  }
}
