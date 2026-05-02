export function dakinisCreateCrmModule(config) {
  function dakinisGetClientSegment(client) {
    if ((client.totalVisits || 0) >= config.crm.vipThreshold) return "VIP";
    if ((client.daysSinceLastVisit || 0) >= config.crm.lostClientDays) return "LOST";
    return "ACTIVE";
  }

  function dakinisBuildClientTimeline(client) {
    return [
      { type: "LAST_VISIT", value: client.lastVisit || null },
      { type: "NEXT_VISIT", value: client.nextVisit || null },
      { type: "TOTAL_PURCHASES", value: client.totalPurchases || 0 }
    ];
  }

  return {
    dakinisGetClientSegment,
    dakinisBuildClientTimeline
  };
}
