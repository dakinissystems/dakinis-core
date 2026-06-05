import {
  dakinisListModulesForPlan,
  dakinisNormalizeCommercialPlan,
  dakinisPlanHasModule
} from "./plan-modules.js";
import { dakinisDefaultModulesForIndustry } from "./business-templates.js";

/** Catálogo marketplace (instalables sin despliegue). */
export const DAKINIS_MARKETPLACE_MODULES = Object.freeze({
  crm: {
    key: "crm",
    label: "CRM",
    minPlan: "growth",
    description: "Contactos, empresas y actividades"
  },
  whatsapp: {
    key: "whatsapp",
    label: "WhatsApp",
    minPlan: "pro",
    description: "Conversaciones y envío Cloud API"
  },
  inventario: {
    key: "inventario",
    label: "Inventario",
    minPlan: "starter",
    description: "Stock, alertas y movimientos",
    apiModule: "dashboard"
  },
  reservas: {
    key: "reservas",
    label: "Reservas",
    minPlan: "starter",
    description: "Agenda y booking online",
    apiModule: "booking"
  },
  analytics: {
    key: "analytics",
    label: "Analytics",
    minPlan: "growth",
    description: "Comparativas, top productos y horas pico",
    apiModule: "dashboard"
  },
  ia: {
    key: "ia",
    label: "Asistente IA",
    minPlan: "pro",
    description: "Tenant AI y recomendaciones",
    apiModule: "dashboard"
  },
  portal_cliente: {
    key: "portal_cliente",
    label: "Portal cliente",
    minPlan: "growth",
    description: "Subdominio cliente.negocio.com",
    apiModule: "booking"
  },
  multi_sucursal: {
    key: "multi_sucursal",
    label: "Multi sucursal",
    minPlan: "growth",
    description: "Sucursales con stock y ventas separados",
    apiModule: "dashboard"
  }
});

/** Mapeo módulo marketplace → gate API legacy */
export const DAKINIS_MARKETPLACE_TO_API_MODULE = Object.freeze({
  crm: "crm",
  whatsapp: "whatsapp",
  inventario: "dashboard",
  reservas: "booking",
  analytics: "dashboard",
  ia: "dashboard",
  portal_cliente: "booking",
  multi_sucursal: "dashboard",
  agenda: "agenda",
  booking: "booking",
  leads: "leads",
  dashboard: "dashboard"
});

const PLAN_RANK = { starter: 0, growth: 1, pro: 2 };

function dakinisPlanRank(plan) {
  return PLAN_RANK[dakinisNormalizeCommercialPlan(plan)] ?? 0;
}

/**
 * @param {string} plan
 * @param {string} moduleKey
 * @param {Record<string, boolean>|null} overrides
 */
export function dakinisResolveTenantModuleEnabled(plan, moduleKey, overrides = null) {
  const apiMod = DAKINIS_MARKETPLACE_TO_API_MODULE[moduleKey] || moduleKey;
  const tier = dakinisNormalizeCommercialPlan(plan);
  const planAllows = dakinisPlanHasModule(tier, apiMod);
  if (overrides && Object.prototype.hasOwnProperty.call(overrides, moduleKey)) {
    return planAllows && overrides[moduleKey] !== false;
  }
  return planAllows;
}

/**
 * Lista módulos efectivos: plan ∩ industria + overrides tenant.
 * @param {{ plan?: string, type?: string, config_json?: string }} business
 * @param {Record<string, boolean>} [overrides]
 */
export function dakinisResolveTenantModules(business, overrides = {}) {
  const tier = dakinisNormalizeCommercialPlan(business?.plan);
  const industryDefaults = dakinisDefaultModulesForIndustry(business?.type);
  const planModules = new Set(dakinisListModulesForPlan(tier));

  const marketplace = Object.values(DAKINIS_MARKETPLACE_MODULES).map((m) => {
    const apiMod = m.apiModule || m.key;
    const planOk = dakinisPlanHasModule(tier, apiMod) || dakinisPlanHasModule(tier, m.key);
    const industryWants = industryDefaults.includes(m.key) || industryDefaults.includes(apiMod);
    const override =
      overrides[m.key] !== undefined
        ? overrides[m.key]
        : overrides[apiMod] !== undefined
          ? overrides[apiMod]
          : undefined;
    let enabled = planOk;
    if (override === false) enabled = false;
    if (override === true && planOk) enabled = true;
    if (!industryWants && override === undefined && !["crm", "whatsapp"].includes(m.key)) {
      enabled = enabled && industryDefaults.some((d) => d === m.key || d === apiMod);
    }
    return {
      key: m.key,
      label: m.label,
      description: m.description,
      minPlan: m.minPlan,
      enabled,
      planTier: tier,
      upgradeRequired: dakinisPlanRank(m.minPlan) > dakinisPlanRank(tier)
    };
  });

  const apiModules = dakinisListModulesForPlan(tier).map((key) => ({
    key,
    enabled: overrides[key] !== false,
    source: "plan"
  }));

  return { planTier: tier, apiModules, marketplace, industryDefaults };
}

export function dakinisGetMarketplaceCatalog() {
  return Object.values(DAKINIS_MARKETPLACE_MODULES);
}
