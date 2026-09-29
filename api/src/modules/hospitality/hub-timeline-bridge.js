/**
 * Hospitality → Hub Mi día: map domain events to hub.timeline via Internal POST /events.
 * ADR-014 in-process bus → platform timeline (sale.*, order.*, stock.low).
 */

import { dakinisQueryAll, dakinisQueryOne } from "../../db/query.js";
import {
  dakinisInternalConfigured,
  dakinisInternalRequest,
} from "../../lib/internal-client.js";
import {
  DAKINIS_HOSPITALITY_EVENTS,
  dakinisHospitalityOn,
} from "./events.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const PENDING_STATUSES = new Set(["nueva", "cocina", "lista", "pending", "open"]);

async function resolvePlatformUserIds(businessId) {
  if (!businessId) return [];
  try {
    const rows = await dakinisQueryAll(
      `SELECT platform_user_id AS id FROM users
       WHERE business_id = ? AND platform_user_id IS NOT NULL AND trim(platform_user_id) <> ''`,
      [businessId]
    );
    return [
      ...new Set(
        (rows || [])
          .map((r) => String(r.id || "").trim())
          .filter((id) => UUID_RE.test(id))
      ),
    ];
  } catch (err) {
    console.warn(
      "[hospitality:hub-bridge] platform_user lookup failed:",
      err instanceof Error ? err.message : err
    );
    return [];
  }
}

async function loadOrderSnapshot(businessId, orderId) {
  if (!orderId) return null;
  try {
    const row = await dakinisQueryOne(
      `SELECT payload FROM tenant_records WHERE id = ? AND business_id = ? AND entity = 'restaurant_order'`,
      [orderId, businessId]
    );
    if (!row?.payload) return null;
    return typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;
  } catch {
    return null;
  }
}

/**
 * @param {string} event
 * @param {object} payload
 * @param {string} userId
 */
async function postHubEvent(event, payload, userId) {
  if (!dakinisInternalConfigured()) {
    return { skipped: true, reason: "internal_not_configured" };
  }
  try {
    const res = await dakinisInternalRequest("/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        userId,
        source: "core-hospitality",
        payload: {
          ...payload,
          platformUserId: userId,
          product: "core",
        },
      }),
    });
    if (!res.ok) {
      console.warn("[hospitality:hub-bridge] POST /events", event, res.status, res.data);
    }
    return res;
  } catch (err) {
    console.warn(
      "[hospitality:hub-bridge] emit failed:",
      event,
      err instanceof Error ? err.message : err
    );
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function fanOut(event, payload, businessId) {
  const users = await resolvePlatformUserIds(businessId);
  if (!users.length) return { skipped: true, reason: "no_platform_user" };
  const results = [];
  for (const userId of users) {
    results.push(await postHubEvent(event, payload, userId));
  }
  return { ok: true, count: results.length };
}

async function onOrderCreated(p) {
  const order = await loadOrderSnapshot(p.businessId, p.orderId);
  const status = String(p.status || order?.status || "nueva");
  await fanOut(
    "order.pending",
    {
      status: PENDING_STATUSES.has(status) ? "pending" : status,
      orderId: p.orderId,
      amount: Number(order?.total ?? p.total ?? 0) || undefined,
      label: order?.customerName || p.orderId,
      channel: p.channel || order?.channel,
    },
    p.businessId
  );
}

async function onOrderStatusChanged(p) {
  const to = String(p.to || "").toLowerCase();
  if (!PENDING_STATUSES.has(to)) return;
  const order = await loadOrderSnapshot(p.businessId, p.orderId);
  await fanOut(
    "order.pending",
    {
      status: "pending",
      orderId: p.orderId,
      amount: Number(order?.total ?? 0) || undefined,
      from: p.from,
      to,
      label: order?.customerName || p.orderId,
    },
    p.businessId
  );
}

async function onOrderPaid(p) {
  const order = await loadOrderSnapshot(p.businessId, p.orderId);
  const amount = Number(order?.total ?? p.total ?? 0);
  await fanOut(
    "sale.completed",
    {
      amount,
      orderId: p.orderId,
      label: order?.customerName || p.orderId,
      channel: order?.channel,
    },
    p.businessId
  );
}

async function onStockReduced(p) {
  const qty = Number(p.quantity);
  const min = Number(p.minQuantity ?? p.min_quantity);
  const isLow =
    p.lowStock === true ||
    (Number.isFinite(qty) && Number.isFinite(min) && qty <= min);
  if (!isLow && p.force !== true) return;
  await fanOut(
    "stock.low",
    {
      sku: p.sku || p.slug || p.stockId,
      label: p.name || p.sku || p.slug,
      quantity: qty,
      minQuantity: min,
    },
    p.businessId
  );
}

let registered = false;

/** Register once — call from hospitality HTTP bootstrap. */
export function dakinisRegisterHospitalityHubTimelineBridge() {
  if (registered) return;
  registered = true;
  dakinisHospitalityOn(DAKINIS_HOSPITALITY_EVENTS.OrderCreated, (p) => {
    onOrderCreated(p).catch(() => {});
  });
  dakinisHospitalityOn(DAKINIS_HOSPITALITY_EVENTS.OrderStatusChanged, (p) => {
    onOrderStatusChanged(p).catch(() => {});
  });
  dakinisHospitalityOn(DAKINIS_HOSPITALITY_EVENTS.OrderPaid, (p) => {
    onOrderPaid(p).catch(() => {});
  });
  dakinisHospitalityOn(DAKINIS_HOSPITALITY_EVENTS.StockReduced, (p) => {
    onStockReduced(p).catch(() => {});
  });
}
