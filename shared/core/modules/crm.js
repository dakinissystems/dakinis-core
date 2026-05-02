export function dakinisCreateCrmModule(config) {
  /** Segmento comercial: VIP, ACTIVE o LOST según visitas y antigüedad. */
  function dakinisGetCustomerSegment(client) {
    if ((client.totalVisits || 0) >= config.crm.vipThreshold) return "VIP";
    if ((client.daysSinceLastVisit || 0) >= config.crm.lostClientDays) return "LOST";
    return "ACTIVE";
  }

  /** Resumen rápido del cliente para la ficha (última visita, próxima, compras). */
  function dakinisGetCustomerSnapshot(client) {
    return [
      { type: "LAST_VISIT", value: client.lastVisit || null },
      { type: "NEXT_VISIT", value: client.nextVisit || null },
      { type: "TOTAL_PURCHASES", value: client.totalPurchases || 0 }
    ];
  }

  return {
    dakinisGetCustomerSegment,
    dakinisGetCustomerSnapshot
  };
}
