import crypto from "node:crypto";
import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import { dakinisWhatsappConfig, dakinisIsWhatsappConfigured } from "../services/whatsapp-config.js";
import { dakinisSendWhatsappText } from "../services/whatsapp-cloud.js";
import {
  dakinisStoreWhatsappMessage,
  dakinisListWhatsappMessages,
  dakinisListWhatsappThreads,
  dakinisListWhatsappThreadMessages,
  dakinisListWhatsappContacts,
  dakinisUpsertWhatsappContact
} from "../services/whatsapp-store.js";
import { dakinisResolveBusinessIdForWhatsapp } from "../services/whatsapp-tenant-resolve.js";
import { dakinisPublishEvent } from "../lib/event-bus.js";

function dakinisParseJsonSafely(rawBody) {
  if (!rawBody || !String(rawBody).trim()) return {};
  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
}

function dakinisVerifyMetaWebhookSignature(rawBody, signatureHeader) {
  const { appSecret } = dakinisWhatsappConfig();
  if (!appSecret) {
    return process.env.NODE_ENV !== "production";
  }
  if (!signatureHeader || typeof signatureHeader !== "string") return false;
  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody, "utf8")
    .digest("hex");
  const received = signatureHeader.replace(/^sha256=/i, "").trim();
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(received, "hex"));
  } catch {
    return false;
  }
}

/** GET — verificación del webhook (Meta). */
export function dakinisHandleWhatsappWebhookVerify(url) {
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const { verifyToken } = dakinisWhatsappConfig();

  if (!verifyToken) {
    return dakinisJsonError(
      503,
      "WHATSAPP_WEBHOOK_NOT_CONFIGURED",
      "Define WHATSAPP_VERIFY_TOKEN en el servidor"
    );
  }
  if (mode === "subscribe" && token === verifyToken && challenge) {
    return { status: 200, body: challenge, contentType: "text/plain" };
  }
  return dakinisJsonError(403, "FORBIDDEN", "Token de verificación inválido");
}

/** POST — mensajes entrantes y estados de entrega. */
export async function dakinisHandleWhatsappWebhookPost(rawBody, req) {
  const sig = req.headers["x-hub-signature-256"];
  if (!dakinisVerifyMetaWebhookSignature(rawBody, Array.isArray(sig) ? sig[0] : sig)) {
    return dakinisJsonError(403, "INVALID_SIGNATURE", "Firma X-Hub-Signature-256 inválida");
  }

  const payload = dakinisParseJsonSafely(rawBody);
  if (payload === null) {
    return dakinisJsonError(400, "INVALID_JSON", "JSON inválido");
  }

  const stored = [];
  const entries = Array.isArray(payload.entry) ? payload.entry : [];

  for (const entry of entries) {
    const changes = Array.isArray(entry.changes) ? entry.changes : [];
    for (const change of changes) {
      const value = change?.value;
      if (!value || typeof value !== "object") continue;

      const phoneNumberId = value.metadata?.phone_number_id;
      const businessId = await dakinisResolveBusinessIdForWhatsapp(phoneNumberId);
      if (!businessId) {
        console.warn("[whatsapp-webhook] tenant no resuelto", { phoneNumberId });
        continue;
      }

      const profileByWaId = new Map();
      for (const c of Array.isArray(value.contacts) ? value.contacts : []) {
        if (c.wa_id) profileByWaId.set(String(c.wa_id), c.profile?.name);
      }

      const messages = Array.isArray(value.messages) ? value.messages : [];
      for (const msg of messages) {
        const profileName = profileByWaId.get(String(msg.from));
        const record = {
          direction: "inbound",
          wamid: msg.id,
          from: msg.from,
          type: msg.type,
          timestamp: msg.timestamp,
          text: msg.text?.body,
          profileName,
          phoneNumberId,
          raw: msg
        };
        const id = await dakinisStoreWhatsappMessage(businessId, record);
        stored.push(id);
        await dakinisPublishEvent("whatsapp.message.inbound", {
          tenantId: businessId,
          recordId: id,
          from: msg.from,
          type: msg.type,
          wamid: msg.id
        });
      }

      const statuses = Array.isArray(value.statuses) ? value.statuses : [];
      for (const st of statuses) {
        await dakinisPublishEvent("whatsapp.message.status", {
          tenantId: businessId,
          wamid: st.id,
          status: st.status,
          recipientId: st.recipient_id
        });
      }
    }
  }

  return dakinisJsonSuccess({ received: true, storedCount: stored.length }, "custom");
}

/** POST — envío autenticado (tenant). */
export async function dakinisHandleWhatsappSend(req, rawBody, business, adapterKey) {
  if (!dakinisIsWhatsappConfigured()) {
    return dakinisJsonError(
      503,
      "WHATSAPP_NOT_CONFIGURED",
      "WhatsApp Cloud API no configurada en el servidor (variables WHATSAPP_*)"
    );
  }

  const payload = dakinisParseJsonSafely(rawBody);
  if (payload === null) {
    return dakinisJsonError(400, "INVALID_JSON", "JSON inválido");
  }

  const phone = payload.phone ?? payload.to;
  const message = payload.message ?? payload.text;
  if (!phone || !message) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "Campos requeridos: phone (o to) y message (o text)");
  }

  try {
    const result = await dakinisSendWhatsappText({ to: phone, text: message });
    const recordId = await dakinisStoreWhatsappMessage(business.id, {
      direction: "outbound",
      to: result.phone,
      text: String(message).trim(),
      wamid: result.messageId,
      sentBy: req.user?.id || req.dakinisAuth?.method || "api"
    });
    await dakinisPublishEvent("message.sent", {
      tenantId: business.id,
      channel: "whatsapp",
      kind: "manual",
      recordId
    });
    return dakinisJsonSuccess(
      { success: true, messageId: result.messageId, to: result.phone, recordId },
      adapterKey,
      { businessId: business.id }
    );
  } catch (err) {
    const code = err?.code || "WHATSAPP_SEND_FAILED";
    const status = err?.status && err.status >= 400 && err.status < 600 ? err.status : 502;
    return dakinisJsonError(status, code, err instanceof Error ? err.message : "Error al enviar", {
      details: err?.details
    });
  }
}

/** GET — hilos (conversaciones agrupadas). */
export async function dakinisHandleWhatsappConversations(business, adapterKey, url) {
  const limit = Number(url.searchParams.get("limit") || 50);
  const threads = await dakinisListWhatsappThreads(business.id, { limit });
  return dakinisJsonSuccess({ threads, conversations: threads }, adapterKey, {
    businessId: business.id
  });
}

/** GET — mensajes de un hilo. */
export async function dakinisHandleWhatsappThreadMessages(business, adapterKey, peerPhone, url) {
  const limit = Number(url.searchParams.get("limit") || 100);
  const messages = await dakinisListWhatsappThreadMessages(business.id, peerPhone, { limit });
  return dakinisJsonSuccess({ peerPhone, messages }, adapterKey, { businessId: business.id });
}

/** GET — contactos WhatsApp del tenant. */
export async function dakinisHandleWhatsappContacts(business, adapterKey) {
  const contacts = await dakinisListWhatsappContacts(business.id);
  return dakinisJsonSuccess({ contacts }, adapterKey, { businessId: business.id });
}

/** GET — lista plana (compat). */
export async function dakinisHandleWhatsappMessagesFlat(business, adapterKey, url) {
  const limit = Number(url.searchParams.get("limit") || 50);
  const messages = await dakinisListWhatsappMessages(business.id, { limit });
  return dakinisJsonSuccess({ messages }, adapterKey, { businessId: business.id });
}

/** POST — registrar contacto manual (fase 4). */
export async function dakinisHandleWhatsappContactUpsert(business, adapterKey, rawBody) {
  const payload = dakinisParseJsonSafely(rawBody);
  if (payload === null) {
    return dakinisJsonError(400, "INVALID_JSON", "JSON inválido");
  }
  const phone = payload.phone ?? payload.to;
  if (!phone) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "Campo phone requerido");
  }
  const id = await dakinisUpsertWhatsappContact(business.id, {
    phone,
    display_name: payload.displayName ?? payload.display_name,
    wa_profile_name: payload.waProfileName ?? payload.wa_profile_name
  });
  return dakinisJsonSuccess({ contactId: id }, adapterKey, { businessId: business.id });
}
