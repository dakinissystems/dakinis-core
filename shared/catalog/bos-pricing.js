/** Costes internos estimados (sin Stripe). Actualizar cuando conectes pasarela. */

export const DAKINIS_AI_COST_PER_1K_TOKENS_EUR = 0.002;
export const DAKINIS_WHATSAPP_COST_PER_MESSAGE_EUR = 0.05;

export const DAKINIS_PLAN_BASE_EUR = Object.freeze({
  starter: 29,
  growth: 79,
  pro: 149
});

export function dakinisEstimateAiCostEur(tokensIn, tokensOut) {
  const total = (Number(tokensIn) || 0) + (Number(tokensOut) || 0);
  return Math.round((total / 1000) * DAKINIS_AI_COST_PER_1K_TOKENS_EUR * 10000) / 10000;
}

export function dakinisEstimateHeuristicQueryCostEur() {
  return 0.001;
}
