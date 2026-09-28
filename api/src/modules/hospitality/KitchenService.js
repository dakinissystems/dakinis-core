import { dakinisKitchenActiveOrders } from "./OrderService.js";
import { dakinisFloorGet } from "./FloorService.js";

/**
 * KitchenService — Fase 1: cola de pedidos activos + floor.
 * Fase 2: KitchenTicket / estaciones / métricas.
 */
export async function dakinisKitchenGetBoard(businessId) {
  const [activeOrders, floor] = await Promise.all([
    dakinisKitchenActiveOrders(businessId),
    dakinisFloorGet(businessId)
  ]);
  return {
    activeOrders,
    floor,
    stations: [] // stub KDS profesional
  };
}
