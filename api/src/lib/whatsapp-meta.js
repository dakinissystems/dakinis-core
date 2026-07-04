/**
 * Meta WhatsApp Cloud API — envío y configuración.
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const GRAPH_VERSION = "v21.0";

export function dakinisWhatsappMetaConfigured() {
  return Boolean(
    String(process.env.WHATSAPP_ACCESS_TOKEN || "").trim() &&
      String(process.env.WHATSAPP_PHONE_NUMBER_ID || "").trim()
  );
}

export function dakinisWhatsappMetaConfig() {
  return {
    configured: dakinisWhatsappMetaConfigured(),
    phoneNumberId: String(process.env.WHATSAPP_PHONE_NUMBER_ID || "").trim() || null,
    defaultBusinessId: String(process.env.WHATSAPP_DEFAULT_BUSINESS_ID || "").trim() || null,
    verifyTokenSet: Boolean(String(process.env.WHATSAPP_VERIFY_TOKEN || "").trim()),
    appSecretSet: Boolean(String(process.env.WHATSAPP_APP_SECRET || "").trim()),
  };
}

/**
 * @param {string} phone E.164 digits only (e.g. 34637169174)
 * @param {string} text
 */
export async function dakinisWhatsappMetaSendText(phone, text) {
  const token = String(process.env.WHATSAPP_ACCESS_TOKEN || "").trim();
  const phoneNumberId = String(process.env.WHATSAPP_PHONE_NUMBER_ID || "").trim();
  if (!token || !phoneNumberId) {
    return { ok: false, error: "whatsapp_not_configured" };
  }

  const to = String(phone || "").replace(/\D/g, "");
  if (!to) {
    return { ok: false, error: "invalid_phone" };
  }

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`;
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body: String(text || "").slice(0, 4096) },
      }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    return { ok: false, error: "whatsapp_unreachable", message: err?.message || "fetch failed" };
  }

  const raw = await res.text();
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    json = { raw: raw.slice(0, 500) };
  }

  if (!res.ok) {
    return {
      ok: false,
      error: "whatsapp_api_error",
      status: res.status,
      message: json?.error?.message || raw.slice(0, 200),
      details: json,
    };
  }

  const wamid = json?.messages?.[0]?.id || null;
  return { ok: true, wamid, details: json };
}
