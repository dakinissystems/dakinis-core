import { createHmac, timingSafeEqual } from "node:crypto";
import { randomUUID } from "node:crypto";
import { dakinisSqlTimestampNow } from "../db/dialect.js";
import { dakinisQueryOne, dakinisRun } from "../db/query.js";
import { dakinisJsonError } from "./responses.js";
import { dakinisResolveBusinessFromHeader } from "./business-context.js";
import { dakinisUpsertWhatsappContactInline } from "./whatsapp-webhook-store.js";

function dakinisNormalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function dakinisVerifyMetaSignature(rawBody, signatureHeader) {
  const secret = String(process.env.WHATSAPP_APP_SECRET || "").trim();
  if (!secret || !signatureHeader?.startsWith("sha256=")) return true;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = signatureHeader.slice("sha256=".length);
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(received, "hex"));
  } catch {
    return false;
  }
}

async function dakinisResolveWebhookBusiness() {
  const defaultId = String(process.env.WHATSAPP_DEFAULT_BUSINESS_ID || "").trim();
  if (!defaultId) return null;
  return dakinisResolveBusinessFromHeader(defaultId);
}

export function dakinisIsWhatsappWebhookPath(pathname, method) {
  return pathname === "/api/webhooks/whatsapp" && (method === "GET" || method === "POST");
}

export async function dakinisHandleWhatsappWebhook(req, rawBody, url) {
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    const verifyToken = String(process.env.WHATSAPP_VERIFY_TOKEN || "").trim();
    if (mode === "subscribe" && verifyToken && token === verifyToken && challenge) {
      return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
    }
    return dakinisJsonError(403, "FORBIDDEN", "Verificacion webhook Meta invalida");
  }

  const signature = req.headers["x-hub-signature-256"];
  if (!dakinisVerifyMetaSignature(rawBody, signature)) {
    return dakinisJsonError(401, "INVALID_SIGNATURE", "Firma Meta invalida");
  }

  let payload;
  try {
    payload = JSON.parse(rawBody || "{}");
  } catch {
    return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  }

  const business = await dakinisResolveWebhookBusiness();
  if (!business) {
    return dakinisJsonError(503, "WHATSAPP_NOT_CONFIGURED", "WHATSAPP_DEFAULT_BUSINESS_ID no configurado");
  }

  const entries = payload.entry || [];
  for (const entry of entries) {
    for (const change of entry.changes || []) {
      if (change.field !== "messages") continue;
      const value = change.value || {};
      for (const msg of value.messages || []) {
        if (msg.type !== "text" || !msg.text?.body) continue;
        const phone = dakinisNormalizePhone(msg.from);
        const id = `wam_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
        const now = dakinisSqlTimestampNow();
        await dakinisRun(
          `INSERT INTO tenant_whatsapp_messages (id, business_id, direction, wamid, peer_phone, body_text, msg_type, payload_json)
           VALUES (?, ?, 'inbound', ?, ?, ?, 'text', ?)`,
          [id, business.id, msg.id || null, phone, msg.text.body, JSON.stringify(msg)]
        );
        await dakinisUpsertWhatsappContactInline(business.id, phone, value.contacts?.[0]?.profile?.name);
      }
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
