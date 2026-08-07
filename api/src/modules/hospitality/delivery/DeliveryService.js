import { randomUUID } from "node:crypto";
import { dakinisSqlTimestampNow } from "../../../db/dialect.js";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun } from "../../../db/query.js";
import {
  dakinisChannelToProviderId,
  DAKINIS_DELIVERY_PROVIDERS
} from "@dakinis/shared/catalog/deliveryProviders.js";
import { dakinisGetDeliveryProvider } from "./providers/index.js";
import { dakinisOrdersCreate, dakinisOrdersPatch, dakinisOrdersList } from "../OrderService.js";
import { dakinisApplyPriceListToLines } from "../PriceListService.js";
import { dakinisEnqueueDeliveryJob } from "./DeliveryQueue.js";
import {
  DAKINIS_HOSPITALITY_EVENTS,
  dakinisHospitalityOn,
  dakinisEnsureHospitalityEventDefaults
} from "../events.js";

function dakinisNewId(prefix) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

async function dakinisLoadIntegration(businessId, providerId) {
  return dakinisQueryOne(
    `SELECT * FROM tenant_delivery_integrations WHERE business_id = ? AND provider = ?`,
    [businessId, providerId]
  );
}

/**
 * @param {string} businessId
 * @param {string} providerId
 * @param {object} patch
 */
export async function dakinisUpsertDeliveryIntegration(businessId, providerId, patch = {}) {
  const existing = await dakinisLoadIntegration(businessId, providerId);
  const enabled = patch.enabled !== undefined ? (patch.enabled ? 1 : 0) : existing?.enabled ?? 0;
  const status =
    patch.status ||
    (enabled ? existing?.status || "online" : "disconnected");

  if (existing) {
    await dakinisRun(
      `UPDATE tenant_delivery_integrations SET
        enabled = ?,
        api_key = COALESCE(?, api_key),
        refresh_token = COALESCE(?, refresh_token),
        store_id = COALESCE(?, store_id),
        location = COALESCE(?, location),
        webhook_secret = COALESCE(?, webhook_secret),
        status = ?,
        last_error = COALESCE(?, last_error),
        meta_json = COALESCE(?, meta_json)
       WHERE id = ?`,
      [
        enabled,
        patch.apiKey ?? null,
        patch.refreshToken ?? null,
        patch.storeId ?? null,
        patch.location ?? null,
        patch.webhookSecret ?? null,
        status,
        patch.lastError ?? null,
        patch.meta ? JSON.stringify(patch.meta) : null,
        existing.id
      ]
    );
    return dakinisLoadIntegration(businessId, providerId);
  }

  const id = dakinisNewId("dint");
  await dakinisRun(
    `INSERT INTO tenant_delivery_integrations
      (id, business_id, provider, enabled, api_key, refresh_token, store_id, location, webhook_secret, status, meta_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      businessId,
      providerId,
      enabled,
      patch.apiKey || null,
      patch.refreshToken || null,
      patch.storeId || null,
      patch.location || null,
      patch.webhookSecret || null,
      status,
      JSON.stringify(patch.meta || {})
    ]
  );
  return dakinisLoadIntegration(businessId, providerId);
}

export async function dakinisListDeliveryIntegrations(businessId) {
  const rows = await dakinisQueryAll(
    `SELECT id, provider, enabled, store_id, location, status, last_sync_at, last_error
     FROM tenant_delivery_integrations WHERE business_id = ?`,
    [businessId]
  );
  const byProvider = new Map(rows.map((r) => [r.provider, r]));

  const out = [];
  for (const meta of DAKINIS_DELIVERY_PROVIDERS) {
    if (meta.id === "internal") continue;
    const row = byProvider.get(meta.id);
    const provider = dakinisGetDeliveryProvider(meta.id);
    let health = { ok: false, status: "disconnected" };
    if (provider && row) {
      health = await provider.health({ businessId, integration: row });
    } else if (meta.id === "manual") {
      health = { ok: true, status: row?.enabled ? "online" : "disabled", detail: "Simulación local" };
    }
    out.push({
      provider: meta.id,
      label: meta.label,
      enabled: row ? !!row.enabled : meta.id === "manual",
      status: health.status || row?.status || "disconnected",
      healthOk: !!health.ok,
      detail: health.detail || row?.last_error || meta.notes,
      storeId: row?.store_id || null,
      lastSyncAt: row?.last_sync_at || null
    });
  }
  return out;
}

/**
 * Dashboard: salud + contadores del día por canal marketplace.
 */
export async function dakinisDeliveryDashboard(businessId) {
  const integrations = await dakinisListDeliveryIntegrations(businessId);
  const orders = await dakinisOrdersList(businessId);
  const today = new Date().toISOString().slice(0, 10);
  const counts = {};
  let pending = 0;
  for (const o of orders) {
    const ch = String(o.channel || "salon");
    const created = String(o.createdAt || "").slice(0, 10);
    if (created === today) {
      counts[ch] = (counts[ch] || 0) + 1;
    }
    if (["nueva", "cocina", "lista"].includes(o.status) && dakinisChannelToProviderId(ch) !== "internal") {
      pending += 1;
    }
  }
  return { integrations, todayCounts: counts, pendingMarketplace: pending };
}

/**
 * Importa pedido externo → HospitalityOrder → OrderService.create (con PriceList).
 * @param {string} businessId
 * @param {string} providerId
 * @param {object} rawOrder
 * @param {{ venueName?: string }} [ctx]
 */
export async function dakinisDeliveryImportOrder(businessId, providerId, rawOrder, ctx = {}) {
  const provider = dakinisGetDeliveryProvider(providerId);
  if (!provider) {
    return { error: { status: 400, code: "UNKNOWN_PROVIDER", message: `Provider ${providerId} no registrado` } };
  }

  const integration = await dakinisLoadIntegration(businessId, providerId);
  const draft = await provider.importOrder({ businessId, integration }, rawOrder);

  // Tarifas por canal: re-precio con PriceList (force)
  const pricedLines = await dakinisApplyPriceListToLines(
    businessId,
    draft.lines || [],
    draft.channel || providerId,
    { force: true }
  );

  const body = {
    channel: draft.channel || providerId,
    table: "",
    customerName: draft.customer?.name || "Cliente delivery",
    notes: draft.notes || "",
    lines: pricedLines,
    tax: 0,
    delivery: draft.delivery || null,
    payment: draft.payment || null,
    externalOrderId: draft.externalOrderId || null,
    externalProvider: providerId
  };

  const created = await dakinisOrdersCreate(businessId, body, ctx);
  if (created.error) return created;

  if (integration) {
    await dakinisRun(
      `UPDATE tenant_delivery_integrations SET last_sync_at = ${dakinisSqlTimestampNow()}, last_error = NULL WHERE id = ?`,
      [integration.id]
    );
  }

  // Auto-accept (enqueue; fallo no tumba el pedido)
  await dakinisEnqueueDeliveryJob(businessId, providerId, "acceptOrder", {
    orderId: created.order.id
  });

  return created;
}

/**
 * Ejecuta un job de la cola contra el provider (polimorfismo).
 */
export async function dakinisRunDeliveryJob(job) {
  const provider = dakinisGetDeliveryProvider(job.provider);
  if (!provider) throw new Error(`Provider ${job.provider} no encontrado`);

  const integration = await dakinisLoadIntegration(job.business_id, job.provider);
  const ctx = { businessId: job.business_id, integration };
  const payload = job.payload || {};

  if (job.job_type === "acceptOrder" || job.job_type === "updateStatus") {
    const orderRow = await dakinisQueryOne(
      `SELECT id, payload FROM tenant_records WHERE id = ? AND business_id = ?`,
      [payload.orderId, job.business_id]
    );
    if (!orderRow) throw new Error("Pedido no encontrado para job delivery");
    let order = {};
    try {
      order = { id: orderRow.id, ...JSON.parse(orderRow.payload || "{}") };
    } catch {
      order = { id: orderRow.id };
    }

    let result;
    if (job.job_type === "acceptOrder") {
      result = await provider.acceptOrder(ctx, order);
    } else {
      result = await provider.updateStatus(ctx, order, payload.status || order.status);
    }

    if (result && result.ok === false && result.error) {
      // Stubs partner: no reintentar eternamente — marcar warning en integración
      if (String(result.error).includes("no configurada") || String(result.error).includes("partner")) {
        if (integration) {
          await dakinisRun(
            `UPDATE tenant_delivery_integrations SET last_error = ?, status = 'stub' WHERE id = ?`,
            [result.error, integration.id]
          );
        }
        return;
      }
      throw new Error(result.error);
    }
    return;
  }

  if (job.job_type === "health") {
    const h = await provider.health(ctx);
    if (integration) {
      await dakinisRun(
        `UPDATE tenant_delivery_integrations SET status = ?, last_error = ?, last_sync_at = ${dakinisSqlTimestampNow()} WHERE id = ?`,
        [h.status || "unknown", h.ok ? null : h.detail || null, integration.id]
      );
    }
    return;
  }

  throw new Error(`job_type desconocido: ${job.job_type}`);
}

/**
 * Escucha OrderStatusChanged / KitchenReady → encola updateStatus al provider del canal.
 */
export function dakinisRegisterDeliveryEventListeners() {
  dakinisEnsureHospitalityEventDefaults();

  dakinisHospitalityOn(DAKINIS_HOSPITALITY_EVENTS.OrderStatusChanged, async (p) => {
    if (!p.businessId || !p.orderId) return;
    const row = await dakinisQueryOne(
      `SELECT payload FROM tenant_records WHERE id = ? AND business_id = ?`,
      [p.orderId, p.businessId]
    );
    if (!row) return;
    let order = {};
    try {
      order = JSON.parse(row.payload || "{}");
    } catch {
      return;
    }
    const providerId = dakinisChannelToProviderId(order.channel || order.externalProvider);
    if (providerId === "internal") return;
    await dakinisEnqueueDeliveryJob(p.businessId, providerId, "updateStatus", {
      orderId: p.orderId,
      status: p.to || order.status
    });
  });

  dakinisHospitalityOn(DAKINIS_HOSPITALITY_EVENTS.KitchenReady, async (p) => {
    if (!p.businessId || !p.orderId) return;
    const row = await dakinisQueryOne(
      `SELECT payload FROM tenant_records WHERE id = ? AND business_id = ?`,
      [p.orderId, p.businessId]
    );
    if (!row) return;
    let order = {};
    try {
      order = JSON.parse(row.payload || "{}");
    } catch {
      return;
    }
    const providerId = dakinisChannelToProviderId(order.channel || order.externalProvider);
    if (providerId === "internal") return;
    await dakinisEnqueueDeliveryJob(p.businessId, providerId, "updateStatus", {
      orderId: p.orderId,
      status: "lista"
    });
  });
}

let deliveryListenersRegistered = false;
export function dakinisEnsureDeliveryListeners() {
  if (deliveryListenersRegistered) return;
  deliveryListenersRegistered = true;
  dakinisRegisterDeliveryEventListeners();
}

/**
 * Webhook genérico: verifica secret opcional e importa / cancela.
 */
export async function dakinisHandleProviderWebhook(businessId, providerId, eventType, body, headers = {}) {
  const integration = await dakinisLoadIntegration(businessId, providerId);
  if (integration?.webhook_secret) {
    const incoming =
      headers["x-dakinis-webhook-secret"] ||
      headers["x-webhook-secret"] ||
      headers["x-glovo-signature"] ||
      "";
    if (incoming && incoming !== integration.webhook_secret) {
      return { error: { status: 401, code: "UNAUTHORIZED", message: "Webhook secret inválido" } };
    }
  }

  const provider = dakinisGetDeliveryProvider(providerId);
  if (!provider) {
    return { error: { status: 400, code: "UNKNOWN_PROVIDER", message: "Provider desconocido" } };
  }

  const type = String(eventType || body?.event || body?.type || "order.created").toLowerCase();

  if (type.includes("cancel")) {
    const externalId = body?.order_id || body?.id || body?.orderId;
    if (externalId) {
      const orders = await dakinisOrdersList(businessId);
      const match = orders.find((o) => String(o.externalOrderId) === String(externalId));
      if (match?.id) {
        await dakinisOrdersPatch(businessId, match.id, { status: "cancelada" });
        return { ok: true, action: "cancelled", orderId: match.id };
      }
    }
    return { ok: true, action: "cancel_noop" };
  }

  // Nuevo pedido / update
  const result = await dakinisDeliveryImportOrder(businessId, providerId, body);
  if (result.error) return result;
  return { ok: true, action: "imported", order: result.order };
}

/** Simulación rápida ManualProvider (dev / demo). */
export async function dakinisDeliverySimulateManualOrder(businessId, overrides = {}, ctx = {}) {
  await dakinisUpsertDeliveryIntegration(businessId, "manual", { enabled: true, status: "online" });
  return dakinisDeliveryImportOrder(
    businessId,
    "manual",
    {
      order_id: `MAN-${Date.now()}`,
      customerName: overrides.customerName || "Cliente simulado",
      notes: overrides.notes || "Pedido manual de prueba",
      products: overrides.products || [
        { name: "Smash Burger", qty: 1, price: 0, menuId: overrides.menuId },
        { name: "Patatas", qty: 1, price: 0 }
      ],
      address: "Calle Demo 1",
      ...overrides
    },
    ctx
  );
}
