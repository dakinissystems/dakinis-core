import { dakinisNormalizeCommercialPlan } from "@dakinis/shared/catalog/plan-modules.js";
import { dakinisJsonError } from "./responses.js";

/** Reglas comerciales BOS: ruta exacta o prefijo → planes permitidos. */
const DAKINIS_COMMERCIAL_ROUTE_RULES = Object.freeze([
  { method: "POST", path: "/api/v1/tenant/copilot", plans: ["pro"] },
  { method: "POST", path: "/api/v1/tenant/intelligence/ask", plans: ["pro"] },
  { method: "GET", path: "/api/v1/tenant/ai/suggestions", plans: ["pro"] },
  { method: "GET", path: "/api/v1/tenant/benchmark/real", plans: ["growth", "pro"] },
  { method: "GET", path: "/api/v1/tenant/benchmark", plans: ["growth", "pro"] },
  { method: "GET", path: "/api/v1/tenant/growth-score", plans: ["growth", "pro"] },
  { method: "POST", path: "/api/v1/tenant/marketplace/install", plans: ["growth", "pro"] },
  { method: "POST", pathPrefix: "/api/v1/tenant/intelligence/actions/", plans: ["pro"] },
  { method: "GET", pathPrefix: "/api/v1/tenant/network/", plans: ["pro"] },
  { method: "POST", pathPrefix: "/api/v1/tenant/network/", plans: ["pro"] }
]);

function dakinisNormalizeMethod(method) {
  return String(method || "GET").toUpperCase();
}

function dakinisRuleMatches(rule, method, pathname) {
  if (rule.method && rule.method !== method) return false;
  if (rule.path) return pathname === rule.path;
  if (rule.pathPrefix) return pathname.startsWith(rule.pathPrefix);
  return false;
}

function dakinisFindCommercialRouteRule(method, pathname) {
  return DAKINIS_COMMERCIAL_ROUTE_RULES.find((rule) => dakinisRuleMatches(rule, method, pathname)) || null;
}

/**
 * Gate comercial por plan en rutas BOS `/api/v1/tenant/*`.
 * @param {{ plan?: string }} business
 * @param {string} method
 * @param {string} pathname
 */
export function dakinisCommercialRoutePlanDenialOrNull(business, method, pathname) {
  const rule = dakinisFindCommercialRouteRule(dakinisNormalizeMethod(method), pathname);
  if (!rule) return null;

  const tier = dakinisNormalizeCommercialPlan(business?.plan);
  if (rule.plans.includes(tier)) return null;

  const upgradeTo = rule.plans.includes("growth") && !rule.plans.includes("starter") ? "growth" : "pro";

  return dakinisJsonError(403, "PLAN_MODULE_DENIED", "Tu plan no incluye esta funcion", {
    plan: tier,
    requiredPlans: rule.plans,
    upgradeTo,
    path: pathname
  });
}
