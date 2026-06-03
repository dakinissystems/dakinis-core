import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import {
  dakinisCrmIsReady,
  dakinisCrmListContacts,
  dakinisCrmGetContact,
  dakinisCrmCreateContact,
  dakinisCrmUpdateContact,
  dakinisCrmListCompanies,
  dakinisCrmCreateCompany,
  dakinisCrmListActivities,
  dakinisCrmCreateActivity,
  dakinisCrmGetContactTimeline,
  DAKINIS_CRM_ACTIVITY_TYPES
} from "../services/crm-store.js";

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

function dakinisCrmNotReady() {
  return dakinisJsonError(
    503,
    "CRM_NOT_READY",
    "Ejecuta la migración CRM (04-crm-core.sql en Supabase o reinicia SQLite local)",
    { schema: "04-crm-core.sql" }
  );
}

export async function dakinisHandleCrmContactsList(req, url) {
  if (!(await dakinisCrmIsReady())) return dakinisCrmNotReady();
  const q = url.searchParams.get("q") || "";
  const limit = Number(url.searchParams.get("limit") || 100);
  const contacts = await dakinisCrmListContacts(req.dakinisBusiness.id, { q, limit });
  return dakinisJsonSuccess({ contacts }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleCrmContactsPost(req, rawBody) {
  if (!(await dakinisCrmIsReady())) return dakinisCrmNotReady();
  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON inválido");

  try {
    const contact = await dakinisCrmCreateContact(req.dakinisBusiness.id, {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      email: body.email,
      source: body.source,
      companyId: body.companyId,
      tags: body.tags
    });
    return dakinisJsonSuccess({ contact }, req.dakinisBusiness.type, dakinisMeta(req));
  } catch (err) {
    const code = err?.code || "CRM_ERROR";
    return dakinisJsonError(400, code, err instanceof Error ? err.message : "Error CRM");
  }
}

export async function dakinisHandleCrmContactGet(req, contactId) {
  if (!(await dakinisCrmIsReady())) return dakinisCrmNotReady();
  const contact = await dakinisCrmGetContact(req.dakinisBusiness.id, contactId);
  if (!contact) return dakinisJsonError(404, "NOT_FOUND", "Contacto no encontrado");
  return dakinisJsonSuccess({ contact }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleCrmContactPatch(req, contactId, rawBody) {
  if (!(await dakinisCrmIsReady())) return dakinisCrmNotReady();
  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON inválido");

  const contact = await dakinisCrmUpdateContact(req.dakinisBusiness.id, contactId, body);
  if (!contact) return dakinisJsonError(404, "NOT_FOUND", "Contacto no encontrado");
  return dakinisJsonSuccess({ contact }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleCrmContactTimeline(req, contactId) {
  if (!(await dakinisCrmIsReady())) return dakinisCrmNotReady();
  const data = await dakinisCrmGetContactTimeline(req.dakinisBusiness.id, contactId);
  if (!data) return dakinisJsonError(404, "NOT_FOUND", "Contacto no encontrado");
  return dakinisJsonSuccess(data, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleCrmActivitiesList(req, contactId) {
  if (!(await dakinisCrmIsReady())) return dakinisCrmNotReady();
  const contact = await dakinisCrmGetContact(req.dakinisBusiness.id, contactId);
  if (!contact) return dakinisJsonError(404, "NOT_FOUND", "Contacto no encontrado");
  const activities = await dakinisCrmListActivities(req.dakinisBusiness.id, contactId);
  return dakinisJsonSuccess({ activities }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleCrmActivitiesPost(req, contactId, rawBody) {
  if (!(await dakinisCrmIsReady())) return dakinisCrmNotReady();
  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON inválido");

  const createdBy = req.user?.email || req.user?.id || null;
  try {
    const activity = await dakinisCrmCreateActivity(
      req.dakinisBusiness.id,
      contactId,
      body,
      createdBy
    );
    if (!activity) return dakinisJsonError(404, "NOT_FOUND", "Contacto no encontrado");
    return dakinisJsonSuccess({ activity }, req.dakinisBusiness.type, dakinisMeta(req));
  } catch (err) {
    return dakinisJsonError(400, err?.code || "CRM_ERROR", err instanceof Error ? err.message : "Error");
  }
}

export async function dakinisHandleCrmCompaniesList(req) {
  if (!(await dakinisCrmIsReady())) return dakinisCrmNotReady();
  const companies = await dakinisCrmListCompanies(req.dakinisBusiness.id);
  return dakinisJsonSuccess({ companies }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleCrmCompaniesPost(req, rawBody) {
  if (!(await dakinisCrmIsReady())) return dakinisCrmNotReady();
  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON inválido");
  try {
    const company = await dakinisCrmCreateCompany(req.dakinisBusiness.id, body);
    return dakinisJsonSuccess({ company }, req.dakinisBusiness.type, dakinisMeta(req));
  } catch (err) {
    return dakinisJsonError(400, err?.code || "CRM_ERROR", err instanceof Error ? err.message : "Error");
  }
}

export async function dakinisHandleCrmMeta(req) {
  return dakinisJsonSuccess(
    { activityTypes: [...DAKINIS_CRM_ACTIVITY_TYPES], crmReady: await dakinisCrmIsReady() },
    req.dakinisBusiness.type,
    dakinisMeta(req)
  );
}
