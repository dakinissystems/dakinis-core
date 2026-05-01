import { dakinisCreatePlatformModules } from "../index.js";
import {
  DAKINIS_ALLOWED_ADAPTERS,
  DAKINIS_BUSINESS_TYPE_HEADER,
  DAKINIS_ENTITY_BY_BUSINESS_TYPE
} from "./contracts.js";
import { dakinisResolveAdapter } from "./adapter-resolver.js";
import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import { dakinisGetDb } from "../db/index.js";
import { dakinisHandleAuthLogin, dakinisHandleMe } from "./auth-routes.js";

function dakinisParseJsonSafely(rawBody) {
  if (!rawBody || !String(rawBody).trim()) return {};
  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
}

function dakinisBuildModulesForBusiness(business) {
  const adapterKey = String(business.type || "").toLowerCase();
  const base = dakinisResolveAdapter(adapterKey);
  let extra = {};
  if (business.config_json) {
    try {
      extra = JSON.parse(business.config_json);
    } catch {
      extra = {};
    }
  }
  return dakinisCreatePlatformModules({
    ...base,
    ...extra,
    dashboard: { currency: "EUR", ...(extra.dashboard || {}) }
  });
}

function dakinisAssertOptionalBusinessTypeHeader(req, business) {
  const headerType = req.headers[DAKINIS_BUSINESS_TYPE_HEADER];
  if (headerType === undefined || headerType === null || String(headerType).trim() === "") {
    return null;
  }
  const normalized = String(headerType).trim().toLowerCase();
  if (normalized !== String(business.type).toLowerCase()) {
    return dakinisJsonError(400, "TYPE_MISMATCH", "x-business-type no coincide con el negocio en x-business-id", {
      businessType: business.type,
      headerType: normalized
    });
  }
  return null;
}

export function dakinisHandleAuthLoginRequest(rawBody) {
  return dakinisHandleAuthLogin(rawBody);
}

export function dakinisHandleMeRequest(req) {
  return dakinisHandleMe(req);
}

export async function dakinisHandleApiRequest(req, rawBody, url) {
  if (req.method === "GET" && url.pathname === "/api/health") {
    return dakinisJsonSuccess({ status: "up" }, "custom");
  }

  const business = req.dakinisBusiness;
  if (!business) {
    return dakinisJsonError(500, "INTERNAL_ERROR", "Contexto de negocio no resuelto");
  }

  const typeErr = dakinisAssertOptionalBusinessTypeHeader(req, business);
  if (typeErr) return typeErr;

  const adapterKey = String(business.type || "").toLowerCase();
  if (!DAKINIS_ALLOWED_ADAPTERS.includes(adapterKey) || adapterKey === "custom") {
    return dakinisJsonError(400, "INVALID_BUSINESS_TYPE", "Tipo de negocio no soportado", {
      type: business.type,
      allowed: DAKINIS_ALLOWED_ADAPTERS.filter((a) => a !== "custom")
    });
  }

  const modules = dakinisBuildModulesForBusiness(business);
  const metaBase = { businessId: business.id, businessSlug: business.slug };

  const payload = dakinisParseJsonSafely(rawBody);
  if (payload === null) {
    return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  }

  if (req.method === "GET" && url.pathname === "/api/tenant/mock-records") {
    const entity = url.searchParams.get("entity");
    const expectedEntity = DAKINIS_ENTITY_BY_BUSINESS_TYPE[business.type];
    if (!entity) {
      return dakinisJsonError(400, "VALIDATION_ERROR", "Query entity requerido", { expected: expectedEntity });
    }
    if (entity !== expectedEntity) {
      return dakinisJsonError(400, "INVALID_ENTITY", "Entidad no valida para este negocio", {
        entity,
        expected: expectedEntity
      });
    }
    const db = dakinisGetDb();
    const rows = db
      .prepare(
        `SELECT id, payload, created_at FROM tenant_records
         WHERE business_id = ? AND entity = ?
         ORDER BY datetime(created_at) DESC`
      )
      .all(business.id, entity);
    const records = rows.map((r) => {
      const parsed = JSON.parse(r.payload);
      return { ...parsed, id: parsed.id || r.id };
    });
    return dakinisJsonSuccess({ records }, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/tenant/mock-records") {
    const entity = DAKINIS_ENTITY_BY_BUSINESS_TYPE[business.type];
    const record = payload.record ?? payload;
    if (!record || typeof record !== "object") {
      return dakinisJsonError(400, "VALIDATION_ERROR", "Cuerpo debe incluir el objeto a guardar (record o raiz)");
    }
    const id =
      typeof record.id === "string" && record.id.trim() ? record.id.trim() : `row_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const row = { ...record, id };
    const db = dakinisGetDb();
    db.prepare("INSERT INTO tenant_records (id, business_id, entity, payload) VALUES (?, ?, ?, ?)").run(
      id,
      business.id,
      entity,
      JSON.stringify(row)
    );
    return dakinisJsonSuccess({ record: row }, adapterKey, metaBase);
  }

  if (req.method === "GET" && url.pathname === "/api/config") {
    return dakinisJsonSuccess({ config: modules.config }, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/agenda/slots") {
    const slots = modules.agenda.dakinisBuildDayCalendarSlots(payload.dayStart, payload.dayEnd);
    return dakinisJsonSuccess({ slots }, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/agenda/can-schedule") {
    const canSchedule = modules.agenda.dakinisCanScheduleSlot(
      payload.existingBookings || [],
      payload.candidateStart,
      payload.serviceMinutes
    );
    return dakinisJsonSuccess({ canSchedule }, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/booking/validate") {
    const result = modules.booking.dakinisValidateBookingRequest(payload);
    return dakinisJsonSuccess(result, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/booking/link") {
    const link = modules.booking.dakinisBuildPublicBookingLink(payload.businessSlug || business.slug || "demo");
    return dakinisJsonSuccess({ link }, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/crm/segment") {
    const segment = modules.crm.dakinisGetClientSegment(payload.client || {});
    return dakinisJsonSuccess({ segment }, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/crm/timeline") {
    const timeline = modules.crm.dakinisBuildClientTimeline(payload.client || {});
    return dakinisJsonSuccess({ timeline }, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/whatsapp/confirmation") {
    const message = modules.whatsapp.dakinisBuildConfirmationMessage(payload);
    return dakinisJsonSuccess({ message }, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/whatsapp/reminder") {
    const message = modules.whatsapp.dakinisBuildReminderMessage(payload);
    return dakinisJsonSuccess({ message }, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/whatsapp/reactivation") {
    const message = modules.whatsapp.dakinisBuildReactivationMessage(payload);
    return dakinisJsonSuccess({ message }, adapterKey, metaBase);
  }

  if (req.method === "GET" && url.pathname === "/api/whatsapp/rules") {
    const rules = modules.whatsapp.dakinisGetEnabledAutomationRules();
    return dakinisJsonSuccess({ rules }, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/leads/move-stage") {
    const lead = modules.leads.dakinisMoveLeadToStage(payload.lead || {}, payload.nextStage);
    return dakinisJsonSuccess({ lead }, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/leads/pipeline-summary") {
    const summary = modules.leads.dakinisBuildPipelineSummary(payload.leads || []);
    return dakinisJsonSuccess({ summary }, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/dashboard/metrics") {
    const metrics = modules.dashboard.dakinisBuildDashboardMetrics(payload);
    return dakinisJsonSuccess({ metrics }, adapterKey, metaBase);
  }

  return dakinisJsonError(404, "NOT_FOUND", "Endpoint no encontrado");
}
