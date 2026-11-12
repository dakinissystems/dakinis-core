/**
 * Hospitality → Hub Mi día: map domain events to hub.timeline via Internal POST /events.
 * ADR-014 in-process bus → platform timeline (sale.*, order.*, stock.low).
 */

import { dakinisCurrentActorToken } from "../../api/request-id.js";
import { dakinisQueryOne } from "../../db/query.js";
import {
  dakinisInternalConfigured,
  dakinisInternalRequest,
} from "../../lib/internal-client.js";
import {
  DAKINIS_HOSPITALITY_EVENTS,
  dakinisHospitalityOn,
} from "./events.js";

const PENDING_STATUSES = new Set(["nueva", "cocina", "lista", "pending", "open"]);

const IDENTITY_KEYS = ["userId", "user_id", "platformUserId", "tenantId", "businessId"];

/**
 * El evento no nombra personas. Internal atribuye el userId al JWT y copia
 * la fila a los miembros de ese workspace.
 * @param {string} event
 * @param {object} payload
 * @param {string} actorToken
 */
export function dakinisHospitalityHubEventRequest(event, payload, actorToken) {
  const token = String(actorToken || "").trim();
  if (!token) return null;
  const clean = { ...(payload && typeof payload === "object" ? payload : {}), product: "core" };
  for (const key of IDENTITY_KEYS) delete clean[key];
  return {
    headers: {
      "Content-Type": "application/json",
      "X-Dakinis-Actor": token,
    },
    body: {
      event,
      source: "core-hospitality",
      payload: clean,
    },
  };
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
async function resolveBusinessSlug(businessId) {
  if (!businessId) return "";
  try {
    const row = await dakinisQueryOne(`SELECT slug FROM business WHERE id = ?`, [businessId]);
    return String(row?.slug || "").trim();
  } catch {
    return "";
  }
}

async function postHubEvent(event, payload, businessId) {
  const slug = await resolveBusinessSlug(businessId);
  const request = dakinisHospitalityHubEventRequest(
    event,
    { ...payload, ...(slug ? { workspaceSlug: slug } : {}) },
    dakinisCurrentActorToken()
  );
  if (!request) return { skipped: true, reason: "no_actor" };
  if (!dakinisInternalConfigured()) {
    return { skipped: true, reason: "internal_not_configured" };
  }
  try {
    const res = await dakinisInternalRequest("/events", {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify(request.body),
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

async function onOrderCreated(p) {
  const order = await loadOrderSnapshot(p.businessId, p.orderId);
  const status = String(p.status || order?.status || "nueva");
  await postHubEvent(
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
  await postHubEvent(
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
  await postHubEvent(
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
  await postHubEvent(
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
