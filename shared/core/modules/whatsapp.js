export function dakinisCreateWhatsAppModule(config) {
  /** Texto listo para enviar tras confirmar la cita. */
  function dakinisFormatBookingConfirmedMessage({ customerName, date, time }) {
    return `Hola ${customerName}, tu cita en Dakinis está confirmada para ${date} a las ${time}.`;
  }

  /** Texto de recordatorio antes de la cita. */
  function dakinisFormatAppointmentReminderMessage({ customerName, date, time, hoursBefore }) {
    return `Hola ${customerName}, te recordamos tu cita el ${date} a las ${time} (faltan ${hoursBefore}h).`;
  }

  /** Mensaje para reactivar clientes inactivos. */
  function dakinisFormatWinBackMessage({ customerName }) {
    return `Hola ${customerName}, hace tiempo que no te vemos. ¿Quieres reservar nuevamente en Dakinis?`;
  }

  /** Automatizaciones configuradas en la agenda WhatsApp (recordatorios, seguimiento). */
  function dakinisListAutomationRules() {
    return [
      { key: "reminder24h", enabled: config.whatsapp.reminder24h },
      { key: "reminder2h", enabled: config.whatsapp.reminder2h },
      { key: "postServiceFollowUp", enabled: config.whatsapp.postServiceFollowUp }
    ];
  }

  return {
    dakinisFormatBookingConfirmedMessage,
    dakinisFormatAppointmentReminderMessage,
    dakinisFormatWinBackMessage,
    dakinisListAutomationRules
  };
}
