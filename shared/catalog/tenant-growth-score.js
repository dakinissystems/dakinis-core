/**
 * Growth Score comercial (0–100), separado del Health Score operativo.
 * @param {{ type?: string }} business
 * @param {{
 *   newContacts30d?: number,
 *   lostContacts30d?: number,
 *   reservations7d?: number,
 *   salesMonthDeltaPct?: number,
 *   whatsappCampaigns7d?: number,
 *   dealsWon30d?: number,
 *   dealsPipeline?: number
 * }} signals
 */
export function dakinisComputeGrowthScore(business, signals = {}) {
  const weights = {
    acquisition: 25,
    retention: 20,
    revenue: 25,
    pipeline: 15,
    engagement: 15
  };

  let score = 0;
  const factors = [];

  const newC = signals.newContacts30d ?? 0;
  const acq = Math.min(weights.acquisition, newC * 5);
  score += acq;
  factors.push({ key: "acquisition", label: `${newC} clientes nuevos (30 días)`, impact: acq });

  const lost = signals.lostContacts30d ?? 0;
  const ret = Math.max(0, weights.retention - lost * 4);
  score += ret;
  factors.push({ key: "retention", label: `${lost} clientes inactivos/pérdida`, impact: ret });

  const salesDelta = signals.salesMonthDeltaPct ?? 0;
  const rev = Math.min(weights.revenue, Math.max(0, 10 + salesDelta * 2));
  score += rev;
  factors.push({ key: "revenue", label: `Ventas ${salesDelta >= 0 ? "+" : ""}${salesDelta}% vs mes anterior`, impact: rev });

  const pipeline = signals.dealsPipeline ?? 0;
  const won = signals.dealsWon30d ?? 0;
  const pip = Math.min(weights.pipeline, pipeline * 2 + won * 5);
  score += pip;
  factors.push({ key: "pipeline", label: `${pipeline} deals en pipeline, ${won} cerrados`, impact: pip });

  const camp = signals.whatsappCampaigns7d ?? signals.reservations7d ?? 0;
  const eng = Math.min(weights.engagement, camp * 3);
  score += eng;
  factors.push({ key: "engagement", label: "Campañas / reservas recientes", impact: eng });

  const total = Math.round(Math.min(100, Math.max(0, score)));
  let status = "stagnant";
  if (total >= 75) status = "accelerating";
  else if (total >= 50) status = "growing";
  else if (total >= 30) status = "early";

  return {
    score: total,
    max: 100,
    status,
    statusLabel:
      {
        accelerating: "Crecimiento acelerado",
        growing: "En crecimiento",
        early: "Arranque comercial",
        stagnant: "Estancado"
      }[status] || status,
    factors,
    industry: business?.type || "general"
  };
}
