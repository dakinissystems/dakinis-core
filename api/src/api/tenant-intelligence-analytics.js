import { dakinisQueryAll } from "../db/query.js";
import { dakinisSqlOrderCreatedAtDesc } from "../db/dialect.js";
import { DAKINIS_ENTITY_BY_BUSINESS_TYPE } from "./contracts.js";
import { dakinisDemoInventoryLots } from "@dakinis/shared/catalog/inventory-lots.js";

function dakinisParseRecordPayload(row) {
  try {
    return JSON.parse(row.payload);
  } catch {
    return null;
  }
}

function dakinisRecordName(payload) {
  return (
    payload?.nombre ||
    payload?.cliente ||
    payload?.name ||
    payload?.propiedad ||
    "Sin nombre"
  );
}

function dakinisRecordActivityTs(payload, createdAt) {
  const dateStr = payload?.fecha || payload?.lastVisit || payload?.hora || createdAt;
  const ts = Date.parse(String(dateStr));
  if (!Number.isNaN(ts)) return ts;
  const createdTs = Date.parse(String(createdAt));
  return Number.isNaN(createdTs) ? 0 : createdTs;
}

/**
 * @param {string} businessId
 * @param {string} businessType
 * @param {{ daysInactive?: number }} opts
 */
export async function dakinisAnalyticsInactiveCrm(businessId, businessType, opts = {}) {
  const daysInactive = Math.max(7, Math.min(365, Number(opts.daysInactive) || 30));
  const entity = DAKINIS_ENTITY_BY_BUSINESS_TYPE[businessType];
  if (!entity || entity === "_platform") {
    return { inactive: [], total: 0, daysInactive, entity: null };
  }

  const rows = await dakinisQueryAll(
    `SELECT id, payload, created_at FROM tenant_records WHERE business_id = ? AND entity = ? ORDER BY ${dakinisSqlOrderCreatedAtDesc("created_at")}`,
    [businessId, entity]
  );

  const cutoff = Date.now() - daysInactive * 86400000;
  const inactive = [];

  for (const row of rows) {
    const payload = dakinisParseRecordPayload(row);
    if (!payload) continue;
    const ts = dakinisRecordActivityTs(payload, row.created_at);
    if (ts > 0 && ts < cutoff) {
      inactive.push({
        id: payload.id || row.id,
        name: dakinisRecordName(payload),
        lastActivity: payload.fecha || payload.lastVisit || row.created_at,
        daysSince: Math.floor((Date.now() - ts) / 86400000),
        stage: payload.etapa || payload.estado || null
      });
    }
  }

  inactive.sort((a, b) => b.daysSince - a.daysSince);

  return {
    inactive: inactive.slice(0, 20),
    total: inactive.length,
    daysInactive,
    entity
  };
}

/**
 * @param {string} businessId
 */
export async function dakinisAnalyticsSupplierOverview(businessId) {
  const deliveries = await dakinisQueryAll(
    `SELECT supplier, arrival_window, contents, status, created_at
       FROM tenant_supply_deliveries
       WHERE business_id = ?
       ORDER BY ${dakinisSqlOrderCreatedAtDesc("created_at")}`,
    [businessId]
  );

  const alerts = await dakinisQueryAll(
    `SELECT title, product_ref, condition_text, severity, created_at
       FROM tenant_supply_alerts
       WHERE business_id = ?
       ORDER BY ${dakinisSqlOrderCreatedAtDesc("created_at")}`,
    [businessId]
  );

  /** @type {Record<string, { supplier: string, deliveries: number, pending: number, nextArrival: string|null }>} */
  const bySupplier = {};

  for (const d of deliveries) {
    if (!bySupplier[d.supplier]) {
      bySupplier[d.supplier] = {
        supplier: d.supplier,
        deliveries: 0,
        pending: 0,
        nextArrival: d.arrival_window
      };
    }
    bySupplier[d.supplier].deliveries += 1;
    if (!/confirm|recurrent|activo/i.test(String(d.status))) {
      bySupplier[d.supplier].pending += 1;
    }
  }

  const criticalAlerts = alerts.filter((a) => a.severity === "critical" || a.severity === "warning");

  return {
    suppliers: Object.values(bySupplier),
    alerts: alerts.slice(0, 15).map((a) => ({
      title: a.title,
      productRef: a.product_ref,
      condition: a.condition_text,
      severity: a.severity
    })),
    alertCount: alerts.length,
    criticalAlertCount: criticalAlerts.length,
    deliveryCount: deliveries.length
  };
}

/**
 * @param {string} businessId
 */
export async function dakinisAnalyticsSlowProducts(businessId) {
  const lowStock = await dakinisQueryAll(
    `SELECT slug, name, quantity, min_quantity AS minQuantity, unit
       FROM tenant_stock_items
       WHERE business_id = ? AND quantity <= min_quantity
       ORDER BY quantity ASC
       LIMIT 20`,
    [businessId]
  );

  const movementRows = await dakinisQueryAll(
    `SELECT sm.delta, sm.created_at, si.slug, si.name
       FROM tenant_stock_movements sm
       JOIN tenant_stock_items si ON si.id = sm.stock_item_id
       WHERE sm.business_id = ?`,
    [businessId]
  );

  const monthAgo = Date.now() - 30 * 86400000;
  /** @type {Record<string, { slug: string, name: string, netDelta: number }>} */
  const netBySlug = {};

  for (const row of movementRows) {
    const ts = Date.parse(String(row.created_at));
    if (Number.isNaN(ts) || ts < monthAgo) continue;
    const key = row.slug;
    if (!netBySlug[key]) {
      netBySlug[key] = { slug: row.slug, name: row.name, netDelta: 0 };
    }
    netBySlug[key].netDelta += Number(row.delta) || 0;
  }

  const slowRotation = Object.values(netBySlug)
    .filter((r) => r.netDelta < 0)
    .sort((a, b) => a.netDelta - b.netDelta)
    .slice(0, 15);

  const supplyAlerts = await dakinisQueryAll(
    `SELECT title, product_ref, condition_text, severity
       FROM tenant_supply_alerts
       WHERE business_id = ? AND severity IN ('warning', 'critical')
       ORDER BY ${dakinisSqlOrderCreatedAtDesc("created_at")}
       LIMIT 10`,
    [businessId]
  );

  return {
    lowStock,
    slowRotation,
    supplyAlerts: supplyAlerts.map((a) => ({
      title: a.title,
      productRef: a.product_ref,
      condition: a.condition_text,
      severity: a.severity
    })),
    catalog: await dakinisQueryAll(
      `SELECT slug, name, quantity, min_quantity AS minQuantity, unit
         FROM tenant_stock_items
         WHERE business_id = ?
         ORDER BY name ASC
         LIMIT 40`,
      [businessId]
    )
  };
}

/**
 * Lotes próximos a caducar (demo restaurante + alertas de caducidad en BD).
 * @param {string} businessId
 * @param {string} businessType
 * @param {{ withinDays?: number }} opts
 */
export async function dakinisAnalyticsExpiringLots(businessId, businessType, opts = {}) {
  const withinDays = Math.max(1, Math.min(90, Number(opts.withinDays) || 14));
  const now = new Date();

  const expiryAlerts = await dakinisQueryAll(
    `SELECT title, product_ref, condition_text, severity
       FROM tenant_supply_alerts
       WHERE business_id = ?
         AND (
           LOWER(title) LIKE '%caduc%' OR LOWER(title) LIKE '%expir%' OR LOWER(title) LIKE '%venc%'
           OR LOWER(condition_text) LIKE '%caduc%' OR LOWER(condition_text) LIKE '%expir%'
           OR LOWER(condition_text) LIKE '%venc%'
         )
       ORDER BY ${dakinisSqlOrderCreatedAtDesc("created_at")}
       LIMIT 10`,
    [businessId]
  );

  let lots = [];
  if (String(businessType).toLowerCase() === "restaurante") {
    lots = dakinisDemoInventoryLots(now)
      .filter((lot) => {
        const days = lot.daysUntilExpiry;
        return days !== null && days <= withinDays;
      })
      .sort((a, b) => (a.daysUntilExpiry ?? 999) - (b.daysUntilExpiry ?? 999));
  }

  const allDemo = String(businessType).toLowerCase() === "restaurante" ? dakinisDemoInventoryLots(now) : [];
  const expiredCount = allDemo.filter((l) => (l.daysUntilExpiry ?? 1) < 0).length;
  const criticalCount = lots.filter((l) => l.expirySeverity === "critical" || l.expirySeverity === "expired").length;
  const warningCount = lots.filter((l) => l.expirySeverity === "warning").length;

  return {
    withinDays,
    lots,
    expiredCount,
    criticalCount,
    warningCount,
    supplyAlerts: expiryAlerts.map((a) => ({
      title: a.title,
      productRef: a.product_ref,
      condition: a.condition_text,
      severity: a.severity
    })),
    hasLotTracking: String(businessType).toLowerCase() === "restaurante"
  };
}
