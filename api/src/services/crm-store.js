import { randomUUID } from "node:crypto";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun } from "../db/query.js";
import { dakinisSqlOrderCreatedAtDesc } from "../db/dialect.js";
import { dakinisNormalizeWhatsappPhone } from "./whatsapp-cloud.js";

export const DAKINIS_CRM_ACTIVITY_TYPES = Object.freeze([
  "call",
  "whatsapp",
  "email",
  "note",
  "meeting",
  "booking",
  "order"
]);

async function dakinisCrmTablesReady() {
  try {
    // Tabla vacía tras migración: COUNT(*) devuelve fila; LIMIT 1 sin filas fallaba el check.
    await dakinisQueryOne("SELECT COUNT(*) AS n FROM tenant_crm_contacts");
    return true;
  } catch {
    return false;
  }
}

function dakinisParseTags(raw) {
  if (Array.isArray(raw)) return raw.map((t) => String(t).trim()).filter(Boolean);
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((t) => String(t).trim()).filter(Boolean);
    } catch {
      return raw.split(",").map((t) => t.trim()).filter(Boolean);
    }
  }
  return [];
}

function dakinisRowContact(r) {
  let tags = [];
  try {
    tags = JSON.parse(r.tags_json || "[]");
  } catch {
    tags = [];
  }
  return {
    id: r.id,
    companyId: r.company_id || null,
    firstName: r.first_name,
    lastName: r.last_name,
    phone: r.phone,
    email: r.email,
    source: r.source,
    tags,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    displayName: [r.first_name, r.last_name].filter(Boolean).join(" ").trim() || r.phone || r.email
  };
}

function dakinisRowCompany(r) {
  return {
    id: r.id,
    name: r.name,
    vatNumber: r.vat_number,
    phone: r.phone,
    email: r.email,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

function dakinisRowActivity(r) {
  return {
    id: r.id,
    contactId: r.contact_id,
    type: r.type,
    notes: r.notes,
    createdBy: r.created_by,
    createdAt: r.created_at
  };
}

export async function dakinisCrmIsReady() {
  return dakinisCrmTablesReady();
}

export async function dakinisCrmListContacts(businessId, opts = {}) {
  if (!(await dakinisCrmTablesReady())) return [];
  const limit = Math.min(Math.max(Number(opts.limit) || 100, 1), 500);
  const q = String(opts.q || "").trim().toLowerCase();
  let rows = await dakinisQueryAll(
    `SELECT * FROM tenant_crm_contacts WHERE business_id = ?
     ORDER BY ${dakinisSqlOrderCreatedAtDesc("updated_at")} LIMIT ?`,
    [businessId, limit]
  );
  if (q) {
    rows = rows.filter((r) => {
      const hay = `${r.first_name} ${r.last_name} ${r.phone} ${r.email}`.toLowerCase();
      return hay.includes(q);
    });
  }
  return rows.map(dakinisRowContact);
}

export async function dakinisCrmGetContact(businessId, contactId) {
  if (!(await dakinisCrmTablesReady())) return null;
  const row = await dakinisQueryOne(
    "SELECT * FROM tenant_crm_contacts WHERE business_id = ? AND id = ?",
    [businessId, contactId]
  );
  return row ? dakinisRowContact(row) : null;
}

export async function dakinisCrmFindContactByPhone(businessId, phone) {
  const normalized = dakinisNormalizeWhatsappPhone(phone);
  if (!normalized || !(await dakinisCrmTablesReady())) return null;
  const row = await dakinisQueryOne(
    "SELECT * FROM tenant_crm_contacts WHERE business_id = ? AND phone = ?",
    [businessId, normalized]
  );
  return row ? dakinisRowContact(row) : null;
}

/**
 * @param {string} businessId
 * @param {Record<string, unknown>} input
 */
export async function dakinisCrmCreateContact(businessId, input) {
  if (!(await dakinisCrmTablesReady())) {
    throw Object.assign(new Error("CRM no inicializado (ejecuta migración SQL)"), { code: "CRM_NOT_READY" });
  }
  const phone = input.phone ? dakinisNormalizeWhatsappPhone(input.phone) || "" : "";
  const id = `ct_${randomUUID()}`;
  const now = new Date().toISOString();
  const tags = dakinisParseTags(input.tags);

  await dakinisRun(
    `INSERT INTO tenant_crm_contacts
      (id, business_id, company_id, first_name, last_name, phone, email, source, tags_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      businessId,
      input.companyId || null,
      String(input.firstName || "").trim(),
      String(input.lastName || "").trim(),
      phone,
      String(input.email || "").trim(),
      String(input.source || "manual").trim(),
      JSON.stringify(tags),
      now,
      now
    ]
  );
  return dakinisCrmGetContact(businessId, id);
}

/**
 * Busca por teléfono o crea contacto (WhatsApp / inbound).
 */
export async function dakinisCrmFindOrCreateContactByPhone(businessId, phone, extras = {}) {
  const normalized = dakinisNormalizeWhatsappPhone(phone);
  if (!normalized) return null;

  let contact = await dakinisCrmFindContactByPhone(businessId, normalized);
  if (contact) {
    if (extras.waProfileName || extras.firstName) {
      await dakinisCrmUpdateContact(businessId, contact.id, {
        firstName: contact.firstName || extras.firstName,
        lastName: contact.lastName || extras.lastName,
        source: contact.source || extras.source || "whatsapp"
      });
      contact = await dakinisCrmGetContact(businessId, contact.id);
    }
    return contact;
  }

  const nameParts = String(extras.waProfileName || extras.displayName || "").trim().split(/\s+/);
  return dakinisCrmCreateContact(businessId, {
    firstName: extras.firstName || nameParts[0] || "",
    lastName: extras.lastName || nameParts.slice(1).join(" ") || "",
    phone: normalized,
    source: extras.source || "whatsapp",
    companyId: extras.companyId
  });
}

export async function dakinisCrmUpdateContact(businessId, contactId, input) {
  const existing = await dakinisCrmGetContact(businessId, contactId);
  if (!existing) return null;

  const phone =
    input.phone !== undefined
      ? dakinisNormalizeWhatsappPhone(input.phone) || ""
      : existing.phone;
  const tags = input.tags !== undefined ? dakinisParseTags(input.tags) : existing.tags;
  const now = new Date().toISOString();

  await dakinisRun(
    `UPDATE tenant_crm_contacts SET
      company_id = ?,
      first_name = ?,
      last_name = ?,
      phone = ?,
      email = ?,
      source = ?,
      tags_json = ?,
      updated_at = ?
     WHERE business_id = ? AND id = ?`,
    [
      input.companyId !== undefined ? input.companyId : existing.companyId,
      input.firstName !== undefined ? String(input.firstName).trim() : existing.firstName,
      input.lastName !== undefined ? String(input.lastName).trim() : existing.lastName,
      phone,
      input.email !== undefined ? String(input.email).trim() : existing.email,
      input.source !== undefined ? String(input.source).trim() : existing.source,
      JSON.stringify(tags),
      now,
      businessId,
      contactId
    ]
  );
  return dakinisCrmGetContact(businessId, contactId);
}

export async function dakinisCrmListCompanies(businessId) {
  if (!(await dakinisCrmTablesReady())) return [];
  const rows = await dakinisQueryAll(
    `SELECT * FROM tenant_crm_companies WHERE business_id = ?
     ORDER BY name ASC`,
    [businessId]
  );
  return rows.map(dakinisRowCompany);
}

export async function dakinisCrmCreateCompany(businessId, input) {
  if (!(await dakinisCrmTablesReady())) {
    throw Object.assign(new Error("CRM no inicializado"), { code: "CRM_NOT_READY" });
  }
  const name = String(input.name || "").trim();
  if (!name) throw Object.assign(new Error("name requerido"), { code: "VALIDATION_ERROR" });

  const id = `co_${randomUUID()}`;
  const now = new Date().toISOString();
  await dakinisRun(
    `INSERT INTO tenant_crm_companies (id, business_id, name, vat_number, phone, email, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      businessId,
      name,
      String(input.vatNumber || "").trim(),
      String(input.phone || "").trim(),
      String(input.email || "").trim(),
      now,
      now
    ]
  );
  const row = await dakinisQueryOne("SELECT * FROM tenant_crm_companies WHERE id = ?", [id]);
  return dakinisRowCompany(row);
}

export async function dakinisCrmListActivities(businessId, contactId, limit = 100) {
  if (!(await dakinisCrmTablesReady())) return [];
  const rows = await dakinisQueryAll(
    `SELECT * FROM tenant_crm_activities
     WHERE business_id = ? AND contact_id = ?
     ORDER BY ${dakinisSqlOrderCreatedAtDesc("created_at")} LIMIT ?`,
    [businessId, contactId, limit]
  );
  return rows.map(dakinisRowActivity);
}

export async function dakinisCrmCreateActivity(businessId, contactId, input, createdBy = null) {
  if (!(await dakinisCrmTablesReady())) {
    throw Object.assign(new Error("CRM no inicializado"), { code: "CRM_NOT_READY" });
  }
  const type = String(input.type || "note").trim().toLowerCase();
  if (!DAKINIS_CRM_ACTIVITY_TYPES.includes(type)) {
    throw Object.assign(new Error(`type inválido: ${type}`), { code: "VALIDATION_ERROR" });
  }

  const contact = await dakinisCrmGetContact(businessId, contactId);
  if (!contact) return null;

  const id = `act_${randomUUID()}`;
  const now = new Date().toISOString();
  await dakinisRun(
    `INSERT INTO tenant_crm_activities (id, business_id, contact_id, type, notes, created_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      businessId,
      contactId,
      type,
      String(input.notes || "").trim(),
      createdBy,
      now
    ]
  );

  await dakinisRun("UPDATE tenant_crm_contacts SET updated_at = ? WHERE id = ?", [now, contactId]);

  const row = await dakinisQueryOne("SELECT * FROM tenant_crm_activities WHERE id = ?", [id]);
  return dakinisRowActivity(row);
}

export async function dakinisCrmGetOrCreateConversation(businessId, contactId, peerPhone) {
  const phone = dakinisNormalizeWhatsappPhone(peerPhone);
  if (!phone || !(await dakinisCrmTablesReady())) return null;

  const existing = await dakinisQueryOne(
    "SELECT * FROM tenant_whatsapp_conversations WHERE business_id = ? AND peer_phone = ?",
    [businessId, phone]
  );
  if (existing) return { id: existing.id, contactId: existing.contact_id, peerPhone: existing.peer_phone };

  const id = `wcv_${randomUUID()}`;
  const now = new Date().toISOString();
  await dakinisRun(
    `INSERT INTO tenant_whatsapp_conversations (id, business_id, contact_id, peer_phone, last_message_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, businessId, contactId, phone, now, now]
  );
  return { id, contactId, peerPhone: phone };
}

export async function dakinisCrmTouchConversation(conversationId, at) {
  const ts = at || new Date().toISOString();
  await dakinisRun("UPDATE tenant_whatsapp_conversations SET last_message_at = ? WHERE id = ?", [
    ts,
    conversationId
  ]);
}

export async function dakinisCrmGetContactTimeline(businessId, contactId) {
  const contact = await dakinisCrmGetContact(businessId, contactId);
  if (!contact) return null;

  const activities = await dakinisCrmListActivities(businessId, contactId, 200);

  let messages = [];
  try {
    const rows = await dakinisQueryAll(
      `SELECT id, direction, body_text, created_at, wamid
       FROM tenant_whatsapp_messages
       WHERE business_id = ? AND contact_id = ?
       ORDER BY created_at ASC LIMIT 200`,
      [businessId, contactId]
    );
    messages = rows.map((r) => ({
      id: r.id,
      kind: "whatsapp",
      direction: r.direction,
      body: r.body_text,
      createdAt: r.created_at,
      wamid: r.wamid
    }));
  } catch {
    messages = [];
  }

  const timeline = [
    ...activities.map((a) => ({
      id: a.id,
      kind: "activity",
      type: a.type,
      notes: a.notes,
      createdAt: a.createdAt
    })),
    ...messages
  ].sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));

  return { contact, activities, messages, timeline };
}

export const DAKINIS_CRM_DEAL_STAGES = Object.freeze([
  "lead",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost"
]);

function dakinisRowDeal(r) {
  return {
    id: r.id,
    contactId: r.contact_id || null,
    companyId: r.company_id || null,
    title: r.title,
    stage: r.stage,
    valueAmount: r.value_amount,
    currency: r.currency,
    expectedClose: r.expected_close,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

async function dakinisDealsTableReady() {
  try {
    await dakinisQueryOne("SELECT COUNT(*) AS n FROM tenant_crm_deals");
    return true;
  } catch {
    return false;
  }
}

export async function dakinisCrmListDeals(businessId, opts = {}) {
  if (!(await dakinisDealsTableReady())) return [];
  const stage = opts.stage ? String(opts.stage).trim() : "";
  let sql = `SELECT * FROM tenant_crm_deals WHERE business_id = ?`;
  const params = [businessId];
  if (stage) {
    sql += ` AND stage = ?`;
    params.push(stage);
  }
  sql += ` ORDER BY ${dakinisSqlOrderCreatedAtDesc("updated_at")}`;
  const rows = await dakinisQueryAll(sql, params);
  return rows.map(dakinisRowDeal);
}

export async function dakinisCrmCreateDeal(businessId, input) {
  if (!(await dakinisDealsTableReady())) {
    throw Object.assign(new Error("CRM deals no inicializado"), { code: "CRM_NOT_READY" });
  }
  const title = String(input.title || "").trim();
  if (!title) throw Object.assign(new Error("title requerido"), { code: "VALIDATION_ERROR" });
  const stage = String(input.stage || "lead").trim().toLowerCase();
  if (!DAKINIS_CRM_DEAL_STAGES.includes(stage)) {
    throw Object.assign(new Error(`stage inválido: ${stage}`), { code: "VALIDATION_ERROR" });
  }

  const id = `deal_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const now = new Date().toISOString();
  await dakinisRun(
    `INSERT INTO tenant_crm_deals (id, business_id, contact_id, company_id, title, stage, value_amount, currency, expected_close, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      businessId,
      input.contactId || null,
      input.companyId || null,
      title,
      stage,
      Number(input.valueAmount) || 0,
      String(input.currency || "EUR").trim(),
      input.expectedClose || null,
      String(input.notes || "").trim(),
      now,
      now
    ]
  );
  const row = await dakinisQueryOne("SELECT * FROM tenant_crm_deals WHERE id = ?", [id]);
  return dakinisRowDeal(row);
}

export async function dakinisCrmUpdateDeal(businessId, dealId, input) {
  if (!(await dakinisDealsTableReady())) return null;
  const existing = await dakinisQueryOne(
    "SELECT * FROM tenant_crm_deals WHERE business_id = ? AND id = ?",
    [businessId, dealId]
  );
  if (!existing) return null;

  const stage =
    input.stage !== undefined ? String(input.stage).trim().toLowerCase() : existing.stage;
  if (!DAKINIS_CRM_DEAL_STAGES.includes(stage)) return null;

  const now = new Date().toISOString();
  await dakinisRun(
    `UPDATE tenant_crm_deals SET
      contact_id = ?, company_id = ?, title = ?, stage = ?, value_amount = ?,
      currency = ?, expected_close = ?, notes = ?, updated_at = ?
     WHERE business_id = ? AND id = ?`,
    [
      input.contactId !== undefined ? input.contactId : existing.contact_id,
      input.companyId !== undefined ? input.companyId : existing.company_id,
      input.title !== undefined ? String(input.title).trim() : existing.title,
      stage,
      input.valueAmount !== undefined ? Number(input.valueAmount) : existing.value_amount,
      input.currency !== undefined ? String(input.currency).trim() : existing.currency,
      input.expectedClose !== undefined ? input.expectedClose : existing.expected_close,
      input.notes !== undefined ? String(input.notes).trim() : existing.notes,
      now,
      businessId,
      dealId
    ]
  );
  const row = await dakinisQueryOne("SELECT * FROM tenant_crm_deals WHERE id = ?", [dealId]);
  return dakinisRowDeal(row);
}
