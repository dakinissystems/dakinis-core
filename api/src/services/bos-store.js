import { createHash, randomUUID } from "node:crypto";
import { dakinisResolveDbDriver, dakinisSqlTimestampNow } from "../db/dialect.js";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun } from "../db/query.js";
import {
  dakinisComputeCommercialMonthlyInvoice,
  dakinisEstimateAiCostEur,
  dakinisEstimateHeuristicQueryCostEur,
  DAKINIS_IMPLEMENTATION_TIERS_EUR,
  DAKINIS_PROFESSIONAL_SERVICES,
  DAKINIS_PROJECT_PACKS,
  DAKINIS_WHATSAPP_COST_PER_MESSAGE_EUR
} from "@dakinis/shared/catalog/bos-pricing.js";
import { dakinisNormalizeCommercialPlan } from "@dakinis/shared/catalog/plan-modules.js";
import { dakinisUpsertModuleOverrides } from "./tenant-intelligence-store.js";
import { dakinisEmitFeatureEvent } from "./telemetry-store.js";

function dakinisSqlSinceDays(days) {
  return dakinisResolveDbDriver() === "postgres"
    ? `now() - interval '${days} days'`
    : `datetime('now', '-${days} days')`;
}

function num(v) {
  return typeof v === "number" ? v : Number(v) || 0;
}

export async function dakinisEnsureSubscriptionRow(business) {
  try {
    const existing = await dakinisQueryOne(
      `SELECT * FROM tenant_subscriptions WHERE business_id = ?`,
      [business.id]
    );
    if (existing) return existing;
    const plan = dakinisNormalizeCommercialPlan(business.plan);
    await dakinisRun(
      `INSERT INTO tenant_subscriptions (business_id, plan, status) VALUES (?, ?, 'active')`,
      [business.id, plan]
    );
    return dakinisQueryOne(`SELECT * FROM tenant_subscriptions WHERE business_id = ?`, [business.id]);
  } catch {
    return null;
  }
}

export async function dakinisRecordUsage(businessId, metricKey, quantity, unit = "count") {
  try {
    const id = `usg_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
    await dakinisRun(
      `INSERT INTO tenant_usage (id, business_id, metric_key, quantity, unit) VALUES (?, ?, ?, ?, ?)`,
      [businessId, metricKey, quantity, unit]
    );
  } catch {
    /* optional table */
  }
}

export async function dakinisLogAiUsage(businessId, { mode, question, tokensIn = 0, tokensOut = 0 }) {
  const cost =
    mode === "llm"
      ? dakinisEstimateAiCostEur(tokensIn, tokensOut)
      : dakinisEstimateHeuristicQueryCostEur();
  const qHash = question
    ? createHash("sha256").update(String(question).trim()).digest("hex").slice(0, 16)
    : "";
  try {
    const id = `aiu_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
    await dakinisRun(
      `INSERT INTO tenant_ai_usage_log (id, business_id, mode, question_hash, tokens_in, tokens_out, cost_eur)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [businessId, mode, qHash, tokensIn, tokensOut, cost]
    );
    await dakinisRecordUsage(businessId, "ai_queries", 1);
    await dakinisRecordUsage(businessId, "ai_tokens", tokensIn + tokensOut, "tokens");
    await dakinisRecordUsage(businessId, "ai_cost_eur", cost, "eur");
    return { id, costEur: cost };
  } catch {
    return { costEur: cost };
  }
}

export async function dakinisGetAiUsageSummary(businessId, days = 30) {
  const since = dakinisSqlSinceDays(days);
  try {
    const queries = await dakinisQueryOne(
      `SELECT COUNT(*) AS n, COALESCE(SUM(tokens_in), 0) AS ti, COALESCE(SUM(tokens_out), 0) AS tout,
              COALESCE(SUM(cost_eur), 0) AS cost
       FROM tenant_ai_usage_log WHERE business_id = ? AND created_at >= ${since}`,
      [businessId]
    );
    return {
      periodDays: days,
      queries: num(queries?.n),
      tokensIn: num(queries?.ti),
      tokensOut: num(queries?.tout),
      tokensTotal: num(queries?.ti) + num(queries?.tout),
      costEur: Math.round(num(queries?.cost) * 100) / 100,
      label: "GPT / Dakinis Intelligence"
    };
  } catch {
    return { periodDays: days, queries: 0, tokensTotal: 0, costEur: 0 };
  }
}

export async function dakinisGetBillingSummary(business) {
  const sub = await dakinisEnsureSubscriptionRow(business);
  const plan = dakinisNormalizeCommercialPlan(business.plan);
  const ai = await dakinisGetAiUsageSummary(business.id, 30);
  const since30 = dakinisSqlSinceDays(30);

  let waMessages = 0;
  try {
    const wa = await dakinisQueryOne(
      `SELECT COUNT(*) AS n FROM tenant_whatsapp_messages WHERE business_id = ? AND created_at >= ${since30}`,
      [business.id]
    );
    waMessages = num(wa?.n);
  } catch {
    waMessages = 0;
  }

  const operatorWaCost =
    Math.round(waMessages * DAKINIS_WHATSAPP_COST_PER_MESSAGE_EUR * 100) / 100;
  const commercial = dakinisComputeCommercialMonthlyInvoice(plan, {
    aiQueries: ai.queries,
    whatsappMessages: waMessages
  });

  return {
    stripeConnected: Boolean(sub?.stripe_customer_id),
    commercialModel: "hybrid",
    subscription: sub
      ? {
          plan: sub.plan,
          status: sub.status,
          periodStart: sub.current_period_start,
          periodEnd: sub.current_period_end
        }
      : { plan, status: "active" },
    usage: {
      ai,
      whatsapp: {
        messages30d: waMessages,
        operatorCostEur: operatorWaCost
      },
      commercial
    },
    professionalServices: {
      implementationTiers: DAKINIS_IMPLEMENTATION_TIERS_EUR,
      projectPacks: DAKINIS_PROJECT_PACKS,
      services: DAKINIS_PROFESSIONAL_SERVICES
    },
    nextInvoiceEstimate: {
      currency: "EUR",
      amount: commercial.totalEur,
      lineItems: commercial.lineItems,
      note: commercial.overage.aiEur || commercial.overage.whatsappEur
        ? "Plan base + exceso consumo (IA/WhatsApp)"
        : "Solo plan base (dentro de cuotas incluidas)",
      stripeConnected: false
    }
  };
}

export async function dakinisCreatePendingAction(businessId, { actionType, label, payload }) {
  const id = `pact_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
  await dakinisRun(
    `INSERT INTO tenant_pending_actions (id, business_id, action_type, label, payload_json, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    [businessId, actionType, label, JSON.stringify(payload || {})]
  );
  return id;
}

export async function dakinisGetPendingAction(businessId, actionId) {
  return dakinisQueryOne(
    `SELECT * FROM tenant_pending_actions WHERE business_id = ? AND id = ?`,
    [businessId, actionId]
  );
}

export async function dakinisExecutePendingAction(business, actionRow) {
  let payload = {};
  try {
    payload = JSON.parse(actionRow.payload_json || "{}");
  } catch {
    payload = {};
  }

  if (actionRow.action_type === "whatsapp_campaign") {
    await dakinisRecordUsage(business.id, "whatsapp_campaign_prepared", payload.contactCount || 0);
    return {
      executed: true,
      message: `Campaña preparada para ${payload.contactCount || 0} contactos. Usa /app/whatsapp para enviar.`,
      payload
    };
  }

  if (actionRow.action_type === "stock_reorder") {
    return {
      executed: true,
      message: `Sugerencia de compra: ${payload.quantity || 0} uds de ${payload.itemSlug || "insumo"}.`,
      payload
    };
  }

  if (actionRow.action_type === "crm_followup") {
    return {
      executed: true,
      message: `Lista de ${payload.contactCount || 0} contactos marcada para seguimiento en CRM.`,
      payload
    };
  }

  return { executed: false, message: "Tipo de acción no implementado", payload };
}

export async function dakinisMarketplaceInstallModule(businessId, moduleKey) {
  const overrides = await dakinisUpsertModuleOverrides(businessId, { [moduleKey]: true });
  await dakinisRecordUsage(businessId, "marketplace_install", 1);
  dakinisEmitFeatureEvent(businessId, null, "marketplace.module.installed", { moduleKey });
  return overrides;
}

export async function dakinisComputeRealSectorBenchmark(industryType) {
  const type = String(industryType || "").toLowerCase();
  if (!type) return null;

  try {
    const bizRows = await dakinisQueryAll(
      `SELECT id FROM business WHERE lower(type) = lower(?) AND lower(type) != 'platform'`,
      [type]
    );
    const sampleSize = bizRows.length;
    if (sampleSize === 0) return { sampleSize: 0, metrics: {} };

    const ids = bizRows.map((b) => b.id);
    const placeholders = ids.map(() => "?").join(",");
    let totalContacts = 0;
    let totalActivities = 0;
    let totalWa = 0;

    try {
      const c = await dakinisQueryOne(
        `SELECT COUNT(*) AS n FROM tenant_crm_contacts WHERE business_id IN (${placeholders})`,
        ids
      );
      totalContacts = num(c?.n);
    } catch {
      /* */
    }

    const since30 = dakinisSqlSinceDays(30);
    try {
      const a = await dakinisQueryOne(
        `SELECT COUNT(*) AS n FROM tenant_crm_activities a
         JOIN tenant_crm_contacts c ON c.id = a.contact_id
         WHERE c.business_id IN (${placeholders}) AND a.created_at >= ${since30}`,
        ids
      );
      totalActivities = num(a?.n);
    } catch {
      /* */
    }

    try {
      const w = await dakinisQueryOne(
        `SELECT COUNT(*) AS n FROM tenant_whatsapp_messages
         WHERE business_id IN (${placeholders}) AND created_at >= ${since30}`,
        ids
      );
      totalWa = num(w?.n);
    } catch {
      /* */
    }

    const metrics = {
      crm_contacts_avg: Math.round((totalContacts / sampleSize) * 10) / 10,
      activities_30d_avg: Math.round((totalActivities / sampleSize) * 10) / 10,
      whatsapp_messages_30d_avg: Math.round((totalWa / sampleSize) * 10) / 10
    };

    return {
      industry: type,
      sampleSize,
      source: "dakinis_network_anonymized",
      metrics,
      updatedAt: new Date().toISOString()
    };
  } catch {
    return null;
  }
}

export async function dakinisGetPortalSettings(businessId) {
  const row = await dakinisQueryOne(`SELECT * FROM tenant_portal_settings WHERE business_id = ?`, [
    businessId
  ]).catch(() => null);
  if (!row) {
    return { enabled: false, subdomain: "", features: [], welcomeText: "" };
  }
  let features = [];
  try {
    features = JSON.parse(row.features_json || "[]");
  } catch {
    features = [];
  }
  return {
    enabled: row.enabled === true || row.enabled === 1,
    subdomain: row.subdomain || "",
    features,
    welcomeText: row.welcome_text || "",
    publicPath: row.subdomain ? `/portal/${row.subdomain}` : `/portal/${businessId}`
  };
}

export async function dakinisUpsertPortalSettings(businessId, input) {
  const enabled = Boolean(input.enabled);
  const subdomain = String(input.subdomain || "").trim().toLowerCase();
  const features = Array.isArray(input.features) ? input.features : [];
  const welcomeText = String(input.welcomeText || "").trim();
  const ts = dakinisSqlTimestampNow();
  const enabledVal = dakinisResolveDbDriver() === "postgres" ? enabled : enabled ? 1 : 0;
  await dakinisRun(
    `INSERT INTO tenant_portal_settings (business_id, enabled, subdomain, features_json, welcome_text, updated_at)
     VALUES (?, ?, ?, ?, ?, ${ts})
     ON CONFLICT(business_id) DO UPDATE SET
       enabled = excluded.enabled,
       subdomain = excluded.subdomain,
       features_json = excluded.features_json,
       welcome_text = excluded.welcome_text,
       updated_at = ${ts}`,
    [businessId, enabledVal, subdomain, JSON.stringify(features), welcomeText]
  );
  return dakinisGetPortalSettings(businessId);
}

export async function dakinisResolvePortalByKey(key) {
  const k = String(key || "").trim().toLowerCase();
  const biz = await dakinisQueryOne(
    `SELECT b.id, b.slug, b.name, b.type, p.enabled, p.subdomain, p.features_json, p.welcome_text
     FROM business b
     LEFT JOIN tenant_portal_settings p ON p.business_id = b.id
     WHERE lower(b.slug) = ? OR lower(p.subdomain) = ? OR b.id = ?`,
    [k, k, k]
  );
  if (!biz || !(biz.enabled === true || biz.enabled === 1)) return null;
  let features = [];
  try {
    features = JSON.parse(biz.features_json || "[]");
  } catch {
    features = [];
  }
  return {
    businessId: biz.id,
    slug: biz.slug,
    name: biz.name,
    type: biz.type,
    welcomeText: biz.welcome_text || `Bienvenido a ${biz.name}`,
    features: features.length ? features : ["reservas", "contacto"]
  };
}

export async function dakinisCreateNetworkOrder(fromBusinessId, input) {
  const toId = String(input.toBusinessId || "").trim();
  const target = await dakinisQueryOne(`SELECT id FROM business WHERE id = ? OR slug = ?`, [toId, toId]);
  if (!target) throw Object.assign(new Error("Destino no encontrado"), { code: "NOT_FOUND" });

  const id = `nord_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const lines = Array.isArray(input.lines) ? input.lines : [];
  await dakinisRun(
    `INSERT INTO tenant_network_orders (id, from_business_id, to_business_id, link_id, status, lines_json, notes)
     VALUES (?, ?, ?, ?, 'sent', ?, ?)`,
    [
      id,
      fromBusinessId,
      target.id,
      input.linkId || null,
      JSON.stringify(lines),
      String(input.notes || "").trim()
    ]
  );
  return dakinisQueryOne(`SELECT * FROM tenant_network_orders WHERE id = ?`, [id]);
}

export async function dakinisListNetworkOrders(businessId) {
  const rows = await dakinisQueryAll(
    `SELECT * FROM tenant_network_orders
     WHERE from_business_id = ? OR to_business_id = ?
     ORDER BY created_at DESC LIMIT 50`,
    [businessId, businessId]
  ).catch(() => []);
  return rows.map((r) => ({
    id: r.id,
    fromBusinessId: r.from_business_id,
    toBusinessId: r.to_business_id,
    status: r.status,
    lines: safeJson(r.lines_json),
    notes: r.notes,
    createdAt: r.created_at
  }));
}

function safeJson(raw) {
  try {
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

export function dakinisChunkText(text, chunkSize = 800) {
  const t = String(text || "").trim();
  if (!t) return [];
  const chunks = [];
  for (let i = 0; i < t.length; i += chunkSize) {
    chunks.push(t.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function dakinisIndexKnowledgeDoc(businessId, docId, contentText) {
  await dakinisRun(`DELETE FROM tenant_knowledge_chunks WHERE doc_id = ?`, [docId]);
  const chunks = dakinisChunkText(contentText);
  for (let i = 0; i < chunks.length; i++) {
    const id = `chk_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
    await dakinisRun(
      `INSERT INTO tenant_knowledge_chunks (id, business_id, doc_id, chunk_index, content_text)
       VALUES (?, ?, ?, ?, ?)`,
      [id, businessId, docId, i, chunks[i]]
    );
  }
  return chunks.length;
}

export async function dakinisSearchKnowledgeChunks(businessId, query, limit = 5) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return [];
  const rows = await dakinisQueryAll(
    `SELECT c.id, c.doc_id, c.chunk_index, c.content_text, d.title
     FROM tenant_knowledge_chunks c
     JOIN tenant_knowledge_docs d ON d.id = c.doc_id
     WHERE c.business_id = ?`,
    [businessId]
  ).catch(() => []);
  return rows
    .filter((r) => String(r.content_text).toLowerCase().includes(q) || String(r.title).toLowerCase().includes(q))
    .slice(0, limit)
    .map((r) => ({
      id: r.id,
      docId: r.doc_id,
      title: r.title,
      chunkIndex: r.chunk_index,
      excerpt: String(r.content_text).slice(0, 320)
    }));
}
