/**
 * Modelo comercial híbrido Dakinis BOS (Stripe Payment Links + Checkout Session).
 * Principal: planes SaaS 39/89/169 (+ Enterprise ancla) + cuotas + exceso.
 * Paralelo: implantación + servicios profesionales (fuera de suscripción automática).
 *
 * v1.2 — ARPU: usuarios/storage, implantación consultoría, soporte con horas, packs fijo.
 */

/** Coste interno operador (margen), no precio al cliente. */
export const DAKINIS_AI_COST_PER_1K_TOKENS_EUR = 0.002;
export const DAKINIS_WHATSAPP_COST_PER_MESSAGE_EUR = 0.05;

export const DAKINIS_PLAN_BASE_EUR = Object.freeze({
  starter: 39,
  growth: 89,
  pro: 169,
  enterprise: 299,
});

/** Usuarios incluidos / mes (null = ilimitados). Extra: DAKINIS_EXTRA_USER_EUR. */
export const DAKINIS_PLAN_INCLUDED_USERS = Object.freeze({
  starter: 2,
  growth: 8,
  pro: null,
  enterprise: null,
});

export const DAKINIS_EXTRA_USER_EUR = 8;

/** Almacenamiento incluido (GB). Percepción comercial; no hard-cap técnico obligatorio. */
export const DAKINIS_PLAN_INCLUDED_STORAGE_GB = Object.freeze({
  starter: 5,
  growth: 50,
  pro: 200,
  enterprise: 500,
});

/** Horas ahorradas estimadas / mes (mensaje de valor). */
export const DAKINIS_PLAN_HOURS_SAVED = Object.freeze({
  starter: 5,
  growth: 15,
  pro: 40,
  enterprise: 60,
});

/**
 * Respuestas / acciones IA incluidas / mes (copy: no “consultas”).
 * Internamente se cuenta como unidad de uso IA.
 */
export const DAKINIS_PLAN_INCLUDED_AI_QUERIES = Object.freeze({
  starter: 0,
  growth: 0,
  pro: 2000,
  enterprise: 10000,
});

/**
 * Conversaciones WhatsApp incluidas / mes (copy comercial).
 * Internamente se factura por mensajes salientes con la misma cuota numérica.
 */
export const DAKINIS_PLAN_INCLUDED_WHATSAPP_MESSAGES = Object.freeze({
  starter: 0,
  growth: 250,
  pro: 2000,
  enterprise: 10000,
});

/** Exceso facturado al cliente (no coste interno). */
export const DAKINIS_AI_OVERAGE_EUR_PER_1K_QUERIES = 5;
export const DAKINIS_WHATSAPP_OVERAGE_EUR_PER_500_MESSAGES = 5;

/** Implantación one-time recomendada por plan SaaS (€ fijos). */
export const DAKINIS_PLAN_IMPLEMENTATION_EUR = Object.freeze({
  starter: 290,
  growth: 690,
  pro: 1490,
});

/** Qué incluye cada plan (venta por resultado, no por módulo suelto). */
export const DAKINIS_PLAN_COMMERCIAL_INCLUDES = Object.freeze({
  starter: [
    "CRM básico",
    "Agenda",
    "Reservas",
    "Portal cliente",
    "Hasta 2 usuarios",
    "5 GB de almacenamiento",
  ],
  growth: [
    "Inventario",
    "CRM completo",
    "Analytics",
    "Benchmark",
    "WhatsApp incluido (250 conversaciones/mes)",
    "Hasta 8 usuarios",
    "50 GB de almacenamiento",
  ],
  pro: [
    "WhatsApp",
    "IA + Copilot",
    "Automatizaciones",
    "Dakinis Network",
    "2.000 respuestas IA/mes incluidas",
    "2.000 conversaciones WhatsApp/mes incluidas",
    "Usuarios ilimitados",
    "200 GB de almacenamiento",
  ],
  enterprise: [
    "Todo lo del Pro",
    "Multiempresa",
    "SLA y soporte prioritario",
    "API e integraciones",
    "Cuotas ampliadas de IA y WhatsApp",
    "Consultoría incluida",
  ],
});

/** Implantación genérica (legacy tiers / cotización amplia). */
export const DAKINIS_IMPLEMENTATION_TIERS_EUR = Object.freeze([
  { key: "light", label: "Configuración ligera", range: "290 €" },
  { key: "standard", label: "Implantación estándar", range: "690 €" },
  { key: "advanced", label: "Implantación avanzada", range: "1.490 €" },
  { key: "enterprise", label: "Proyecto a medida", range: "3.000 €+" },
]);

/** Paquetes de proyecto (landing / propuesta comercial). */
export const DAKINIS_PROJECT_PACKS = Object.freeze({
  mvp: { name: "MVP rápido", range: "600 €", delivery: "5 – 10 días" },
  professional: { name: "Sistema profesional", range: "1.500 €", delivery: "2 – 4 semanas" },
  advanced: { name: "Solución avanzada", range: "3.000 €+", delivery: "según alcance" },
});

/** Servicios profesionales recurrentes o puntual. */
export const DAKINIS_PROFESSIONAL_SERVICES = Object.freeze({
  hourlyRateEur: 60,
  projectBundlesEur: [600, 1500, 3000],
  examples: [
    "Migración de datos",
    "Personalización vertical",
    "Integraciones (WhatsApp, APIs)",
    "Automatizaciones a medida",
  ],
  maintenance: [
    { key: "basic", name: "Soporte básico", priceEur: 29, hoursIncluded: 1 },
    { key: "priority", name: "Soporte prioridad", priceEur: 79, hoursIncluded: 3 },
    { key: "premium", name: "Soporte premium", priceEur: 149, hoursIncluded: 6 },
  ],
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
 * @param {string} plan — starter | growth | pro | enterprise
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
    aiExtra > 0 ? Math.ceil(aiExtra / 1000) * DAKINIS_AI_OVERAGE_EUR_PER_1K_QUERIES : 0;
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
      whatsappMessages: includedWa,
      users: DAKINIS_PLAN_INCLUDED_USERS[planKey],
      storageGb: DAKINIS_PLAN_INCLUDED_STORAGE_GB[planKey],
    },
    usage: {
      aiQueries,
      whatsappMessages,
      aiOverageQueries: aiExtra,
      whatsappOverageMessages: waExtra,
    },
    overage: {
      aiEur: aiOverageEur,
      whatsappEur: waOverageEur,
      aiRate: `${DAKINIS_AI_OVERAGE_EUR_PER_1K_QUERIES} € / 1.000 respuestas IA extra`,
      whatsappRate: `${DAKINIS_WHATSAPP_OVERAGE_EUR_PER_500_MESSAGES} € / 500 conversaciones extra`,
      extraUserEur: DAKINIS_EXTRA_USER_EUR,
    },
    totalEur,
    lineItems: [
      { key: "plan_base", label: `Plan ${planKey}`, amountEur: baseEur },
      ...(aiOverageEur > 0
        ? [{ key: "ai_overage", label: `IA exceso (${aiExtra} respuestas)`, amountEur: aiOverageEur }]
        : []),
      ...(waOverageEur > 0
        ? [
            {
              key: "whatsapp_overage",
              label: `WhatsApp exceso (${waExtra} conversaciones)`,
              amountEur: waOverageEur,
            },
          ]
        : []),
    ],
  };
}
