/**
 * Plan comercial SaaS → módulos de producto habilitados en API (`shared/core/factory.js`).
 * Normalización única para lectura desde `business.plan` (texto libre en DB hasta validación en escritura).
 */

export const DAKINIS_COMMERCIAL_PLAN_KEYS = Object.freeze(["starter", "growth", "pro"]);

const DAKINIS_PLAN_MODULE_SET = Object.freeze({
  starter: new Set(["agenda", "booking", "dashboard"]),
  growth: new Set(["agenda", "booking", "dashboard", "crm", "leads"]),
  pro: new Set(["agenda", "booking", "dashboard", "crm", "leads", "whatsapp"])
});

/**
 * @param {unknown} plan
 * @returns {"starter"|"growth"|"pro"}
 */
export function dakinisNormalizeCommercialPlan(plan) {
  const p = String(plan ?? "starter")
    .trim()
    .toLowerCase();
  if (p === "platform" || p === "advanced" || p === "enterprise") return "pro";
  if (p === "growth") return "growth";
  if (p === "pro") return "pro";
  return "starter";
}

/**
 * @param {unknown} planInput
 * @returns {"starter"|"growth"|"pro"|null} null = valor no permitido para persistir
 */
export function dakinisParseCommercialPlanForStorage(planInput) {
  const p = String(planInput ?? "")
    .trim()
    .toLowerCase();
  if (!p) return "starter";
  if (p === "advanced" || p === "enterprise") return "pro";
  if (DAKINIS_COMMERCIAL_PLAN_KEYS.includes(p)) return p;
  return null;
}

/**
 * @param {"starter"|"growth"|"pro"} normalizedPlan
 * @param {string} moduleKey agenda|booking|crm|whatsapp|leads|dashboard
 */
export function dakinisPlanHasModule(normalizedPlan, moduleKey) {
  const tier = DAKINIS_PLAN_MODULE_SET[normalizedPlan] ? normalizedPlan : "starter";
  return DAKINIS_PLAN_MODULE_SET[tier].has(String(moduleKey));
}

/**
 * @param {"starter"|"growth"|"pro"} normalizedPlan
 * @returns {string[]}
 */
export function dakinisListModulesForPlan(normalizedPlan) {
  const tier = DAKINIS_PLAN_MODULE_SET[normalizedPlan] ? normalizedPlan : "starter";
  return Array.from(DAKINIS_PLAN_MODULE_SET[tier]);
}
