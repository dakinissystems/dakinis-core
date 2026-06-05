import { randomUUID } from "node:crypto";
import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import {
  dakinisGetIndustryTemplate,
  dakinisGetIndustryTemplateCatalog
} from "@dakinis/shared/catalog/business-templates.js";
import { dakinisParseBusinessConfig } from "@dakinis/shared/catalog/business-settings.js";
import {
  dakinisGetMarketplaceCatalog,
  dakinisResolveTenantModules
} from "@dakinis/shared/catalog/tenant-modules.js";
import { dakinisComputeTenantHealthScore } from "@dakinis/shared/catalog/tenant-health-score.js";
import { dakinisGetTenantRoleCatalog } from "@dakinis/shared/catalog/tenant-roles.js";
import { dakinisRoleCanManageUsers } from "@dakinis/shared/catalog/tenant-roles.js";
import { dakinisPlanModuleDenialOrNull } from "./plan-access.js";
import {
  dakinisGatherTenantSignals,
  dakinisListBranches,
  dakinisSeedDefaultBranchAsync,
  dakinisUpdateBusinessSettings,
  dakinisUpsertModuleOverrides,
  dakinisLoadModuleOverrides
} from "../services/tenant-intelligence-store.js";
import { dakinisQueryOne, dakinisRun } from "../db/query.js";
import { dakinisNormalizeCommercialPlan } from "@dakinis/shared/catalog/plan-modules.js";
import { dakinisRunIndustryAiHeuristics } from "@dakinis/shared/catalog/industry-ai-playbooks.js";
import {
  dakinisIntelligenceAskWithAgents,
  dakinisIntelligenceIsLlmEnabled
} from "../services/dakinis-intelligence-service.js";
import { dakinisHandleBosRoute } from "./bos-routes.js";
import { dakinisHandleTelemetryRoute } from "./telemetry-routes.js";
import { dakinisGatherGrowthSignals } from "../services/intelligence-data-store.js";
import { dakinisHandleIntelligenceV2Route } from "./intelligence-v2-routes.js";

function dakinisParseJson(rawBody) {
  try {
    return JSON.parse(rawBody || "{}");
  } catch {
    return null;
  }
}

function dakinisRequireTenantJwt(req) {
  if (!req.dakinisAuth || req.dakinisAuth.method !== "jwt") {
    return dakinisJsonError(403, "FORBIDDEN", "Requiere sesion JWT del negocio");
  }
  return null;
}

function dakinisMeta(business) {
  return { businessId: business.id, businessSlug: business.slug };
}

function dakinisBuildIndustryDashboard(business, signals, template) {
  const kpis = (template?.dashboardKpis || []).map((k) => {
    let value = 0;
    switch (k.key) {
      case "mesas_ocupadas":
        value = Math.min(12, signals.reservations7d);
        break;
      case "ventas_hoy":
      case "ingresos_hoy":
      case "ingresos_estimados":
        value = signals.reservations7d * 45;
        break;
      case "comandas_abiertas":
      case "ordenes_abiertas":
      case "pedidos_abiertos":
        value = signals.openOrders || Math.floor(signals.reservations7d / 3);
        break;
      case "pacientes_hoy":
      case "consultas_hoy":
      case "citas_hoy":
      case "citas_pendientes":
        value = signals.reservations7d;
        break;
      case "leads_activos":
        value = signals.crmContacts;
        break;
      case "visitas_hoy":
        value = Math.max(0, Math.floor(signals.reservations7d / 2));
        break;
      case "stock_alertas":
      case "stock_critico":
      case "repuestos_bajo_min":
        value = signals.stockAlerts;
        break;
      case "clientes_recurrentes":
      case "socios_activos":
      case "alumnos_activos":
      case "tutores_activos":
        value = signals.crmContacts;
        break;
      default:
        value = signals.crmContacts || signals.reservations7d;
    }
    return { ...k, value };
  });

  return {
    industry: template?.label || business.type,
    industryKey: template?.key || business.type,
    kpis,
    analytics: {
      monthOverMonth: signals.reservations7d > 0 ? "+12%" : "—",
      topProducts: business.type === "restaurante" ? ["Menú degustación", "Vino tinto"] : [],
      peakHours: ["12:00", "13:30", "20:00"],
      recurringClients: signals.crmContacts
    },
    portal: {
      enabled: false,
      subdomain: dakinisParseBusinessConfig(business.config_json).settings.portalSubdomain,
      features: template?.portalFeatures || []
    },
    saasUsage: {
      plan: dakinisNormalizeCommercialPlan(business.plan),
      users: signals.users,
      whatsappMessages7d: signals.whatsappMessages7d,
      aiQueriesMonth: 0,
      nextInvoiceEstimate: null
    }
  };
}

export async function dakinisHandleTenantProfileGet(req) {
  const business = req.dakinisBusiness;
  const overrides = business._moduleOverrides || (await dakinisLoadModuleOverrides(business.id));
  const template = dakinisGetIndustryTemplate(business.type);
  const { settings, raw } = dakinisParseBusinessConfig(business.config_json);
  const modules = dakinisResolveTenantModules(business, overrides);
  const signals = await dakinisGatherTenantSignals(business);
  const health = dakinisComputeTenantHealthScore(business, signals);
  const branches = await dakinisListBranches(business.id);

  return dakinisJsonSuccess(
    {
      business: {
        id: business.id,
        slug: business.slug,
        name: business.name,
        type: business.type,
        plan: business.plan
      },
      template: template
        ? {
            key: template.key,
            label: template.label,
            market: template.market,
            entity: template.entity,
            onboardingSteps: template.onboardingSteps,
            featureLabels: template.featureLabels
          }
        : null,
      settings,
      modules,
      branches,
      health,
      onboarding: {
        completed: settings.onboardingCompleted,
        step: settings.onboardingStep,
        steps: template?.onboardingSteps || [],
        title: template?.onboardingTitle || "Configura tu negocio"
      },
      configExtras: { templateKey: raw.templateKey || business.type }
    },
    business.type,
    dakinisMeta(business)
  );
}

export async function dakinisHandleTenantSettingsPatch(req, rawBody) {
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;
  if (!dakinisRoleCanManageUsers(req.dakinisAuth.role)) {
    return dakinisJsonError(403, "FORBIDDEN", "Sin permiso para editar configuracion");
  }
  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  const settings = await dakinisUpdateBusinessSettings(req.dakinisBusiness, body);
  return dakinisJsonSuccess({ settings }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleTenantOnboardingGet(req) {
  const template = dakinisGetIndustryTemplate(req.dakinisBusiness.type);
  const { settings } = dakinisParseBusinessConfig(req.dakinisBusiness.config_json);
  return dakinisJsonSuccess(
    {
      title: template?.onboardingTitle || "Configura tu negocio",
      steps: (template?.onboardingSteps || []).map((step, i) => ({
        key: step,
        index: i,
        done: settings.onboardingStep > i,
        current: settings.onboardingStep === i && !settings.onboardingCompleted
      })),
      autoModules: template?.autoModules || [],
      featureLabels: template?.featureLabels || [],
      completed: settings.onboardingCompleted
    },
    req.dakinisBusiness.type,
    dakinisMeta(req.dakinisBusiness)
  );
}

export async function dakinisHandleTenantOnboardingAdvance(req, rawBody) {
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;
  const body = dakinisParseJson(rawBody) || {};
  const template = dakinisGetIndustryTemplate(req.dakinisBusiness.type);
  const maxStep = (template?.onboardingSteps?.length || 1) - 1;
  const { settings } = dakinisParseBusinessConfig(req.dakinisBusiness.config_json);
  let nextStep = settings.onboardingStep;
  if (body.complete === true) {
    nextStep = maxStep + 1;
  } else if (typeof body.step === "number") {
    nextStep = Math.min(maxStep, Math.max(0, body.step));
  } else {
    nextStep = Math.min(maxStep + 1, settings.onboardingStep + 1);
  }
  const completed = nextStep > maxStep || body.markComplete === true;
  const updated = await dakinisUpdateBusinessSettings(req.dakinisBusiness, {
    onboardingStep: completed ? maxStep : nextStep,
    onboardingCompleted: completed
  });
  return dakinisJsonSuccess({ settings: updated, completed }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleTenantModulesGet(req) {
  const overrides =
    req.dakinisBusiness._moduleOverrides ||
    (await dakinisLoadModuleOverrides(req.dakinisBusiness.id));
  const modules = dakinisResolveTenantModules(req.dakinisBusiness, overrides);
  return dakinisJsonSuccess(modules, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleTenantModulesPatch(req, rawBody) {
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;
  if (!dakinisRoleCanManageUsers(req.dakinisAuth.role)) {
    return dakinisJsonError(403, "FORBIDDEN", "Sin permiso para gestionar modulos");
  }
  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  const patch = body.modules && typeof body.modules === "object" ? body.modules : body;
  const overrides = await dakinisUpsertModuleOverrides(req.dakinisBusiness.id, patch);
  req.dakinisBusiness._moduleOverrides = overrides;
  const modules = dakinisResolveTenantModules(req.dakinisBusiness, overrides);
  return dakinisJsonSuccess({ modules, overrides }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleTenantBranchesGet(req) {
  const branches = await dakinisListBranches(req.dakinisBusiness.id);
  return dakinisJsonSuccess({ branches }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleTenantBranchesPost(req, rawBody) {
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;
  if (!dakinisRoleCanManageUsers(req.dakinisAuth.role)) {
    return dakinisJsonError(403, "FORBIDDEN", "Sin permiso para crear sucursales");
  }
  const denied = dakinisPlanModuleDenialOrNull(req.dakinisBusiness, "/api/dashboard/metrics");
  if (denied) return denied;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  if (!name || !slug) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "name y slug son obligatorios");
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "slug invalido");
  }
  const clash = await dakinisQueryOne(
    `SELECT id FROM tenant_branches WHERE business_id = ? AND slug = ?`,
    [req.dakinisBusiness.id, slug]
  );
  if (clash) return dakinisJsonError(409, "SLUG_TAKEN", "Ya existe esa sucursal");

  const id = `br_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const tz = typeof body.timezone === "string" ? body.timezone.trim() : "Europe/Madrid";
  await dakinisRun(
    `INSERT INTO tenant_branches (id, business_id, slug, name, timezone, is_default, settings_json)
     VALUES (?, ?, ?, ?, ?, 0, '{}')`,
    [id, req.dakinisBusiness.id, slug, name, tz]
  );
  const branches = await dakinisListBranches(req.dakinisBusiness.id);
  return dakinisJsonSuccess({ branch: branches.find((b) => b.id === id), branches }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleTenantDashboardIndustryGet(req) {
  const template = dakinisGetIndustryTemplate(req.dakinisBusiness.type);
  const signals = await dakinisGatherTenantSignals(req.dakinisBusiness);
  const dashboard = dakinisBuildIndustryDashboard(req.dakinisBusiness, signals, template);
  return dakinisJsonSuccess({ dashboard, signals }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleTenantHealthScoreGet(req) {
  const signals = await dakinisGatherTenantSignals(req.dakinisBusiness);
  const health = dakinisComputeTenantHealthScore(req.dakinisBusiness, signals);
  return dakinisJsonSuccess({ health, signals }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export async function dakinisHandleTenantMarketplaceGet(req) {
  const overrides = await dakinisLoadModuleOverrides(req.dakinisBusiness.id);
  const modules = dakinisResolveTenantModules(req.dakinisBusiness, overrides);
  return dakinisJsonSuccess(
    { catalog: dakinisGetMarketplaceCatalog(), installed: modules.marketplace },
    req.dakinisBusiness.type,
    dakinisMeta(req.dakinisBusiness)
  );
}

export async function dakinisHandleTenantAiSuggestionsGet(req) {
  const denied = dakinisPlanModuleDenialOrNull(req.dakinisBusiness, "/api/dashboard/metrics");
  if (denied) return denied;
  const base = await dakinisGatherTenantSignals(req.dakinisBusiness);
  const signals = await dakinisGatherGrowthSignals(req.dakinisBusiness.id, base);
  const industrySuggestions = dakinisRunIndustryAiHeuristics(req.dakinisBusiness, signals);
  const intel = await dakinisIntelligenceAskWithAgents(req.dakinisBusiness, signals, {});
  return dakinisJsonSuccess(
    {
      assistant: "Asistente Dakinis",
      mode: intel.mode,
      llmEnabled: dakinisIntelligenceIsLlmEnabled(),
      suggestions: industrySuggestions,
      summary: intel.answer || industrySuggestions[0]?.answer
    },
    req.dakinisBusiness.type,
    dakinisMeta(req.dakinisBusiness)
  );
}

export async function dakinisHandlePublicIndustryTemplatesGet() {
  return dakinisJsonSuccess({ templates: dakinisGetIndustryTemplateCatalog() }, "platform", {});
}

export async function dakinisHandleTenantRolesCatalogGet(req) {
  return dakinisJsonSuccess({ roles: dakinisGetTenantRoleCatalog() }, req.dakinisBusiness.type, dakinisMeta(req.dakinisBusiness));
}

export function dakinisHandleTenantIntelligenceRoute(req, rawBody, url) {
  const path = url.pathname;

  const telemetry = dakinisHandleTelemetryRoute(req, rawBody, url);
  if (telemetry) return telemetry;

  const bos = dakinisHandleBosRoute(req, rawBody, url);
  if (bos) return bos;

  const v2 = dakinisHandleIntelligenceV2Route(req, rawBody, url);
  if (v2) return v2;

  if (req.method === "GET" && path === "/api/v1/tenant/profile") return dakinisHandleTenantProfileGet(req);
  if (req.method === "PATCH" && path === "/api/v1/tenant/settings") return dakinisHandleTenantSettingsPatch(req, rawBody);
  if (req.method === "GET" && path === "/api/v1/tenant/onboarding") return dakinisHandleTenantOnboardingGet(req);
  if (req.method === "POST" && path === "/api/v1/tenant/onboarding/advance") {
    return dakinisHandleTenantOnboardingAdvance(req, rawBody);
  }
  if (req.method === "GET" && path === "/api/v1/tenant/modules") return dakinisHandleTenantModulesGet(req);
  if (req.method === "PATCH" && path === "/api/v1/tenant/modules") return dakinisHandleTenantModulesPatch(req, rawBody);
  if (req.method === "GET" && path === "/api/v1/tenant/branches") return dakinisHandleTenantBranchesGet(req);
  if (req.method === "POST" && path === "/api/v1/tenant/branches") return dakinisHandleTenantBranchesPost(req, rawBody);
  if (req.method === "GET" && path === "/api/v1/tenant/dashboard") return dakinisHandleTenantDashboardIndustryGet(req);
  if (req.method === "GET" && path === "/api/v1/tenant/health-score") return dakinisHandleTenantHealthScoreGet(req);
  if (req.method === "GET" && path === "/api/v1/tenant/marketplace") return dakinisHandleTenantMarketplaceGet(req);
  if (req.method === "GET" && path === "/api/v1/tenant/ai/suggestions") return dakinisHandleTenantAiSuggestionsGet(req);
  if (req.method === "GET" && path === "/api/v1/tenant/roles") return dakinisHandleTenantRolesCatalogGet(req);

  return null;
}
