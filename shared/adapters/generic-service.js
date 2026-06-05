/** Adaptador base para industrias sin adaptador específico (gimnasio, retail, hotel…). */
export const dakinisGenericServiceAdapter = {
  agenda: {
    slotMinutes: 30,
    allowOverbooking: false
  },
  booking: {
    collectWhatsApp: true
  },
  crm: {
    vipThreshold: 5,
    lostClientDays: 90
  },
  leads: {
    stages: ["nuevo", "contactado", "propuesta", "cerrado", "perdido"]
  },
  dashboard: {
    currency: "EUR",
    includeLeadConversion: true
  },
  whatsapp: {
    reminder24h: true,
    reminder2h: false,
    postServiceFollowUp: true
  }
};
