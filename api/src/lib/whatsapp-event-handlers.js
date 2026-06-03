import { dakinisSubscribeEvent } from "./event-bus.js";
import { dakinisSendWhatsappText } from "../services/whatsapp-cloud.js";
import { dakinisIsWhatsappConfigured } from "../services/whatsapp-config.js";
import { dakinisStoreWhatsappMessage } from "../services/whatsapp-store.js";

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
      const tenantId = event.payload?.tenantId;
      const phone = event.payload?.phone || event.payload?.to;
      const text = event.payload?.message || event.payload?.text;

      if (!autoSend) {
        console.info("[whatsapp-rules] queued (dry-run)", {
          eventType,
          ruleKey,
          tenantId,
          recordId: event.payload?.recordId
        });
        return;
      }

      if (!dakinisIsWhatsappConfigured()) {
        console.warn("[whatsapp-auto] skip: not configured", { eventType, ruleKey, tenantId });
        return;
      }

      if (!phone || !text || !tenantId) {
        console.info("[whatsapp-auto] skip: missing phone/message/tenantId", {
          eventType,
          ruleKey,
          tenantId
        });
        return;
      }

      try {
        const result = await dakinisSendWhatsappText({ to: phone, text });
        await dakinisStoreWhatsappMessage(String(tenantId), {
          direction: "outbound",
          to: result.phone,
          text: String(text).trim(),
          wamid: result.messageId,
          automation: ruleKey,
          eventType
        });
        console.info("[whatsapp-auto] sent", { eventType, ruleKey, tenantId, wamid: result.messageId });
      } catch (err) {
        console.error("[whatsapp-auto] send failed", {
          eventType,
          ruleKey,
          tenantId,
          message: err instanceof Error ? err.message : err
        });
      }
    });
  }

  dakinisSubscribeEvent("whatsapp.message.inbound", async (event) => {
    console.info("[whatsapp-inbound]", {
      tenantId: event.payload?.tenantId,
      from: event.payload?.from,
      wamid: event.payload?.wamid
    });
  });
}
