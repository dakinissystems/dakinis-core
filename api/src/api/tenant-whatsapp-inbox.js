import { randomUUID } from "node:crypto";
import { dakinisSqlOrderCreatedAtDesc, dakinisSqlTimestampNow } from "../db/dialect.js";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun } from "../db/query.js";
import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import { dakinisPlanModuleDenialOrNull } from "./plan-access.js";
import { dakinisRequireTenantJwt } from "./tenant-supply.js";

function dakinisParseJson(rawBody) {
  try {
    return JSON.parse(rawBody || "{}");
  } catch {
    return null;
  }
}

function dakinisNormalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function dakinisWhatsappForbiddenPlatform(business) {
  if (String(business.type).toLowerCase() === "platform") {
    return dakinisJsonError(403, "FORBIDDEN", "No aplica a cuentas de plataforma");
  }
  return null;
}

function dakinisMeta(req) {
  const b = req.dakinisBusiness;
  return { businessId: b.id, businessSlug: b.slug };
}

function dakinisRowMessage(row) {
  return {
    id: row.id,
    direction: row.direction,
    peerPhone: row.peer_phone,
    body: row.body_text,
    body_text: row.body_text,
    createdAt: row.created_at,
    storedAt: row.created_at
  };
}

function dakinisRowThread(row) {
  return {
    peerPhone: row.peer_phone,
    lastBody: row.last_body,
    lastAt: row.last_at,
    direction: row.direction
  };
}

function dakinisRowContact(row) {
  return {
    id: row.id,
    phone: row.phone,
    displayName: row.display_name,
    waProfileName: row.wa_profile_name,
    lastSeenAt: row.last_seen_at,
    createdAt: row.created_at
  };
}

async function dakinisUpsertWhatsappContact(businessId, phone) {
  const now = dakinisSqlTimestampNow();
  const existing = await dakinisQueryOne(
    `SELECT id FROM tenant_whatsapp_contacts WHERE business_id = ? AND phone = ?`,
    [businessId, phone]
  );
  if (existing) {
    await dakinisRun(`UPDATE tenant_whatsapp_contacts SET last_seen_at = ${now} WHERE id = ?`, [existing.id]);
    return existing.id;
  }

  const id = `wac_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  await dakinisRun(
    `INSERT INTO tenant_whatsapp_contacts (id, business_id, phone, last_seen_at)
     VALUES (?, ?, ?, ${now})`,
    [id, businessId, phone]
  );
  return id;
}

export function dakinisIsWhatsappInboxPath(pathname, method) {
  if (pathname === "/api/v1/whatsapp/conversations" && method === "GET") return true;
  if (pathname === "/api/v1/whatsapp/contacts" && method === "GET") return true;
  if (pathname === "/api/v1/whatsapp/send" && method === "POST") return true;
  return /^\/api\/v1\/whatsapp\/conversations\/[^/]+\/messages$/.test(pathname) && method === "GET";
}

export async function dakinisHandleWhatsappInbox(req, rawBody, url) {
  const business = req.dakinisBusiness;
  const path = url.pathname;

  const platformErr = dakinisWhatsappForbiddenPlatform(business);
  if (platformErr) return platformErr;

  const planDenied = dakinisPlanModuleDenialOrNull(business, path);
  if (planDenied) return planDenied;

  if (path === "/api/v1/whatsapp/conversations" && req.method === "GET") {
    const limitRaw = parseInt(url.searchParams.get("limit") || "50", 10);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 50;

    const rows = await dakinisQueryAll(
      `SELECT m.peer_phone, m.body_text AS last_body, m.created_at AS last_at, m.direction
         FROM tenant_whatsapp_messages m
         INNER JOIN (
           SELECT peer_phone, MAX(created_at) AS max_created
             FROM tenant_whatsapp_messages
            WHERE business_id = ?
            GROUP BY peer_phone
         ) latest
           ON m.peer_phone = latest.peer_phone AND m.created_at = latest.max_created
        WHERE m.business_id = ?
        ORDER BY ${dakinisSqlOrderCreatedAtDesc("m.created_at")}
        LIMIT ?`,
      [business.id, business.id, limit]
    );

    const threads = rows.map(dakinisRowThread);
    return dakinisJsonSuccess({ threads, conversations: threads }, business.type, dakinisMeta(req));
  }

  const messagesMatch = /^\/api\/v1\/whatsapp\/conversations\/([^/]+)\/messages$/.exec(path);
  if (messagesMatch && req.method === "GET") {
    const peer = dakinisNormalizePhone(decodeURIComponent(messagesMatch[1]));
    if (!peer) {
      return dakinisJsonError(400, "VALIDATION_ERROR", "Telefono invalido");
    }

    const limitRaw = parseInt(url.searchParams.get("limit") || "100", 10);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 100;

    const rows = await dakinisQueryAll(
      `SELECT id, direction, peer_phone, body_text, created_at
         FROM tenant_whatsapp_messages
        WHERE business_id = ? AND peer_phone = ?
        ORDER BY ${dakinisSqlOrderCreatedAtDesc("created_at")}
        LIMIT ?`,
      [business.id, peer, limit]
    );

    return dakinisJsonSuccess(
      { messages: rows.reverse().map(dakinisRowMessage) },
      business.type,
      dakinisMeta(req)
    );
  }

  if (path === "/api/v1/whatsapp/send" && req.method === "POST") {
    const jwtErr = dakinisRequireTenantJwt(req);
    if (jwtErr) return jwtErr;

    const body = dakinisParseJson(rawBody);
    if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

    const phone = dakinisNormalizePhone(body.phone);
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!phone) {
      return dakinisJsonError(400, "VALIDATION_ERROR", "phone es obligatorio");
    }
    if (!message) {
      return dakinisJsonError(400, "VALIDATION_ERROR", "message es obligatorio");
    }

    const id = `wam_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
    await dakinisRun(
      `INSERT INTO tenant_whatsapp_messages (id, business_id, direction, peer_phone, body_text, msg_type)
       VALUES (?, ?, 'outbound', ?, ?, 'text')`,
      [id, business.id, phone, message]
    );
    await dakinisUpsertWhatsappContact(business.id, phone);

    return dakinisJsonSuccess(
      { id, phone, message, status: "queued", direction: "outbound" },
      business.type,
      dakinisMeta(req)
    );
  }

  if (path === "/api/v1/whatsapp/contacts" && req.method === "GET") {
    const rows = await dakinisQueryAll(
      `SELECT id, phone, display_name, wa_profile_name, last_seen_at, created_at
         FROM tenant_whatsapp_contacts
        WHERE business_id = ?
        ORDER BY ${dakinisSqlOrderCreatedAtDesc("COALESCE(last_seen_at, created_at)")}`,
      [business.id]
    );

    return dakinisJsonSuccess({ contacts: rows.map(dakinisRowContact) }, business.type, dakinisMeta(req));
  }

  return dakinisJsonError(404, "NOT_FOUND", "Ruta WhatsApp no encontrada");
}
