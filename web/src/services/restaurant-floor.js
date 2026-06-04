import { DakinisApiError, dakinisTenantJsonFetch } from "./api.js";
import { dakinisDefaultFloorTables } from "../utils/restaurantFloorPlan.js";

function dakinisNormalizeFloorPayload(data) {
  const tables = data?.tables;
  const sessions = data?.sessions ?? {};
  return {
    tables: Array.isArray(tables) && tables.length ? tables : dakinisDefaultFloorTables(),
    sessions
  };
}

/**
 * Plano de mesas: primero `floor` en GET /kitchen (evita 404 en APIs sin ruta /floor),
 * luego GET /floor, luego mesas por defecto.
 */
export async function dakinisFetchRestaurantFloor(apiSession, fetchOpts) {
  try {
    const kitchen = await dakinisTenantJsonFetch("/api/tenant/restaurant/kitchen", apiSession, fetchOpts);
    if (kitchen?.data?.floor?.tables) {
      return dakinisNormalizeFloorPayload(kitchen.data.floor);
    }
  } catch {
    /* kitchen no disponible */
  }

  try {
    const json = await dakinisTenantJsonFetch("/api/tenant/restaurant/floor", apiSession, fetchOpts);
    return dakinisNormalizeFloorPayload(json?.data);
  } catch (err) {
    if (err instanceof DakinisApiError && (err.status === 404 || err.code === "NOT_FOUND")) {
      return { tables: dakinisDefaultFloorTables(), sessions: {} };
    }
    throw err;
  }
}
