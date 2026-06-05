import { randomUUID } from "node:crypto";
import { dakinisResolveDbDriver } from "../db/dialect.js";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun } from "../db/query.js";
import { dakinisSqlOrderCreatedAtDesc } from "../db/dialect.js";

function dakinisSqlSinceDays(days) {
  return dakinisResolveDbDriver() === "postgres"
    ? `now() - interval '${days} days'`
    : `datetime('now', '-${days} days')`;
}

function num(row) {
  const v = row?.n ?? row?.total;
  return typeof v === "number" ? v : Number(v) || 0;
}

export async function dakinisTrackModuleUsage(businessId, moduleKey) {
  try {
    const now = new Date().toISOString();
    await dakinisRun(
      `INSERT INTO tenant_module_usage (business_id, module_key, use_count, last_used_at)
       VALUES (?, ?, 1, ?)
       ON CONFLICT(business_id, module_key) DO UPDATE SET
         use_count = tenant_module_usage.use_count + 1,
         last_used_at = excluded.last_used_at`,
      [businessId, moduleKey, now]
    );
  } catch {
    /* tabla opcional */
  }
}

export async function dakinisLoadModuleUsageMap(businessId) {
  try {
    const rows = await dakinisQueryAll(
      `SELECT module_key, use_count, last_used_at FROM tenant_module_usage WHERE business_id = ?`,
      [businessId]
    );
    return Object.fromEntries(
      rows.map((r) => [r.module_key, { useCount: r.use_count, lastUsedAt: r.last_used_at }])
    );
  } catch {
    return {};
  }
}

export async function dakinisGatherGrowthSignals(businessId, baseSignals = {}) {
  const since30 = dakinisSqlSinceDays(30);
  const since7 = dakinisSqlSinceDays(7);

  const newContacts = await dakinisQueryOne(
    `SELECT COUNT(*) AS n FROM tenant_crm_contacts WHERE business_id = ? AND created_at >= ${since30}`,
    [businessId]
  ).catch(() => ({ n: 0 }));

  const dealsPipeline = await dakinisQueryOne(
    `SELECT COUNT(*) AS n FROM tenant_crm_deals WHERE business_id = ? AND stage NOT IN ('won', 'lost')`,
    [businessId]
  ).catch(() => ({ n: 0 }));

  const dealsWon = await dakinisQueryOne(
    `SELECT COUNT(*) AS n FROM tenant_crm_deals WHERE business_id = ? AND stage = 'won' AND updated_at >= ${since30}`,
    [businessId]
  ).catch(() => ({ n: 0 }));

  const incomeMonth = await dakinisQueryOne(
    `SELECT COALESCE(SUM(amount), 0) AS total FROM tenant_finance_entries
     WHERE business_id = ? AND entry_type = 'income' AND occurred_at >= ${since30}`,
    [businessId]
  ).catch(() => ({ total: 0 }));

  const incomePrev = await dakinisQueryOne(
    `SELECT COALESCE(SUM(amount), 0) AS total FROM tenant_finance_entries
     WHERE business_id = ? AND entry_type = 'income'
       AND occurred_at >= ${dakinisSqlSinceDays(60)} AND occurred_at < ${since30}`,
    [businessId]
  ).catch(() => ({ total: 0 }));

  const prev = num(incomePrev);
  const curr = num(incomeMonth);
  const salesMonthDeltaPct = prev > 0 ? Math.round(((curr - prev) / prev) * 1000) / 10 : curr > 0 ? 100 : 0;

  return {
    ...baseSignals,
    newContacts30d: num(newContacts),
    lostContacts30d: Math.max(0, (baseSignals.crmContacts || 0) - num(newContacts)),
    dealsPipeline: num(dealsPipeline),
    dealsWon30d: num(dealsWon),
    salesMonthDeltaPct,
    whatsappCampaigns7d: baseSignals.whatsappMessages7d ?? 0
  };
}

export async function dakinisListGoals(businessId) {
  const rows = await dakinisQueryAll(
    `SELECT * FROM tenant_goals WHERE business_id = ? ORDER BY period DESC, label ASC`,
    [businessId]
  ).catch(() => []);
  return rows.map(dakinisRowGoal);
}

function dakinisRowGoal(r) {
  const target = Number(r.target_value) || 0;
  const current = Number(r.current_value) || 0;
  const progressPct = target > 0 ? Math.min(100, Math.round((current / target) * 1000) / 10) : 0;
  return {
    id: r.id,
    goalKey: r.goal_key,
    label: r.label,
    targetValue: target,
    currentValue: current,
    unit: r.unit,
    period: r.period,
    periodStart: r.period_start,
    periodEnd: r.period_end,
    branchId: r.branch_id,
    progressPct,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

export async function dakinisUpsertGoal(businessId, input) {
  const id = input.id || `goal_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const now = new Date().toISOString();
  await dakinisRun(
    `INSERT INTO tenant_goals (id, business_id, branch_id, goal_key, label, target_value, current_value, unit, period, period_start, period_end, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       label = excluded.label,
       target_value = excluded.target_value,
       current_value = excluded.current_value,
       unit = excluded.unit,
       period = excluded.period,
       updated_at = excluded.updated_at`,
    [
      id,
      businessId,
      input.branchId || null,
      String(input.goalKey || input.key || "custom").trim(),
      String(input.label || "").trim(),
      Number(input.targetValue) || 0,
      Number(input.currentValue) || 0,
      String(input.unit || "").trim(),
      String(input.period || "monthly").trim(),
      input.periodStart || null,
      input.periodEnd || null,
      now,
      now
    ]
  );
  const row = await dakinisQueryOne("SELECT * FROM tenant_goals WHERE id = ?", [id]);
  return dakinisRowGoal(row);
}

export async function dakinisFinanceSummary(businessId) {
  const since30 = dakinisSqlSinceDays(30);
  const income = await dakinisQueryOne(
    `SELECT COALESCE(SUM(amount), 0) AS total FROM tenant_finance_entries
     WHERE business_id = ? AND entry_type = 'income' AND occurred_at >= ${since30}`,
    [businessId]
  ).catch(() => ({ total: 0 }));
  const expense = await dakinisQueryOne(
    `SELECT COALESCE(SUM(amount), 0) AS total FROM tenant_finance_entries
     WHERE business_id = ? AND entry_type = 'expense' AND occurred_at >= ${since30}`,
    [businessId]
  ).catch(() => ({ total: 0 }));
  const inc = num(income);
  const exp = num(expense);
  const margin = inc - exp;
  const marginPct = inc > 0 ? Math.round((margin / inc) * 1000) / 10 : 0;
  return {
    periodDays: 30,
    income: inc,
    expenses: exp,
    margin,
    marginPct,
    profit: margin,
    currency: "EUR"
  };
}

export async function dakinisListFinanceEntries(businessId, limit = 50) {
  const rows = await dakinisQueryAll(
    `SELECT * FROM tenant_finance_entries WHERE business_id = ?
     ORDER BY ${dakinisSqlOrderCreatedAtDesc("occurred_at")} LIMIT ?`,
    [businessId, limit]
  ).catch(() => []);
  return rows.map((r) => ({
    id: r.id,
    entryType: r.entry_type,
    category: r.category,
    amount: r.amount,
    currency: r.currency,
    notes: r.notes,
    occurredAt: r.occurred_at,
    branchId: r.branch_id
  }));
}

export async function dakinisCreateFinanceEntry(businessId, input) {
  const id = `fin_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const type = input.entryType === "expense" ? "expense" : "income";
  await dakinisRun(
    `INSERT INTO tenant_finance_entries (id, business_id, branch_id, entry_type, category, amount, currency, notes, occurred_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      businessId,
      input.branchId || null,
      type,
      String(input.category || "").trim(),
      Number(input.amount) || 0,
      String(input.currency || "EUR").trim(),
      String(input.notes || "").trim(),
      input.occurredAt || new Date().toISOString()
    ]
  );
  return (await dakinisListFinanceEntries(businessId, 1))[0];
}

export async function dakinisListKnowledgeDocs(businessId, q = "") {
  const rows = await dakinisQueryAll(
    `SELECT * FROM tenant_knowledge_docs WHERE business_id = ? ORDER BY updated_at DESC`,
    [businessId]
  ).catch(() => []);
  const query = String(q).trim().toLowerCase();
  return rows
    .filter((r) => {
      if (!query) return true;
      return (
        String(r.title).toLowerCase().includes(query) ||
        String(r.content_text).toLowerCase().includes(query)
      );
    })
    .map((r) => ({
      id: r.id,
      title: r.title,
      docKind: r.doc_kind,
      contentPreview: String(r.content_text || "").slice(0, 240),
      tags: safeJsonArray(r.tags_json),
      updatedAt: r.updated_at
    }));
}

function safeJsonArray(raw) {
  try {
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

export async function dakinisGetKnowledgeDoc(businessId, docId) {
  const row = await dakinisQueryOne(
    `SELECT * FROM tenant_knowledge_docs WHERE business_id = ? AND id = ?`,
    [businessId, docId]
  );
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    docKind: row.doc_kind,
    contentText: row.content_text,
    tags: safeJsonArray(row.tags_json),
    updatedAt: row.updated_at
  };
}

export async function dakinisUpsertKnowledgeDoc(businessId, input) {
  const id = input.id || `kb_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const now = new Date().toISOString();
  const contentText = String(input.contentText || input.extractedText || "").trim();
  const docKind = String(input.docKind || "process").trim();
  await dakinisRun(
    `INSERT INTO tenant_knowledge_docs (id, business_id, title, doc_kind, content_text, tags_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title,
       doc_kind = excluded.doc_kind,
       content_text = excluded.content_text,
       tags_json = excluded.tags_json,
       updated_at = excluded.updated_at`,
    [
      id,
      businessId,
      String(input.title || "").trim(),
      docKind,
      contentText,
      JSON.stringify(input.tags || []),
      now,
      now
    ]
  );
  const { dakinisIndexKnowledgeDoc } = await import("./bos-store.js");
  if (contentText) await dakinisIndexKnowledgeDoc(businessId, id, contentText);
  return dakinisGetKnowledgeDoc(businessId, id);
}

export async function dakinisSearchKnowledgeContext(businessId, query, limit = 3) {
  const docs = await dakinisListKnowledgeDocs(businessId, query);
  return docs.slice(0, limit);
}
