/** Configuración por defecto para vertical Restaurante premium: turnos, mesas y fidelización. */
export const dakinisRestauranteAdapter = {
  agenda: {
    slotMinutes: 15,
    allowOverbooking: false
  },
  booking: {
    collectWhatsApp: true
  },
  crm: {
    vipThreshold: 8,
    lostClientDays: 60
  },
  leads: {
    stages: ["consulta", "reserva", "en_local", "cerrado", "no_show"]
  }
};
