export const dakinisRealEstateAdapter = {
  agenda: {
    slotMinutes: 60,
    allowOverbooking: true
  },
  crm: {
    vipThreshold: 2,
    lostClientDays: 90
  },
  leads: {
    stages: ["nuevo", "contactado", "visita", "propuesta", "cerrado", "perdido"]
  },
  dashboard: {
    includeLeadConversion: true
  }
};
