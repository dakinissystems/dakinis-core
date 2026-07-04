import { dakinisCreatePlatformModules } from "@dakinis/shared";
import {
  DAKINIS_ALLOWED_ADAPTERS,
  DAKINIS_BUSINESS_TYPE_HEADER,
  DAKINIS_ENTITY_BY_BUSINESS_TYPE
} from "./contracts.js";
import { dakinisResolveAdapter } from "./adapter-resolver.js";
import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun } from "../db/query.js";
import { dakinisSqlOrderCreatedAtDesc } from "../db/dialect.js";
import { dakinisGetDbDriver } from "../db/index.js";
import { dakinisIsSentryEnabled } from "../lib/sentry.js";
import { dakinisWhatsappMetaConfig } from "../lib/whatsapp-meta.js";
import {
  dakinisListModulesForPlan,
  dakinisNormalizeCommercialPlan
} from "@dakinis/shared/catalog/plan-modules.js";
import { dakinisHandleAuthLogin, dakinisHandleAuthExchange, dakinisHandleMe } from "./auth-routes.js";
import { dakinisPublishEvent } from "../lib/event-bus.js";
import { dakinisPostgresSchema } from "../db/schema-config.js";
import { dakinisIsSupabasePoolerUrl } from "../db/postgres-connection.js";
import { dakinisValidateDatabaseUrl, dakinisMaskDatabaseUrl } from "../db/validate-database-url.js";
import { dakinisPlanModuleDenialOrNull } from "./plan-access.js";

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
    return dakinisJsonError(
      400,
      "TYPE_MISMATCH",
      "x-business-type no coincide con el negocio en x-business-id",
      {
        businessType: business.type,
        headerType: normalized
      }
    );
  }
  return null;
}

export async function dakinisHandleAuthLoginRequest(rawBody) {
  return dakinisHandleAuthLogin(rawBody);
}

export async function dakinisHandleAuthExchangeRequest(req, rawBody) {
  return dakinisHandleAuthExchange(req, rawBody);
}

export async function dakinisHandleMeRequest(req) {
  return dakinisHandleMe(req);
}

export async function dakinisHandleApiRequest(req, rawBody, url) {
  if (req.method === "GET" && url.pathname === "/api/health") {
    const dbUrlCheck = dakinisValidateDatabaseUrl(process.env.DATABASE_URL || "");
    return dakinisJsonSuccess(
      {
        status: "up",
        service: "dakinis-core-api",
        db: dakinisGetDbDriver(),
        postgresSchema: dakinisGetDbDriver() === "postgres" ? dakinisPostgresSchema() : undefined,
        databaseProvider: dbUrlCheck.meta.provider,
        databasePooler:
          dakinisGetDbDriver() === "postgres"
            ? dakinisIsSupabasePoolerUrl(process.env.DATABASE_URL || "")
            : false,
        databaseUrlValid: dbUrlCheck.ok,
        databaseUrlWarnings: dbUrlCheck.warnings.length ? dbUrlCheck.warnings : undefined,
        databaseHost: dbUrlCheck.meta.host || undefined,
        databasePort: dbUrlCheck.meta.port || undefined,
        databaseUriMasked:
          dakinisGetDbDriver() === "postgres"
            ? dakinisMaskDatabaseUrl(process.env.DATABASE_URL || "")
            : undefined,
        sentry: dakinisIsSentryEnabled(),
        whatsapp: dakinisWhatsappMetaConfig(),
        uptimeSec: Math.floor(process.uptime())
      },
      "custom"
    );
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
      allowed: DAKINIS_ALLOWED_ADAPTERS.filter((a) => a !== "custom" && a !== "platform")
    });
  }

  if (adapterKey === "platform") {
    return dakinisJsonError(
      403,
      "PLATFORM_ACCOUNT",
      "La cuenta de plataforma no usa la API de verticales. Usa GET /api/platform/businesses y /api/platform/users con JWT de administrador."
    );
  }

  const planDenied = dakinisPlanModuleDenialOrNull(business, url.pathname);
  if (planDenied) return planDenied;

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
      return dakinisJsonError(400, "VALIDATION_ERROR", "Query entity requerido", {
        expected: expectedEntity
      });
    }
    if (entity !== expectedEntity) {
      return dakinisJsonError(400, "INVALID_ENTITY", "Entidad no valida para este negocio", {
        entity,
        expected: expectedEntity
      });
    }
    const orderCreated = dakinisSqlOrderCreatedAtDesc("created_at");
    const rows = await dakinisQueryAll(
      `SELECT id, payload, created_at FROM tenant_records
         WHERE business_id = ? AND entity = ?
         ORDER BY ${orderCreated}`,
      [business.id, entity]
    );
    const records = rows.flatMap((r) => {
      try {
        const parsed = JSON.parse(r.payload);
        return [{ ...parsed, id: parsed.id || r.id }];
      } catch {
        return [];
      }
    });
    return dakinisJsonSuccess({ records }, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/tenant/mock-records") {
    const entity = DAKINIS_ENTITY_BY_BUSINESS_TYPE[business.type];
    const record = payload.record ?? payload;
    if (!record || typeof record !== "object") {
      return dakinisJsonError(
        400,
        "VALIDATION_ERROR",
        "Cuerpo debe incluir el objeto a guardar (record o raiz)"
      );
    }
    const id =
      typeof record.id === "string" && record.id.trim()
        ? record.id.trim()
        : `row_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const row = { ...record, id };
    await dakinisRun("INSERT INTO tenant_records (id, business_id, entity, payload) VALUES (?, ?, ?, ?)", [
      id,
      business.id,
      entity,
      JSON.stringify(row)
    ]);

    if (entity === "reserva" || entity === "comanda" || entity === "paciente") {
      await dakinisPublishEvent("booking.created", {
        tenantId: business.id,
        recordId: id,
        entity
      });
    }
    if (entity === "lead") {
      await dakinisPublishEvent("crm.lead.created", {
        tenantId: business.id,
        recordId: id,
        entity
      });
    }

    return dakinisJsonSuccess({ record: row }, adapterKey, metaBase);
  }

  if (req.method === "GET" && url.pathname === "/api/config") {
    const planTier = dakinisNormalizeCommercialPlan(business.plan);
    const modulesEnabled = dakinisListModulesForPlan(planTier);
    return dakinisJsonSuccess(
      {
        config: modules.config,
        plan: business.plan,
        planTier,
        modulesEnabled
      },
      adapterKey,
      metaBase
    );
  }

  if (req.method === "POST" && url.pathname === "/api/agenda/slots") {
    const slots = modules.agenda.dakinisGenerateDaySlots(payload.dayStart, payload.dayEnd);
    return dakinisJsonSuccess({ slots }, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/agenda/can-schedule") {
    const canSchedule = modules.agenda.dakinisIsSlotAvailable(
      payload.existingBookings || [],
      payload.candidateStart,
      payload.serviceMinutes
    );
    return dakinisJsonSuccess({ canSchedule }, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/booking/validate") {
    const result = modules.booking.dakinisCheckBookingFields(payload);
    return dakinisJsonSuccess(result, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/booking/link") {
    const link = modules.booking.dakinisGetBookingPageUrl(
      payload.businessSlug || business.slug || "demo"
    );
    return dakinisJsonSuccess({ link }, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/crm/segment") {
    const segment = modules.crm.dakinisGetCustomerSegment(payload.client || {});
    return dakinisJsonSuccess({ segment }, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/crm/timeline") {
    const timeline = modules.crm.dakinisGetCustomerSnapshot(payload.client || {});
    return dakinisJsonSuccess({ timeline }, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/whatsapp/confirmation") {
    const message = modules.whatsapp.dakinisFormatBookingConfirmedMessage(payload);
    await dakinisPublishEvent("message.sent", {
      tenantId: business.id,
      channel: "whatsapp",
      kind: "confirmation"
    });
    return dakinisJsonSuccess({ message }, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/whatsapp/reminder") {
    const message = modules.whatsapp.dakinisFormatAppointmentReminderMessage(payload);
    return dakinisJsonSuccess({ message }, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/whatsapp/reactivation") {
    const message = modules.whatsapp.dakinisFormatWinBackMessage(payload);
    return dakinisJsonSuccess({ message }, adapterKey, metaBase);
  }

  if (req.method === "GET" && url.pathname === "/api/whatsapp/rules") {
    const rules = modules.whatsapp.dakinisListAutomationRules();
    return dakinisJsonSuccess({ rules }, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/leads/move-stage") {
    const lead = modules.leads.dakinisUpdateLeadStage(payload.lead || {}, payload.nextStage);
    return dakinisJsonSuccess({ lead }, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/leads/pipeline-summary") {
    const summary = modules.leads.dakinisSummarizePipelineByStage(payload.leads || []);
    return dakinisJsonSuccess({ summary }, adapterKey, metaBase);
  }

  if (req.method === "POST" && url.pathname === "/api/dashboard/metrics") {
    const metrics = modules.dashboard.dakinisSummarizeDashboardKpis(payload);
    return dakinisJsonSuccess({ metrics }, adapterKey, metaBase);
  }

  return dakinisJsonError(404, "NOT_FOUND", "Endpoint no encontrado");
}
