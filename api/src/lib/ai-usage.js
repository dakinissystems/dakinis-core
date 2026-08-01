import { DAKINIS_PLAN_INCLUDED_AI_QUERIES } from "@dakinis/shared/catalog/bos-pricing.js";
import { dakinisNormalizeCommercialPlan } from "@dakinis/shared/catalog/plan-modules.js";
import { dakinisQueryOne, dakinisRun, dakinisQueryAll } from "../db/query.js";
import { randomUUID } from "node:crypto";

function dakinisCurrentYearMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function dakinisAiUsageCount(businessId, usageType = "advisor", yearMonth = dakinisCurrentYearMonth()) {
  try {
    const row = await dakinisQueryOne(
      `SELECT COUNT(*) AS c FROM ai_usage WHERE business_id = ? AND usage_type = ? AND year_month = ?`,
      [businessId, usageType, yearMonth]
    );
    return Number(row?.c) || 0;
  } catch (err) {
    // Prod gap: table missing until migration 055_core_ai_usage.sql is applied.
    const msg = String(err?.message || err || "");
    if (/ai_usage/i.test(msg) && /does not exist|no such table/i.test(msg)) {
      console.warn("[ai-usage] table missing — apply docs/supabase/migrations/055_core_ai_usage.sql");
      return 0;
    }
    throw err;
  }
}

export function dakinisAiMonthlyLimit(plan) {
  const tier = dakinisNormalizeCommercialPlan(plan);
  return DAKINIS_PLAN_INCLUDED_AI_QUERIES[tier] ?? 0;
}

export async function dakinisAiUsageSnapshot(businessId, plan) {
  const yearMonth = dakinisCurrentYearMonth();
  const used = await dakinisAiUsageCount(businessId, "advisor", yearMonth);
  const limit = dakinisAiMonthlyLimit(plan);
  return {
    yearMonth,
    advisor: {
      used,
      limit,
      remaining: Math.max(0, limit - used)
    },
    aiQueries: used,
    includedAiQueries: limit,
    remainingAiQueries: Math.max(0, limit - used)
  };
}

export async function dakinisAiAssertQuota(businessId, plan) {
  const limit = dakinisAiMonthlyLimit(plan);
  if (limit <= 0) {
    return { ok: false, error: "plan_upgrade_required", feature: "ai_advisor", upgradeTo: "pro" };
  }
  const used = await dakinisAiUsageCount(businessId, "advisor");
  if (used >= limit) {
    return { ok: false, error: "ai_quota_exceeded", limit, used };
  }
  return { ok: true, remaining: limit - used - 1 };
}

export async function dakinisAiRecordUsage(businessId, userId, usageType = "advisor") {
  const id = `aiu_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  await dakinisRun(
    `INSERT INTO ai_usage (id, business_id, user_id, usage_type, year_month) VALUES (?, ?, ?, ?, ?)`,
    [id, businessId, userId || null, usageType, dakinisCurrentYearMonth()]
  );
}

/**
 * @param {string} businessId
 * @param {number} days
 */
export async function dakinisAiUsageHistory(businessId, days = 30) {
  const rows = await dakinisQueryAll(
    `SELECT usage_type, year_month, COUNT(*) AS c
       FROM ai_usage
       WHERE business_id = ?
       GROUP BY usage_type, year_month
       ORDER BY year_month DESC`,
    [businessId]
  );
  const total = rows.reduce((s, r) => s + Number(r.c), 0);
  return { days, total, byTypeMonth: rows.map((r) => ({ type: r.usage_type, month: r.year_month, count: Number(r.c) })) };
}
