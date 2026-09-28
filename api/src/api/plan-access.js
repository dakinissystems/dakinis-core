import {
  dakinisNormalizeCommercialPlan,
  dakinisPlanHasModule
} from "@dakinis/shared/catalog/plan-modules.js";
import { resolveTenantCapabilities } from "@dakinis/shared/catalog/product-capabilities.js";
import { dakinisJsonError } from "./responses.js";

const DAKINIS_MODULE_MIN_PLAN = {
  whatsapp: "pro",
  crm: "growth",
  leads: "growth",
  inventory: "starter",
  sales: "starter",
  reports: "growth",
  ai: "pro",
  agenda: "starter",
  booking: "starter",
  dashboard: "starter"
};

/** API path prefix → plan module key */
const PATH_MODULE_RULES = [
  ["/api/agenda/", "agenda"],
  ["/api/booking/", "booking"],
  ["/api/crm/", "crm"],
  ["/api/v1/crm/", "crm"],
  ["/api/whatsapp/", "whatsapp"],
  ["/api/v1/whatsapp/", "whatsapp"],
  ["/api/leads/", "leads"],
  ["/api/dashboard/", "dashboard"],
  ["/api/inventario", "inventory"],
  ["/api/inventory", "inventory"],
  ["/api/v1/inventory", "inventory"],
  ["/api/tenant/supply", "inventory"],
  ["/api/ventas", "sales"],
  ["/api/sales", "sales"],
  ["/api/v1/sales", "sales"],
  ["/api/reportes", "reports"],
  ["/api/reports", "reports"],
  ["/api/v1/reports", "reports"],
  ["/api/v1/tenant/intelligence", "ai"],
];

/** Plan module → product capability */
const MODULE_CAPABILITY = {
  crm: "crm",
  leads: "crm",
  whatsapp: "whatsapp",
  inventory: "inventory",
  sales: "sales",
  reports: "reports",
  ai: "ai",
  agenda: "hospitality",
  booking: "hospitality",
  dashboard: "hub",
};

function dakinisSuggestUpgradeForModule(moduleKey) {
  return DAKINIS_MODULE_MIN_PLAN[moduleKey] || "growth";
}

/**
 * Módulo de producto requerido por ruta tenant (null = sin gateo por plan).
 * @param {string} pathname
 * @returns {string|null}
 */
export function dakinisTenantApiPathRequiredModule(pathname) {
  if (pathname.startsWith("/api/tenant/") && !pathname.startsWith("/api/tenant/supply")) return null;
  if (pathname === "/api/config") return null;
  if (pathname === "/api/health") return null;
  for (const [prefix, mod] of PATH_MODULE_RULES) {
    if (pathname === prefix || pathname.startsWith(prefix) || pathname.startsWith(`${prefix}/`)) {
      return mod;
    }
  }
  return null;
}

/**
 * @param {{ plan?: string; access_state?: string; access_reason?: string; entitled_plan?: string; type?: string; modulesEnabled?: string[]; capabilities?: string[] }} business
 * @param {string} pathname
 * @returns {ReturnType<typeof dakinisJsonError>|null}
 */
export function dakinisPlanModuleDenialOrNull(business, pathname) {
  const accessState = String(business.access_state || "active").toLowerCase();
  if (accessState === "suspended" || accessState === "closed") {
    return dakinisJsonError(403, "ACCESS_SUSPENDED", "Acceso suspendido — contacta con soporte", {
      accessState,
      accessReason: business.access_reason || null,
    });
  }

  const mod = dakinisTenantApiPathRequiredModule(pathname);
  if (!mod) return null;

  const tier = dakinisNormalizeCommercialPlan(business.plan);
  const planOk = dakinisPlanHasModule(tier, mod);

  const capabilities = resolveTenantCapabilities({
    business: {
      ...business,
      planTier: tier,
      modulesEnabled: business.modulesEnabled || undefined,
      type: business.type,
    },
  });
  const neededCap = MODULE_CAPABILITY[mod];
  const capOk = !neededCap || capabilities.includes(neededCap);

  if (planOk && capOk) return null;

  if (accessState === "degraded") {
    return dakinisJsonError(403, "ACCESS_DEGRADED", "Pago pendiente — funciones Pro limitadas hasta regularizar", {
      module: mod,
      capability: neededCap,
      plan: tier,
      accessState,
      accessReason: business.access_reason || "payment_past_due",
      entitledPlan: business.entitled_plan || tier,
      upgradeTo: dakinisSuggestUpgradeForModule(mod),
    });
  }

  return dakinisJsonError(
    403,
    planOk ? "CAPABILITY_DENIED" : "PLAN_MODULE_DENIED",
    planOk
      ? "Tu tenant no tiene esta capability habilitada"
      : "Tu plan no incluye este modulo de producto",
    {
      module: mod,
      capability: neededCap,
      plan: tier,
      capabilities,
      upgradeTo: dakinisSuggestUpgradeForModule(mod),
    }
  );
}
