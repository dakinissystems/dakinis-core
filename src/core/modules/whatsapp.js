export function dakinisCreateWhatsAppModule(config) {
  function dakinisBuildConfirmationMessage({ customerName, date, time }) {
    return `Hola ${customerName}, tu cita en Dakinis está confirmada para ${date} a las ${time}.`;
  }

  function dakinisBuildReminderMessage({ customerName, date, time, hoursBefore }) {
    return `Hola ${customerName}, te recordamos tu cita el ${date} a las ${time} (faltan ${hoursBefore}h).`;
  }

  function dakinisBuildReactivationMessage({ customerName }) {
    return `Hola ${customerName}, hace tiempo que no te vemos. ¿Quieres reservar nuevamente en Dakinis?`;
  }

  function dakinisGetEnabledAutomationRules() {
    return [
      { key: "reminder24h", enabled: config.whatsapp.reminder24h },
      { key: "reminder2h", enabled: config.whatsapp.reminder2h },
      { key: "postServiceFollowUp", enabled: config.whatsapp.postServiceFollowUp }
    ];
  }

  return {
    dakinisBuildConfirmationMessage,
    dakinisBuildReminderMessage,
    dakinisBuildReactivationMessage,
    dakinisGetEnabledAutomationRules
  };
}
