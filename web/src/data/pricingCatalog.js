/**
 * Catálogo comercial público — reexporta números desde @dakinis/shared y añade textos de paquetes proyecto.
 */
import {
  DAKINIS_PLAN_BASE_EUR,
  DAKINIS_PLAN_INCLUDED_AI_QUERIES,
  DAKINIS_PLAN_INCLUDED_WHATSAPP_MESSAGES,
  DAKINIS_IMPLEMENTATION_TIERS_EUR,
  DAKINIS_PROJECT_PACKS,
  DAKINIS_PROFESSIONAL_SERVICES,
  DAKINIS_AI_OVERAGE_EUR_PER_1K_QUERIES,
  DAKINIS_WHATSAPP_OVERAGE_EUR_PER_500_MESSAGES
} from "@dakinis/shared/catalog/bos-pricing.js";

export const DAKINIS_BOS_PLAN_KEYS = Object.freeze(["starter", "growth", "pro"]);

export function dakinisBuildBosPlanCards() {
  return DAKINIS_BOS_PLAN_KEYS.map((key) => ({
    key,
    priceEur: DAKINIS_PLAN_BASE_EUR[key],
    featured: key === "growth",
    includedAi: DAKINIS_PLAN_INCLUDED_AI_QUERIES[key],
    includedWa: DAKINIS_PLAN_INCLUDED_WHATSAPP_MESSAGES[key]
  }));
}

export const dakinisBosOverage = Object.freeze({
  aiEurPer1k: DAKINIS_AI_OVERAGE_EUR_PER_1K_QUERIES,
  whatsappEurPer500: DAKINIS_WHATSAPP_OVERAGE_EUR_PER_500_MESSAGES
});

export const dakinisImplementationTiers = DAKINIS_IMPLEMENTATION_TIERS_EUR;

export const dakinisProfessionalServices = DAKINIS_PROFESSIONAL_SERVICES;

export const dakinisPricingIntro = {
  title: "Paquetes claros",
  subtitle:
    "No vendemos horas sueltas: eliges un alcance con precio y plazo cerrados. En la llamada te recomiendo un pack concreto dentro de estos rangos — sin “depende” ni “ya veremos”.",
  portfolioNote:
    "Precios reducidos mientras amplío cartera de proyectos reales; misma base probada que acelera entrega.",
  valuePoints: [
    "Ya tengo una base hecha: no empezamos desde cero.",
    "Eso reduce coste, plazo y riesgo para ti.",
    "Solución a tu operativa (tiempo, líos, errores), no un discurso técnico."
  ]
};

export const dakinisPackMvp = {
  key: "mvp",
  badge: "Pack 1",
  name: "MVP rápido",
  audience: "Para clientes pequeños — tu entrada",
  priceRange: DAKINIS_PROJECT_PACKS.mvp.range,
  delivery: DAKINIS_PROJECT_PACKS.mvp.delivery,
  pitch: "Te dejo un sistema funcional en menos de 10 días para empezar a trabajar.",
  includes: [
    "Login básico",
    "Panel funcional",
    "1 módulo (agenda / clientes / pedidos)",
    "Deploy incluido"
  ]
};

export const dakinisPackPro = {
  key: "pro",
  badge: "Pack 2",
  name: "Sistema profesional",
  audience: "Tu producto principal",
  priceRange: DAKINIS_PROJECT_PACKS.professional.range,
  delivery: DAKINIS_PROJECT_PACKS.professional.delivery,
  pitch: "Te construyo un sistema completo adaptado a tu negocio.",
  includes: [
    "Todo lo del MVP +",
    "2 – 3 módulos (agenda + CRM + automatización)",
    "Roles de usuario",
    "Mejoras UX",
    "Base escalable"
  ],
  featured: true
};

export const dakinisPackAdvanced = {
  key: "advanced",
  badge: "Pack 3",
  name: "Solución a medida avanzada",
  audience: "Solo si tu caso lo pide",
  priceRange: DAKINIS_PROJECT_PACKS.advanced.range,
  delivery: DAKINIS_PROJECT_PACKS.advanced.delivery,
  pitch: "Integraciones, reglas de negocio y automatización cuando el estándar no basta.",
  includes: [
    "Integraciones (WhatsApp, APIs externas)",
    "Automatizaciones complejas",
    "Lógica específica de tu operativa"
  ]
};

export const dakinisMaintenanceTiers = DAKINIS_PROFESSIONAL_SERVICES.maintenance.map((tier) => ({
  key: tier.key,
  name: tier.name,
  price: `${tier.priceEur} €/mes`,
  description:
    tier.key === "basic"
      ? "Incidencias, pequeños ajustes y que el sistema siga vivo en producción."
      : "Prioridad en soporte y hueco mensual para mejoras pequeñas encaminadas."
}));

export const dakinisMaintenancePitch =
  "Después del desarrollo puedes mantenerlo y mejorarlo poco a poco — sin sorpresas.";
