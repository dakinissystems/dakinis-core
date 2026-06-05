import { dakinisGetIndustryTemplate } from "./business-templates.js";

/**
 * Health Score 0–100 (heurística, sin ML externo).
 * @param {{ type?: string }} business
 * @param {{
 *   crmContacts?: number,
 *   activities7d?: number,
 *   reservations7d?: number,
 *   openOrders?: number,
 *   stockAlerts?: number,
 *   whatsappMessages7d?: number,
 *   branches?: number,
 *   users?: number,
 *   onboardingCompleted?: boolean
 * }} signals
 */
export function dakinisComputeTenantHealthScore(business, signals = {}) {
  const template = dakinisGetIndustryTemplate(business?.type);
  const weights = {
    onboarding: 12,
    crm: 18,
    activity: 20,
    operations: 25,
    engagement: 15,
    team: 10
  };

  let score = 0;
  const factors = [];

  if (signals.onboardingCompleted) {
    score += weights.onboarding;
    factors.push({ key: "onboarding", label: "Onboarding completado", impact: weights.onboarding });
  } else {
    factors.push({ key: "onboarding", label: "Onboarding pendiente", impact: 0 });
  }

  const contacts = signals.crmContacts ?? 0;
  const crmPart = Math.min(weights.crm, contacts * 3);
  score += crmPart;
  factors.push({ key: "crm", label: `${contacts} contactos CRM`, impact: crmPart });

  const act = signals.activities7d ?? 0;
  const actPart = Math.min(weights.activity, act * 4);
  score += actPart;
  factors.push({ key: "activity", label: `${act} actividades (7 días)`, impact: actPart });

  let opsPart = 0;
  if (template?.key === "restaurante") {
    const orders = signals.openOrders ?? 0;
    const alerts = signals.stockAlerts ?? 0;
    opsPart = Math.min(weights.operations, 10 + orders * 2 - alerts * 3);
  } else {
    const res = signals.reservations7d ?? 0;
    opsPart = Math.min(weights.operations, res * 5);
  }
  opsPart = Math.max(0, opsPart);
  score += opsPart;
  factors.push({ key: "operations", label: "Operativa del sector", impact: opsPart });

  const wa = signals.whatsappMessages7d ?? 0;
  const engPart = Math.min(weights.engagement, wa * 2);
  score += engPart;
  factors.push({ key: "engagement", label: `${wa} mensajes WA (7 días)`, impact: engPart });

  const team = signals.users ?? 1;
  const teamPart = Math.min(weights.team, team * 3);
  score += teamPart;
  factors.push({ key: "team", label: `${team} usuarios`, impact: teamPart });

  const total = Math.round(Math.min(100, Math.max(0, score)));
  let status = "needs_attention";
  if (total >= 80) status = "excellent";
  else if (total >= 60) status = "good";
  else if (total >= 40) status = "fair";

  return {
    score: total,
    max: 100,
    status,
    statusLabel:
      {
        excellent: "Excelente",
        good: "Buen estado",
        fair: "Mejorable",
        needs_attention: "Requiere atención"
      }[status] || status,
    factors,
    industry: template?.label || business?.type || "general"
  };
}
