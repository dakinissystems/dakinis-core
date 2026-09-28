import { randomUUID } from "node:crypto";
import { dakinisSqlOrderCreatedAtDesc } from "../db/dialect.js";
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

function dakinisMeta(req) {
  const b = req.dakinisBusiness;
  return { businessId: b.id, businessSlug: b.slug };
}

function dakinisCrmForbiddenPlatform(business) {
  if (String(business.type).toLowerCase() === "platform") {
    return dakinisJsonError(403, "FORBIDDEN", "No aplica a cuentas de plataforma");
  }
  return null;
}

function dakinisIsMissingRelation(err) {
  const msg = String(err?.message || err || "").toLowerCase();
  return (
    msg.includes("no such table") ||
    msg.includes("does not exist") ||
    msg.includes("undefined_table") ||
    err?.code === "42P01"
  );
}

function dakinisRowContact(r) {
  return {
    id: r.id,
    firstName: r.first_name || "",
    lastName: r.last_name || "",
    phone: r.phone || "",
    email: r.email || "",
    source: r.source || "",
    companyId: r.company_id || null,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

function dakinisRowActivity(r) {
  return {
    id: r.id,
    contactId: r.contact_id,
    type: r.type,
    notes: r.notes || "",
    createdBy: r.created_by || null,
    createdAt: r.created_at
  };
}

function dakinisRowCompany(r) {
  return {
    id: r.id,
    name: r.name,
    vatNumber: r.vat_number || "",
    phone: r.phone || "",
    email: r.email || "",
    createdAt: r.created_at
  };
}

export function dakinisIsCrmApiPath(pathname, method) {
  const m = String(method || "GET").toUpperCase();
  if (pathname === "/api/v1/crm/meta" && m === "GET") return true;
  if (pathname === "/api/v1/crm/contacts" && (m === "GET" || m === "POST")) return true;
  if (pathname === "/api/v1/crm/companies" && (m === "GET" || m === "POST")) return true;
  if (/^\/api\/v1\/crm\/contacts\/[^/]+$/.test(pathname) && m === "GET") return true;
  if (/^\/api\/v1\/crm\/contacts\/[^/]+\/timeline$/.test(pathname) && m === "GET") return true;
  if (/^\/api\/v1\/crm\/contacts\/[^/]+\/activities$/.test(pathname) && m === "POST") return true;
  return false;
}

export async function dakinisHandleCrmApi(req, rawBody, url) {
  const path = url.pathname;
  const method = String(req.method || "GET").toUpperCase();
  const business = req.dakinisBusiness;

  const plat = dakinisCrmForbiddenPlatform(business);
  if (plat) return plat;

  const planDeny = dakinisPlanModuleDenialOrNull(business, "/api/crm/");
  if (planDeny) return planDeny;

  if (path === "/api/v1/crm/meta" && method === "GET") {
    try {
      await dakinisQueryOne(`SELECT 1 AS ok FROM tenant_crm_contacts LIMIT 1`);
      return dakinisJsonSuccess({ crmReady: true }, business.type, dakinisMeta(req));
    } catch (e) {
      if (dakinisIsMissingRelation(e)) {
        return dakinisJsonSuccess({ crmReady: false }, business.type, dakinisMeta(req));
      }
      throw e;
    }
  }

  if (path === "/api/v1/crm/contacts" && method === "GET") {
    try {
      const q = String(url.searchParams.get("q") || "").trim().toLowerCase();
      const limit = Math.min(500, Math.max(1, Number(url.searchParams.get("limit") || 100) || 100));
      let rows;
      if (q) {
        const like = `%${q}%`;
        rows = await dakinisQueryAll(
          `SELECT * FROM tenant_crm_contacts
           WHERE business_id = ?
             AND (
               lower(first_name) LIKE ? OR lower(last_name) LIKE ?
               OR lower(phone) LIKE ? OR lower(email) LIKE ?
             )
           ORDER BY ${dakinisSqlOrderCreatedAtDesc("updated_at")}
           LIMIT ?`,
          [business.id, like, like, like, like, limit]
        );
      } else {
        rows = await dakinisQueryAll(
          `SELECT * FROM tenant_crm_contacts
           WHERE business_id = ?
           ORDER BY ${dakinisSqlOrderCreatedAtDesc("updated_at")}
           LIMIT ?`,
          [business.id, limit]
        );
      }
      return dakinisJsonSuccess(
        { contacts: rows.map(dakinisRowContact), crmReady: true },
        business.type,
        dakinisMeta(req)
      );
    } catch (e) {
      if (dakinisIsMissingRelation(e)) {
        return dakinisJsonSuccess({ contacts: [], crmReady: false }, business.type, dakinisMeta(req));
      }
      throw e;
    }
  }

  if (path === "/api/v1/crm/contacts" && method === "POST") {
    const jwtErr = dakinisRequireTenantJwt(req);
    if (jwtErr) return jwtErr;
    const body = dakinisParseJson(rawBody);
    if (!body || typeof body !== "object") {
      return dakinisJsonError(400, "INVALID_JSON", "JSON inválido");
    }
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim();
    const source = String(body.source || "manual").trim() || "manual";
    if (!phone && !email) {
      return dakinisJsonError(400, "VALIDATION", "Indica teléfono o email");
    }
    const id = `crmc_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
    try {
      await dakinisRun(
        `INSERT INTO tenant_crm_contacts
          (id, business_id, first_name, last_name, phone, email, source)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, business.id, firstName, lastName, phone, email, source]
      );
      const row = await dakinisQueryOne(`SELECT * FROM tenant_crm_contacts WHERE id = ?`, [id]);
      return dakinisJsonSuccess({ contact: dakinisRowContact(row) }, business.type, dakinisMeta(req));
    } catch (e) {
      if (dakinisIsMissingRelation(e)) {
        return dakinisJsonError(
          503,
          "CRM_NOT_PROVISIONED",
          "Tablas CRM no provisionadas en esta base. Aplica el esquema CRM y reintenta."
        );
      }
      throw e;
    }
  }

  const contactGet = path.match(/^\/api\/v1\/crm\/contacts\/([^/]+)$/);
  if (contactGet && method === "GET") {
    try {
      const row = await dakinisQueryOne(
        `SELECT * FROM tenant_crm_contacts WHERE id = ? AND business_id = ?`,
        [decodeURIComponent(contactGet[1]), business.id]
      );
      if (!row) return dakinisJsonError(404, "NOT_FOUND", "Contacto no encontrado");
      return dakinisJsonSuccess({ contact: dakinisRowContact(row) }, business.type, dakinisMeta(req));
    } catch (e) {
      if (dakinisIsMissingRelation(e)) {
        return dakinisJsonError(503, "CRM_NOT_PROVISIONED", "Tablas CRM no provisionadas");
      }
      throw e;
    }
  }

  const timelineGet = path.match(/^\/api\/v1\/crm\/contacts\/([^/]+)\/timeline$/);
  if (timelineGet && method === "GET") {
    const contactId = decodeURIComponent(timelineGet[1]);
    try {
      const contact = await dakinisQueryOne(
        `SELECT * FROM tenant_crm_contacts WHERE id = ? AND business_id = ?`,
        [contactId, business.id]
      );
      if (!contact) return dakinisJsonError(404, "NOT_FOUND", "Contacto no encontrado");
      const activities = await dakinisQueryAll(
        `SELECT * FROM tenant_crm_activities
         WHERE business_id = ? AND contact_id = ?
         ORDER BY ${dakinisSqlOrderCreatedAtDesc("created_at")}
         LIMIT 100`,
        [business.id, contactId]
      );
      return dakinisJsonSuccess(
        {
          contact: dakinisRowContact(contact),
          activities: activities.map(dakinisRowActivity)
        },
        business.type,
        dakinisMeta(req)
      );
    } catch (e) {
      if (dakinisIsMissingRelation(e)) {
        return dakinisJsonSuccess(
          { contact: null, activities: [], crmReady: false },
          business.type,
          dakinisMeta(req)
        );
      }
      throw e;
    }
  }

  const activityPost = path.match(/^\/api\/v1\/crm\/contacts\/([^/]+)\/activities$/);
  if (activityPost && method === "POST") {
    const jwtErr = dakinisRequireTenantJwt(req);
    if (jwtErr) return jwtErr;
    const contactId = decodeURIComponent(activityPost[1]);
    const body = dakinisParseJson(rawBody);
    if (!body || typeof body !== "object") {
      return dakinisJsonError(400, "INVALID_JSON", "JSON inválido");
    }
    const type = String(body.type || "note").trim() || "note";
    const notes = String(body.notes || "").trim();
    if (!notes) return dakinisJsonError(400, "VALIDATION", "Indica notas");
    try {
      const contact = await dakinisQueryOne(
        `SELECT id FROM tenant_crm_contacts WHERE id = ? AND business_id = ?`,
        [contactId, business.id]
      );
      if (!contact) return dakinisJsonError(404, "NOT_FOUND", "Contacto no encontrado");
      const id = `crma_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
      const createdBy = req.dakinisAuth?.userId || req.dakinisAuth?.sub || null;
      await dakinisRun(
        `INSERT INTO tenant_crm_activities (id, business_id, contact_id, type, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, business.id, contactId, type, notes, createdBy]
      );
      const row = await dakinisQueryOne(`SELECT * FROM tenant_crm_activities WHERE id = ?`, [id]);
      return dakinisJsonSuccess({ activity: dakinisRowActivity(row) }, business.type, dakinisMeta(req));
    } catch (e) {
      if (dakinisIsMissingRelation(e)) {
        return dakinisJsonError(503, "CRM_NOT_PROVISIONED", "Tablas CRM no provisionadas");
      }
      throw e;
    }
  }

  if (path === "/api/v1/crm/companies" && method === "GET") {
    try {
      const rows = await dakinisQueryAll(
        `SELECT * FROM tenant_crm_companies WHERE business_id = ?
         ORDER BY ${dakinisSqlOrderCreatedAtDesc("created_at")} LIMIT 200`,
        [business.id]
      );
      return dakinisJsonSuccess({ companies: rows.map(dakinisRowCompany) }, business.type, dakinisMeta(req));
    } catch (e) {
      if (dakinisIsMissingRelation(e)) {
        return dakinisJsonSuccess({ companies: [], crmReady: false }, business.type, dakinisMeta(req));
      }
      throw e;
    }
  }

  if (path === "/api/v1/crm/companies" && method === "POST") {
    const jwtErr = dakinisRequireTenantJwt(req);
    if (jwtErr) return jwtErr;
    const body = dakinisParseJson(rawBody);
    if (!body || typeof body !== "object") {
      return dakinisJsonError(400, "INVALID_JSON", "JSON inválido");
    }
    const name = String(body.name || "").trim();
    if (!name) return dakinisJsonError(400, "VALIDATION", "Indica el nombre");
    const id = `crmco_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
    try {
      await dakinisRun(
        `INSERT INTO tenant_crm_companies (id, business_id, name, vat_number, phone, email)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          business.id,
          name,
          String(body.vatNumber || "").trim(),
          String(body.phone || "").trim(),
          String(body.email || "").trim()
        ]
      );
      const row = await dakinisQueryOne(`SELECT * FROM tenant_crm_companies WHERE id = ?`, [id]);
      return dakinisJsonSuccess({ company: dakinisRowCompany(row) }, business.type, dakinisMeta(req));
    } catch (e) {
      if (dakinisIsMissingRelation(e)) {
        return dakinisJsonError(503, "CRM_NOT_PROVISIONED", "Tablas CRM no provisionadas");
      }
      throw e;
    }
  }

  return null;
}
