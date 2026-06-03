import { dakinisSubscribeEvent, dakinisPublishEvent } from "./event-bus.js";
import { dakinisCrmFindContactByPhone, dakinisCrmIsReady } from "../services/crm-store.js";

/** Enlaza eventos WhatsApp entrantes con el bus CRM (contacto persistido). */
export function dakinisInitWhatsappCrmBridge() {
  dakinisSubscribeEvent("whatsapp.message.inbound", async (event) => {
    const tenantId = event.payload?.tenantId;
    const from = event.payload?.from;
    if (!tenantId || !from) return;

    let contactId = null;
    if (await dakinisCrmIsReady()) {
      const contact = await dakinisCrmFindContactByPhone(tenantId, String(from));
      contactId = contact?.id || null;
    }

    await dakinisPublishEvent("crm.whatsapp.inbound", {
      tenantId,
      contactId,
      phone: String(from),
      wamid: event.payload?.wamid,
      recordId: event.payload?.recordId,
      source: "whatsapp"
    });

    if (String(process.env.OPENAI_API_KEY || "").trim()) {
      console.info("[whatsapp-ai] inbound queued for AI (not implemented)", {
        tenantId,
        contactId,
        from: String(from).slice(-4)
      });
    }
  });
}
