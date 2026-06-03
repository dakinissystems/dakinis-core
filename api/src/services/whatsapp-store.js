import { randomUUID } from "node:crypto";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun } from "../db/query.js";

const DAKINIS_WHATSAPP_ENTITY = "whatsapp.message";

async function dakinisWhatsappTablesReady() {
  try {
    const row = await dakinisQueryOne(
      "SELECT 1 AS ok FROM tenant_whatsapp_messages LIMIT 1"
    );
    return Boolean(row);
  } catch {
    return false;
  }
}

/**
 * @param {string} businessId
 * @param {Record<string, unknown>} record
 */
export async function dakinisStoreWhatsappMessage(businessId, record) {
  const peer =
    record.direction === "outbound"
      ? String(record.to || record.peer_phone || "")
      : String(record.from || record.peer_phone || "");
  const bodyText = String(record.text ?? record.body_text ?? "").trim() || null;
  const id = `wa_${randomUUID()}`;

  if (await dakinisWhatsappTablesReady()) {
    await dakinisRun(
      `INSERT INTO tenant_whatsapp_messages
        (id, business_id, direction, wamid, peer_phone, body_text, msg_type, payload_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        businessId,
        record.direction === "outbound" ? "outbound" : "inbound",
        record.wamid || null,
        peer,
        bodyText,
        String(record.type || record.msg_type || "text"),
        JSON.stringify(record)
      ]
    );
    if (peer) {
      await dakinisUpsertWhatsappContact(businessId, {
        phone: peer,
        wa_profile_name: record.profileName,
        display_name: record.displayName
      });
    }
    return id;
  }

  await dakinisRun(
    "INSERT INTO tenant_records (id, business_id, entity, payload) VALUES (?, ?, ?, ?)",
    [id, businessId, DAKINIS_WHATSAPP_ENTITY, JSON.stringify({ ...record, id, peer_phone: peer })]
  );
  return id;
}

/**
 * @param {string} businessId
 * @param {{ phone: string, display_name?: string, wa_profile_name?: string }} contact
 */
export async function dakinisUpsertWhatsappContact(businessId, contact) {
  if (!(await dakinisWhatsappTablesReady())) return null;
  const phone = String(contact.phone || "").replace(/\D/g, "");
  if (!phone) return null;

  const existing = await dakinisQueryOne(
    "SELECT id FROM tenant_whatsapp_contacts WHERE business_id = ? AND phone = ?",
    [businessId, phone]
  );
  const now = new Date().toISOString();
  if (existing?.id) {
    await dakinisRun(
      `UPDATE tenant_whatsapp_contacts
       SET display_name = COALESCE(?, display_name),
           wa_profile_name = COALESCE(?, wa_profile_name),
           last_seen_at = ?
       WHERE id = ?`,
      [contact.display_name || null, contact.wa_profile_name || null, now, existing.id]
    );
    return existing.id;
  }

  const id = `wac_${randomUUID()}`;
  await dakinisRun(
    `INSERT INTO tenant_whatsapp_contacts
      (id, business_id, phone, display_name, wa_profile_name, last_seen_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      businessId,
      phone,
      contact.display_name || null,
      contact.wa_profile_name || null,
      now
    ]
  );
  return id;
}

/**
 * @param {string} businessId
 */
export async function dakinisListWhatsappContacts(businessId) {
  if (await dakinisWhatsappTablesReady()) {
    return dakinisQueryAll(
      `SELECT id, phone, display_name, wa_profile_name, last_seen_at, created_at
       FROM tenant_whatsapp_contacts
       WHERE business_id = ?
       ORDER BY COALESCE(last_seen_at, created_at) DESC`,
      [businessId]
    );
  }
  const messages = await dakinisListWhatsappMessagesLegacy(businessId, { limit: 500 });
  const byPhone = new Map();
  for (const m of messages) {
    const phone = m.peer_phone || m.from || m.to;
    if (!phone) continue;
    if (!byPhone.has(phone)) {
      byPhone.set(phone, {
        id: `legacy_${phone}`,
        phone,
        display_name: m.profileName || null,
        wa_profile_name: null,
        last_seen_at: m.storedAt
      });
    }
  }
  return [...byPhone.values()];
}

/**
 * Hilos agrupados por peer_phone.
 * @param {string} businessId
 * @param {{ limit?: number }} [opts]
 */
export async function dakinisListWhatsappThreads(businessId, opts = {}) {
  const limit = Math.min(Math.max(Number(opts.limit) || 50, 1), 100);
  if (await dakinisWhatsappTablesReady()) {
    const rows = await dakinisQueryAll(
      `SELECT m.peer_phone AS peer_phone,
              MAX(m.created_at) AS last_at,
              (SELECT body_text FROM tenant_whatsapp_messages m2
               WHERE m2.business_id = m.business_id AND m2.peer_phone = m.peer_phone
               ORDER BY m2.created_at DESC LIMIT 1) AS last_body,
              (SELECT direction FROM tenant_whatsapp_messages m3
               WHERE m3.business_id = m.business_id AND m3.peer_phone = m.peer_phone
               ORDER BY m3.created_at DESC LIMIT 1) AS last_direction
       FROM tenant_whatsapp_messages m
       WHERE m.business_id = ?
       GROUP BY m.peer_phone
       ORDER BY last_at DESC
       LIMIT ?`,
      [businessId, limit]
    );
    return rows.map((r) => ({
      peerPhone: r.peer_phone,
      lastAt: r.last_at,
      lastBody: r.last_body,
      lastDirection: r.last_direction
    }));
  }

  const messages = await dakinisListWhatsappMessagesLegacy(businessId, { limit: 200 });
  const threads = new Map();
  for (const m of messages) {
    const peer = m.peer_phone || (m.direction === "outbound" ? m.to : m.from);
    if (!peer) continue;
    if (!threads.has(peer) || String(m.storedAt) > String(threads.get(peer).lastAt)) {
      threads.set(peer, {
        peerPhone: peer,
        lastAt: m.storedAt,
        lastBody: m.text || m.body_text,
        lastDirection: m.direction
      });
    }
  }
  return [...threads.values()].slice(0, limit);
}

/**
 * @param {string} businessId
 * @param {string} peerPhone
 * @param {{ limit?: number }} [opts]
 */
export async function dakinisListWhatsappThreadMessages(businessId, peerPhone, opts = {}) {
  const phone = String(peerPhone || "").replace(/\D/g, "");
  const limit = Math.min(Math.max(Number(opts.limit) || 100, 1), 300);

  if (await dakinisWhatsappTablesReady()) {
    const rows = await dakinisQueryAll(
      `SELECT id, direction, wamid, peer_phone, body_text, msg_type, created_at
       FROM tenant_whatsapp_messages
       WHERE business_id = ? AND peer_phone = ?
       ORDER BY created_at ASC
       LIMIT ?`,
      [businessId, phone, limit]
    );
    return rows.map((r) => ({
      id: r.id,
      direction: r.direction,
      wamid: r.wamid,
      peerPhone: r.peer_phone,
      body: r.body_text,
      type: r.msg_type,
      createdAt: r.created_at
    }));
  }

  const all = await dakinisListWhatsappMessagesLegacy(businessId, { limit: 500 });
  return all
    .filter((m) => {
      const peer = m.peer_phone || (m.direction === "outbound" ? m.to : m.from);
      return peer === phone;
    })
    .slice(-limit);
}

/** @deprecated fallback tenant_records */
async function dakinisListWhatsappMessagesLegacy(businessId, opts = {}) {
  const limit = Math.min(Math.max(Number(opts.limit) || 50, 1), 200);
  const rows = await dakinisQueryAll(
    `SELECT id, payload, created_at FROM tenant_records
     WHERE business_id = ? AND entity = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [businessId, DAKINIS_WHATSAPP_ENTITY, limit]
  );
  return rows.map((row) => {
    try {
      return { ...JSON.parse(row.payload), storedAt: row.created_at, recordId: row.id };
    } catch {
      return { recordId: row.id, storedAt: row.created_at, raw: row.payload };
    }
  });
}

/**
 * Lista plana (compat).
 * @param {string} businessId
 * @param {{ limit?: number }} [opts]
 */
export async function dakinisListWhatsappMessages(businessId, opts = {}) {
  const limit = Math.min(Math.max(Number(opts.limit) || 50, 1), 200);
  if (await dakinisWhatsappTablesReady()) {
    const rows = await dakinisQueryAll(
      `SELECT id, direction, wamid, peer_phone, body_text, msg_type, created_at
       FROM tenant_whatsapp_messages
       WHERE business_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [businessId, limit]
    );
    return rows.map((r) => ({
      id: r.id,
      direction: r.direction,
      wamid: r.wamid,
      peer_phone: r.peer_phone,
      body_text: r.body_text,
      type: r.msg_type,
      storedAt: r.created_at
    }));
  }
  return dakinisListWhatsappMessagesLegacy(businessId, opts);
}
