/** Módulos trackeados para Adoption Score y Business Value Score. */
export const DAKINIS_TELEMETRY_MODULES = Object.freeze([
  { key: "dashboard", label: "Dashboard", features: ["dashboard"] },
  {
    key: "crm",
    label: "CRM",
    features: ["crm"],
    valueEvents: ["crm.contact.created", "crm.deal.created", "crm.deal.won"],
    valueTargets: { contacts: 10, deals: 5, dealsWon: 2 }
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    features: ["whatsapp.inbox", "whatsapp.contacts", "whatsapp.templates", "whatsapp.automations", "whatsapp.ai"],
    valueEvents: ["whatsapp.message.sent"],
    valueTargets: { messagesSent: 30 }
  },
  {
    key: "copilot",
    label: "Copilot / IA",
    features: [],
    valueEvents: ["copilot.question", "intelligence.question"],
    valueTargets: { questions: 15 }
  },
  {
    key: "marketplace",
    label: "Marketplace",
    features: ["settings"],
    valueEvents: ["marketplace.module.installed"],
    valueTargets: { installs: 1 }
  },
  {
    key: "knowledge",
    label: "Knowledge Base",
    features: [],
    valueEvents: ["knowledge.doc.created"],
    valueTargets: { docs: 2 }
  },
  {
    key: "goals",
    label: "Objetivos",
    features: [],
    valueEvents: ["goals.goal.created"],
    valueTargets: { goals: 3 }
  },
  {
    key: "inventory",
    label: "Inventario",
    features: [],
    valueEvents: ["inventory.low_stock.alert"],
    valueTargets: { alerts: 1 }
  }
]);

function pct(count, target) {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.round((count / target) * 1000) / 10);
}

function clampScore(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Adoption Score: tiempo + frecuencia en pantalla (no mide valor de negocio).
 * @param {Array<{ feature: string, sessions: number, totalMinutes: number, bounceRatePct: number }>} byFeature
 */
export function dakinisComputeAdoptionScores(byFeature, periodDays = 30) {
  const featureMap = Object.fromEntries((byFeature || []).map((r) => [r.feature, r]));
  const sessionTarget = Math.max(5, Math.round(periodDays * 0.5));
  const minuteTarget = Math.max(10, Math.round(periodDays * 1.5));

  return DAKINIS_TELEMETRY_MODULES.map((mod) => {
    const rows = mod.features.map((f) => featureMap[f]).filter(Boolean);
    const sessions = rows.reduce((s, r) => s + (r.sessions || 0), 0);
    const totalMinutes = rows.reduce((s, r) => s + (r.totalMinutes || 0), 0);
    const bounceAvg =
      rows.length > 0 ? rows.reduce((s, r) => s + (r.bounceRatePct || 0), 0) / rows.length : 0;

    const sessionScore = pct(sessions, sessionTarget);
    const timeScore = pct(totalMinutes, minuteTarget);
    const retentionScore = clampScore(100 - bounceAvg);
    const score =
      mod.features.length === 0
        ? 0
        : clampScore(sessionScore * 0.45 + timeScore * 0.35 + retentionScore * 0.2);

    return {
      module: mod.key,
      label: mod.label,
      scorePct: score,
      sessions,
      totalMinutes,
      bounceRatePct: Math.round(bounceAvg * 10) / 10
    };
  }).sort((a, b) => b.scorePct - a.scorePct);
}

/**
 * Business Value Score: acciones que generan valor real.
 */
export function dakinisComputeBusinessValueScores(eventCounts = {}, periodDays = 30) {
  const scale = periodDays / 30;

  return DAKINIS_TELEMETRY_MODULES.map((mod) => {
    const targets = mod.valueTargets || {};
    const parts = [];

    if (mod.key === "crm") {
      parts.push(
        pct(eventCounts["crm.contact.created"] || 0, (targets.contacts || 10) * scale),
        pct(eventCounts["crm.deal.created"] || 0, (targets.deals || 5) * scale),
        pct(eventCounts["crm.deal.won"] || 0, (targets.dealsWon || 2) * scale)
      );
    } else if (mod.key === "whatsapp") {
      parts.push(pct(eventCounts["whatsapp.message.sent"] || 0, (targets.messagesSent || 30) * scale));
    } else if (mod.key === "copilot") {
      const q =
        (eventCounts["copilot.question"] || 0) + (eventCounts["intelligence.question"] || 0);
      parts.push(pct(q, (targets.questions || 15) * scale));
    } else if (mod.key === "marketplace") {
      parts.push(pct(eventCounts["marketplace.module.installed"] || 0, (targets.installs || 1) * scale));
    } else if (mod.key === "knowledge") {
      parts.push(pct(eventCounts["knowledge.doc.created"] || 0, (targets.docs || 2) * scale));
    } else if (mod.key === "goals") {
      parts.push(pct(eventCounts["goals.goal.created"] || 0, (targets.goals || 3) * scale));
    } else if (mod.key === "inventory") {
      parts.push(pct(eventCounts["inventory.low_stock.alert"] || 0, (targets.alerts || 1) * scale));
    } else if (mod.key === "dashboard") {
      parts.push(pct(eventCounts["finance.entry.created"] || 0, 5 * scale));
    }

    const scorePct = parts.length ? clampScore(parts.reduce((a, b) => a + b, 0) / parts.length) : 0;

    const metrics = {};
    for (const ev of mod.valueEvents || []) {
      if (eventCounts[ev]) metrics[ev] = eventCounts[ev];
    }

    return {
      module: mod.key,
      label: mod.label,
      scorePct,
      metrics
    };
  }).sort((a, b) => b.scorePct - a.scorePct);
}
