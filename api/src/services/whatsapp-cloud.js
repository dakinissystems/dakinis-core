import { dakinisWhatsappConfig, dakinisIsWhatsappConfigured } from "./whatsapp-config.js";

/** E.164 sin + (solo dígitos). */
export function dakinisNormalizeWhatsappPhone(raw) {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits || digits.length < 8 || digits.length > 15) {
    return null;
  }
  return digits;
}

/**
 * Envía un mensaje de texto por WhatsApp Cloud API.
 * @param {{ to: string, text: string }} params
 */
export async function dakinisSendWhatsappText({ to, text }) {
  if (!dakinisIsWhatsappConfigured()) {
    const err = new Error("WhatsApp no configurado (WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID)");
    err.code = "WHATSAPP_NOT_CONFIGURED";
    throw err;
  }

  const phone = dakinisNormalizeWhatsappPhone(to);
  if (!phone) {
    const err = new Error("Número de teléfono inválido");
    err.code = "INVALID_PHONE";
    throw err;
  }

  const bodyText = String(text ?? "").trim();
  if (!bodyText) {
    const err = new Error("Mensaje vacío");
    err.code = "EMPTY_MESSAGE";
    throw err;
  }

  const { accessToken, phoneNumberId, graphVersion } = dakinisWhatsappConfig();
  const url = `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: { body: bodyText }
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(
      data?.error?.message || `WhatsApp API error ${res.status}`
    );
    err.code = "WHATSAPP_API_ERROR";
    err.status = res.status;
    err.details = data?.error || data;
    throw err;
  }

  const messageId = data?.messages?.[0]?.id || null;
  return { phone, messageId, raw: data };
}
