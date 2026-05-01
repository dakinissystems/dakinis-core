import { dakinisAssert, dakinisDeepFreeze, dakinisMergeConfig } from "./utils.js";

export const DAKINIS_DEFAULT_CONFIG = dakinisDeepFreeze({
  agenda: {
    slotMinutes: 30,
    timezone: "Europe/Madrid",
    allowOverbooking: false
  },
  booking: {
    publicBookingEnabled: true,
    collectWhatsApp: true
  },
  crm: {
    vipThreshold: 3,
    lostClientDays: 60
  },
  whatsapp: {
    reminder24h: true,
    reminder2h: true,
    postServiceFollowUp: true
  },
  leads: {
    stages: ["nuevo", "contacto", "interesado", "pendiente", "cerrado", "perdido"]
  },
  dashboard: {
    currency: "EUR",
    includeLeadConversion: true
  }
});

export function dakinisValidateConfig(config) {
  dakinisAssert(config.agenda.slotMinutes > 0, "agenda.slotMinutes debe ser mayor que cero");
  dakinisAssert(Array.isArray(config.leads.stages) && config.leads.stages.length > 0, "leads.stages debe tener al menos una etapa");
  dakinisAssert(typeof config.dashboard.currency === "string" && config.dashboard.currency.length > 0, "dashboard.currency es obligatorio");
}

export function dakinisCreateConfig(overrides = {}) {
  const merged = dakinisMergeConfig(DAKINIS_DEFAULT_CONFIG, overrides);
  dakinisValidateConfig(merged);
  return dakinisDeepFreeze(merged);
}
