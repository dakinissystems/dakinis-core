import {
  dakinisNormalizeCommercialPlan,
  dakinisPlanHasModule
} from "@dakinis/shared/catalog/plan-modules.js";
import { dakinisJsonError } from "./responses.js";

const DAKINIS_MODULE_MIN_PLAN = {
  whatsapp: "pro",
  crm: "growth",
  leads: "growth",
  agenda: "starter",
  booking: "starter",
  dashboard: "starter"
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
  if (pathname.startsWith("/api/tenant/")) return null;
  if (pathname === "/api/config") return null;
  if (pathname === "/api/health") return null;
  if (pathname.startsWith("/api/agenda/")) return "agenda";
  if (pathname.startsWith("/api/booking/")) return "booking";
  if (pathname.startsWith("/api/crm/") || pathname.startsWith("/api/v1/crm/")) return "crm";
  if (pathname.startsWith("/api/whatsapp/")) return "whatsapp";
  if (pathname.startsWith("/api/leads/")) return "leads";
  if (pathname.startsWith("/api/dashboard/")) return "dashboard";
  return null;
}

/**
 * @param {{ plan?: string }} business
 * @param {string} pathname
 * @returns {ReturnType<typeof dakinisJsonError>|null}
 */
export function dakinisPlanModuleDenialOrNull(business, pathname) {
  const mod = dakinisTenantApiPathRequiredModule(pathname);
  if (!mod) return null;
  const tier = dakinisNormalizeCommercialPlan(business.plan);
  if (dakinisPlanHasModule(tier, mod)) return null;
  return dakinisJsonError(403, "PLAN_MODULE_DENIED", "Tu plan no incluye este modulo de producto", {
    module: mod,
    plan: tier,
    upgradeTo: dakinisSuggestUpgradeForModule(mod)
  });
}
