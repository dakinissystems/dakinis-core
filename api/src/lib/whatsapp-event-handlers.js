import { dakinisSubscribeEvent } from "./event-bus.js";

const DAKINIS_WHATSAPP_EVENT_RULES = Object.freeze({
  "booking.created": "reservaConfirmada",
  "crm.lead.created": "reactivation",
  "order.ready": "pedidoListo",
  "inventory.low": "stockBajo"
});

export function dakinisInitWhatsappEventHandlers() {
  for (const [eventType, ruleKey] of Object.entries(DAKINIS_WHATSAPP_EVENT_RULES)) {
    dakinisSubscribeEvent(eventType, async (event) => {
      const autoSend = String(process.env.DAKINIS_WHATSAPP_AUTO_SEND || "").toLowerCase() === "true";
      if (autoSend) {
        console.info("[whatsapp-auto] send pending", { eventType, ruleKey, tenantId: event.payload?.tenantId });
        return;
      }
      console.info("[whatsapp-rules] queued (dry-run)", {
        eventType,
        ruleKey,
        tenantId: event.payload?.tenantId,
        recordId: event.payload?.recordId
      });
    });
  }
}
