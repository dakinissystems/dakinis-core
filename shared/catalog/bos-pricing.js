/**
 * Modelo comercial híbrido Dakinis BOS (Stripe Payment Links + Checkout Session).
 * Principal: planes SaaS 29/79/149 + cuotas incluidas + exceso por consumo.
 * Paralelo: implantación + servicios profesionales (fuera de suscripción automática).
 */

/** Coste interno operador (margen), no precio al cliente. */
export const DAKINIS_AI_COST_PER_1K_TOKENS_EUR = 0.002;
export const DAKINIS_WHATSAPP_COST_PER_MESSAGE_EUR = 0.05;

export const DAKINIS_PLAN_BASE_EUR = Object.freeze({
  starter: 29,
  growth: 79,
  pro: 149
});

/** Consultas IA incluidas / mes (Pro; Growth/Starter sin IA como producto principal). */
export const DAKINIS_PLAN_INCLUDED_AI_QUERIES = Object.freeze({
  starter: 0,
  growth: 0,
  pro: 2000
});

/** Mensajes WhatsApp salientes incluidos / mes. */
export const DAKINIS_PLAN_INCLUDED_WHATSAPP_MESSAGES = Object.freeze({
  starter: 0,
  growth: 250,
  pro: 2000
});

/** Exceso facturado al cliente (no coste interno). */
export const DAKINIS_AI_OVERAGE_EUR_PER_1K_QUERIES = 5;
export const DAKINIS_WHATSAPP_OVERAGE_EUR_PER_500_MESSAGES = 5;

/** Qué incluye cada plan (venta por resultado, no por módulo suelto). */
export const DAKINIS_PLAN_COMMERCIAL_INCLUDES = Object.freeze({
  starter: [
    "CRM básico",
    "Agenda",
    "Reservas",
    "Portal cliente"
  ],
  growth: [
    "Inventario",
    "CRM completo",
    "Analytics",
    "Benchmark",
    "250 mensajes WhatsApp/mes incluidos"
  ],
  pro: [
    "WhatsApp",
    "IA + Copilot",
    "Automatizaciones",
    "Dakinis Network",
    "2.000 consultas IA/mes incluidas",
    "2.000 mensajes WhatsApp/mes incluidos"
  ]
});

/** Implantación inicial (one-time; cotización manual / Stripe invoice). */
export const DAKINIS_IMPLEMENTATION_TIERS_EUR = Object.freeze([
  { key: "light", label: "Configuración ligera", range: "500 €" },
  { key: "standard", label: "Implantación estándar", range: "1.000 €" },
  { key: "advanced", label: "Implantación avanzada", range: "2.000 €" },
  { key: "enterprise", label: "Proyecto a medida", range: "3.000 €+" }
]);

/** Paquetes de proyecto (landing / propuesta comercial). */
export const DAKINIS_PROJECT_PACKS = Object.freeze({
  mvp: { name: "MVP rápido", range: "300 – 600 €", delivery: "5 – 10 días" },
  professional: { name: "Sistema profesional", range: "800 – 1.500 €", delivery: "2 – 4 semanas" },
  advanced: { name: "Solución avanzada", range: "1.500 – 3.000 €+", delivery: "según alcance" }
});

/** Servicios profesionales recurrentes o puntual. */
export const DAKINIS_PROFESSIONAL_SERVICES = Object.freeze({
  hourlyRateEur: 40,
  projectBundlesEur: [300, 500, 1000],
  examples: [
    "Migración de datos",
    "Personalización vertical",
    "Integraciones (WhatsApp, APIs)",
    "Automatizaciones a medida"
  ],
  maintenance: [
    { key: "basic", name: "Soporte básico", priceEur: 20 },
    { key: "plus", name: "Soporte + mejoras", priceEur: 50 }
  ]
});

export function dakinisEstimateAiCostEur(tokensIn, tokensOut) {
  const total = (Number(tokensIn) || 0) + (Number(tokensOut) || 0);
  return Math.round((total / 1000) * DAKINIS_AI_COST_PER_1K_TOKENS_EUR * 10000) / 10000;
}

export function dakinisEstimateHeuristicQueryCostEur() {
  return 0.001;
}

function num(v) {
  return typeof v === "number" ? v : Number(v) || 0;
}

/**
 * Factura comercial mensual: base plan + exceso IA/WA (modelo híbrido BOS).
 * @param {string} plan — starter | growth | pro
 * @param {{ aiQueries?: number, whatsappMessages?: number }} usage — uso del periodo (30d)
 */
export function dakinisComputeCommercialMonthlyInvoice(plan, usage = {}) {
  const normalized = plan === "platform" ? "pro" : String(plan || "starter").toLowerCase();
  const planKey = DAKINIS_PLAN_BASE_EUR[normalized] != null ? normalized : "starter";

  const baseEur = DAKINIS_PLAN_BASE_EUR[planKey];
  const includedAi = DAKINIS_PLAN_INCLUDED_AI_QUERIES[planKey] ?? 0;
  const includedWa = DAKINIS_PLAN_INCLUDED_WHATSAPP_MESSAGES[planKey] ?? 0;

  const aiQueries = num(usage.aiQueries);
  const whatsappMessages = num(usage.whatsappMessages);

  const aiExtra = Math.max(0, aiQueries - includedAi);
  const waExtra = Math.max(0, whatsappMessages - includedWa);

  const aiOverageEur =
    aiExtra > 0
      ? Math.ceil(aiExtra / 1000) * DAKINIS_AI_OVERAGE_EUR_PER_1K_QUERIES
      : 0;
  const waOverageEur =
    waExtra > 0
      ? Math.ceil(waExtra / 500) * DAKINIS_WHATSAPP_OVERAGE_EUR_PER_500_MESSAGES
      : 0;

  const totalEur = Math.round((baseEur + aiOverageEur + waOverageEur) * 100) / 100;

  return {
    model: "hybrid_bos_saas",
    plan: planKey,
    baseEur,
    includes: DAKINIS_PLAN_COMMERCIAL_INCLUDES[planKey] || [],
    included: {
      aiQueries: includedAi,
      whatsappMessages: includedWa
    },
    usage: {
      aiQueries,
      whatsappMessages,
      aiOverageQueries: aiExtra,
      whatsappOverageMessages: waExtra
    },
    overage: {
      aiEur: aiOverageEur,
      whatsappEur: waOverageEur,
      aiRate: `${DAKINIS_AI_OVERAGE_EUR_PER_1K_QUERIES} € / 1.000 consultas extra`,
      whatsappRate: `${DAKINIS_WHATSAPP_OVERAGE_EUR_PER_500_MESSAGES} € / 500 mensajes extra`
    },
    totalEur,
    lineItems: [
      { key: "plan_base", label: `Plan ${planKey}`, amountEur: baseEur },
      ...(aiOverageEur > 0
        ? [{ key: "ai_overage", label: `IA exceso (${aiExtra} consultas)`, amountEur: aiOverageEur }]
        : []),
      ...(waOverageEur > 0
        ? [
            {
              key: "whatsapp_overage",
              label: `WhatsApp exceso (${waExtra} mensajes)`,
              amountEur: waOverageEur
            }
          ]
        : [])
    ]
  };
}
