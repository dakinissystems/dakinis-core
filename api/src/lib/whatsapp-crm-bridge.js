import { dakinisSubscribeEvent } from "./event-bus.js";
import { dakinisPublishEvent } from "./event-bus.js";

/** Fase 5: enlaza mensajes entrantes con CRM e IA (stub → eventos de dominio). */
export function dakinisInitWhatsappCrmBridge() {
  dakinisSubscribeEvent("whatsapp.message.inbound", async (event) => {
    const tenantId = event.payload?.tenantId;
    const from = event.payload?.from;
    if (!tenantId || !from) return;

    await dakinisPublishEvent("crm.whatsapp.inbound", {
      tenantId,
      phone: String(from),
      wamid: event.payload?.wamid,
      recordId: event.payload?.recordId,
      source: "whatsapp"
    });

    if (String(process.env.OPENAI_API_KEY || "").trim()) {
      console.info("[whatsapp-ai] inbound queued for AI (not implemented)", {
        tenantId,
        from: String(from).slice(-4)
      });
    }
  });
}
