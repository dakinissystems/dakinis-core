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

  function dakinisFormatOrderReadyMessage({ customerName, orderRef, table }) {
    const ref = orderRef || "tu pedido";
    const where = table ? ` (mesa ${table})` : "";
    return `Hola ${customerName}, ${ref}${where} está listo. ¡Te esperamos!`;
  }

  function dakinisFormatLowStockMessage({ itemName, qty }) {
    return `Aviso inventario: ${itemName} bajo mínimo (quedan ${qty ?? "?"} uds). Revisa reposición en Dakinis One.`;
  }

  /** Automatizaciones configuradas en la agenda WhatsApp (recordatorios, seguimiento). */
  function dakinisListAutomationRules() {
    return [
      { key: "reminder24h", event: "booking.created", enabled: config.whatsapp.reminder24h, channel: "whatsapp" },
      { key: "reminder2h", event: "booking.created", enabled: config.whatsapp.reminder2h, channel: "whatsapp" },
      {
        key: "postServiceFollowUp",
        event: "message.sent",
        enabled: config.whatsapp.postServiceFollowUp,
        channel: "whatsapp"
      },
      { key: "reservaConfirmada", event: "booking.created", enabled: true, channel: "whatsapp" },
      { key: "pedidoListo", event: "order.ready", enabled: true, channel: "whatsapp" },
      { key: "stockBajo", event: "inventory.low", enabled: false, channel: "whatsapp" }
    ];
  }

  /**
   * Vista previa de mensaje según tipo de evento de negocio.
   * @param {{ eventType?: string, payload?: Record<string, unknown> }} input
   */
  function dakinisPreviewEventMessage(input = {}) {
    const eventType = String(input.eventType || "booking.created");
    const p = input.payload && typeof input.payload === "object" ? input.payload : {};
    const customerName = String(p.customerName || p.clientName || "Cliente");
    const businessName = String(p.businessName || "Dakinis");

    switch (eventType) {
      case "order.ready":
        return dakinisFormatOrderReadyMessage({
          customerName,
          orderRef: p.orderRef,
          table: p.table
        });
      case "inventory.low":
        return dakinisFormatLowStockMessage({
          itemName: p.itemName || "Insumo",
          qty: p.qty
        });
      case "crm.lead.created":
        return dakinisFormatWinBackMessage({ customerName });
      case "booking.reminder":
        return dakinisFormatAppointmentReminderMessage({
          customerName,
          date: p.date || "mañana",
          time: p.time || "—",
          hoursBefore: p.hoursBefore ?? 24
        });
      default:
        return dakinisFormatBookingConfirmedMessage({
          customerName,
          date: p.date || "próximamente",
          time: p.time || "—",
          businessName
        });
    }
  }

  return {
    dakinisFormatBookingConfirmedMessage,
    dakinisFormatAppointmentReminderMessage,
    dakinisFormatWinBackMessage,
    dakinisFormatOrderReadyMessage,
    dakinisFormatLowStockMessage,
    dakinisListAutomationRules,
    dakinisPreviewEventMessage
  };
}
