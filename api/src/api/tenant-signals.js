import { dakinisQueryAll, dakinisQueryOne } from "../db/query.js";
import { DAKINIS_ENTITY_BY_BUSINESS_TYPE } from "./contracts.js";

function dakinisParseRecordPayload(row) {
  try {
    return JSON.parse(row.payload);
  } catch {
    return null;
  }
}

function dakinisDaysAgoIso(days) {
  return new Date(Date.now() - days * 86400000).toISOString();
}

/**
 * @param {string} businessId
 * @param {string} businessType
 */
export async function dakinisGatherTenantSignals(businessId, businessType) {
  const entity = DAKINIS_ENTITY_BY_BUSINESS_TYPE[businessType];
  const records =
    entity && entity !== "_platform"
      ? await dakinisQueryAll(
          `SELECT payload, created_at FROM tenant_records WHERE business_id = ? AND entity = ?`,
          [businessId, entity]
        )
      : [];

  const weekAgo = dakinisDaysAgoIso(7);
  const activities7d = records.filter((r) => String(r.created_at) >= weekAgo).length;

  const stockAlertsRow = await dakinisQueryOne(
    `SELECT COUNT(*) AS c FROM tenant_supply_alerts WHERE business_id = ? AND severity IN ('warning', 'critical')`,
    [businessId]
  );
  const stockAlerts = Number(stockAlertsRow?.c) || 0;

  const lowStockRow = await dakinisQueryOne(
    `SELECT COUNT(*) AS c FROM tenant_stock_items WHERE business_id = ? AND quantity <= min_quantity`,
    [businessId]
  );
  const lowStock = Number(lowStockRow?.c) || 0;

  let openOrders = 0;
  if (businessType === "restaurante") {
    openOrders = records.filter((r) => {
      const p = dakinisParseRecordPayload(r);
      return p?.estado && !/cancel/i.test(String(p.estado));
    }).length;
  }

  const usersRow = await dakinisQueryOne(`SELECT COUNT(*) AS c FROM users WHERE business_id = ?`, [businessId]);
  const users = Number(usersRow?.c) || 1;

  const deliveriesRow = await dakinisQueryOne(
    `SELECT COUNT(*) AS c FROM tenant_supply_deliveries WHERE business_id = ?`,
    [businessId]
  );

  return {
    crmContacts: records.length,
    activities7d,
    reservations7d: activities7d,
    openOrders,
    stockAlerts: stockAlerts + lowStock,
    lowStock,
    supplyAlerts: stockAlerts,
    deliveries: Number(deliveriesRow?.c) || 0,
    users,
    onboardingCompleted: records.length > 0
  };
}
