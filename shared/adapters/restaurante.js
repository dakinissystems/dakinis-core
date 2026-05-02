/** Configuracion por defecto para restaurante: turnos, mesas y fidelizacion. */
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
