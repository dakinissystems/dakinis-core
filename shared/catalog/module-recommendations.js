import { dakinisResolveTenantModules } from "./tenant-modules.js";
import { dakinisNormalizeCommercialPlan } from "./plan-modules.js";

/**
 * Recomendaciones de módulos / upgrade según industria, plan y uso.
 * @param {{ plan?: string, type?: string }} business
 * @param {Record<string, boolean>} overrides
 * @param {Record<string, { useCount?: number, lastUsedAt?: string }>} usage
 */
export function dakinisBuildModuleRecommendations(business, overrides = {}, usage = {}) {
  const modules = dakinisResolveTenantModules(business, overrides);
  const tier = dakinisNormalizeCommercialPlan(business?.plan);
  const recs = [];

  for (const m of modules.marketplace) {
    if (!m.enabled && !m.upgradeRequired) {
      recs.push({
        moduleKey: m.key,
        label: m.label,
        action: "enable",
        reason: `Recomendado para ${business?.type || "tu industria"}`,
        priority: "medium"
      });
    }
    if (m.upgradeRequired) {
      recs.push({
        moduleKey: m.key,
        label: m.label,
        action: "upgrade",
        upgradeTo: m.minPlan,
        reason: `Disponible en plan ${m.minPlan}`,
        priority: m.key === "whatsapp" || m.key === "crm" ? "high" : "medium"
      });
    }
  }

  const crmUse = usage.crm?.useCount ?? 0;
  const waUse = usage.whatsapp?.useCount ?? 0;

  if (tier === "starter" && crmUse === 0 && business?.type !== "platform") {
    recs.push({
      moduleKey: "crm",
      label: "CRM",
      action: "upgrade",
      upgradeTo: "growth",
      reason: "Centraliza clientes y activa embudo comercial",
      priority: "high"
    });
  }

  if (tier !== "pro" && (business?.type === "restaurante" || business?.type === "clinica") && waUse === 0) {
    recs.push({
      moduleKey: "whatsapp",
      label: "WhatsApp",
      action: "upgrade",
      upgradeTo: "pro",
      reason: "Automatiza confirmaciones y recordatorios",
      priority: "high"
    });
  }

  if ((usage.inventario?.useCount ?? 0) === 0 && ["restaurante", "retail", "distribuidor"].includes(business?.type)) {
    recs.push({
      moduleKey: "inventario",
      label: "Inventario",
      action: "enable",
      reason: "Tu industria depende del control de stock",
      priority: "medium"
    });
  }

  const seen = new Set();
  return recs
    .filter((r) => {
      const k = `${r.moduleKey}-${r.action}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => (a.priority === "high" ? -1 : 1) - (b.priority === "high" ? -1 : 1));
}
