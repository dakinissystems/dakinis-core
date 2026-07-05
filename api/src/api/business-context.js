import { dakinisQueryOne } from "../db/query.js";

function dakinisMapBusinessRow(row) {
  if (!row) return null;
  return {
    ...row,
    access_state: row.access_state || "active",
    access_reason: row.access_reason || null,
    entitled_plan: row.entitled_plan || null,
  };
}

async function dakinisQueryBusinessWithAccess(whereSql, params) {
  return dakinisQueryOne(
    `SELECT b.*,
            ts.access_state,
            ts.access_reason,
            ts.entitled_plan,
            ts.status AS subscription_status
       FROM business b
       LEFT JOIN tenant_subscriptions ts ON ts.business_id = b.id
      WHERE ${whereSql}`,
    params
  );
}

export async function dakinisResolveBusinessFromHeader(businessIdHeader) {
  if (businessIdHeader === undefined || businessIdHeader === null) return null;
  const raw = String(businessIdHeader).trim();
  if (!raw) return null;

  const byId = dakinisMapBusinessRow(await dakinisQueryBusinessWithAccess("b.id = ?", [raw]));
  if (byId) return byId;

  return dakinisMapBusinessRow(
    await dakinisQueryBusinessWithAccess("lower(b.slug) = lower(?)", [raw])
  );
}
