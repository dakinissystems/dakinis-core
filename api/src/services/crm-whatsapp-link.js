import {
  dakinisCrmFindOrCreateContactByPhone,
  dakinisCrmGetOrCreateConversation,
  dakinisCrmCreateActivity,
  dakinisCrmTouchConversation,
  dakinisCrmIsReady
} from "./crm-store.js";
import { dakinisRun } from "../db/query.js";

/** Resuelve contacto + conversación sin registrar actividad aún. */
export async function dakinisCrmEnsureWhatsappContext(businessId, phone, extras = {}) {
  if (!(await dakinisCrmIsReady())) return null;
  const contact = await dakinisCrmFindOrCreateContactByPhone(businessId, phone, {
    waProfileName: extras.profileName,
    source: "whatsapp"
  });
  if (!contact) return null;
  const conversation = await dakinisCrmGetOrCreateConversation(
    businessId,
    contact.id,
    phone
  );
  if (!conversation) return null;
  return { contact, conversation };
}

/**
 * Enlaza mensaje WhatsApp → contacto CRM → conversación → actividad.
 * @param {string} businessId
 * @param {{ phone: string, direction: string, body?: string, wamid?: string, messageId?: string, profileName?: string }} input
 */
export async function dakinisCrmLinkWhatsappMessage(businessId, input) {
  if (!(await dakinisCrmIsReady())) {
    return { linked: false, reason: "crm_not_ready" };
  }

  const phone = input.phone;
  let contact;
  let conversation;

  if (input.contactId && input.conversationId) {
    contact = { id: input.contactId };
    conversation = { id: input.conversationId };
  } else {
    contact = await dakinisCrmFindOrCreateContactByPhone(businessId, phone, {
      waProfileName: input.profileName,
      source: "whatsapp"
    });
    if (!contact) return { linked: false, reason: "invalid_phone" };

    conversation = await dakinisCrmGetOrCreateConversation(businessId, contact.id, phone);
    if (!conversation) return { linked: false, reason: "no_conversation" };
  }

  const messageId = input.messageId;
  if (messageId) {
    try {
      await dakinisRun(
        `UPDATE tenant_whatsapp_messages
         SET contact_id = ?, conversation_id = ?
         WHERE id = ? AND business_id = ?`,
        [contact.id, conversation.id, messageId, businessId]
      );
    } catch {
      /* tabla legacy */
    }
  }

  await dakinisCrmTouchConversation(conversation.id);

  if (input.direction === "inbound" && input.body && !input.messageId) {
    await dakinisCrmCreateActivity(
      businessId,
      contact.id,
      {
        type: "whatsapp",
        notes: String(input.body).slice(0, 2000)
      },
      "whatsapp"
    );
  }

  return {
    linked: true,
    contactId: contact.id,
    conversationId: conversation.id,
    contact
  };
}
