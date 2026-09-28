import { randomUUID } from "node:crypto";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun } from "../../db/query.js";
import {
  DAKINIS_PRICE_LIST_KEYS,
  DAKINIS_PRICE_LIST_LABELS,
  dakinisChannelToPriceListKey
} from "@dakinis/shared/catalog/deliveryProviders.js";

function dakinisNewId(prefix) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

function dakinisRoundCents(cents, roundTo) {
  if (!roundTo || roundTo <= 0) return Math.round(cents);
  return Math.round(cents / roundTo) * roundTo;
}

/**
 * Asegura tarifas base del tenant (salon default + canales delivery).
 * @param {string} businessId
 */
export async function dakinisEnsureDefaultPriceLists(businessId) {
  const existing = await dakinisQueryAll(`SELECT key FROM tenant_price_lists WHERE business_id = ?`, [businessId]);
  const have = new Set(existing.map((r) => r.key));

  for (const key of DAKINIS_PRICE_LIST_KEYS) {
    if (have.has(key)) continue;
    const isDefault = key === "salon" ? 1 : 0;
    // Reglas markup por defecto para marketplaces (editables)
    let markupPct = null;
    let markupFixed = null;
    let roundTo = null;
    if (key === "glovo") {
      markupPct = 28;
      roundTo = 10;
    } else if (key === "ubereats") {
      markupPct = 30;
      roundTo = 10;
    } else if (key === "justeat") {
      markupPct = 25;
      roundTo = 10;
    } else if (key === "takeaway" || key === "delivery") {
      markupFixed = 60; // +0,60 €
      roundTo = 10;
    } else if (key === "manual") {
      markupPct = 20;
      roundTo = 10;
    }

    await dakinisRun(
      `INSERT INTO tenant_price_lists
        (id, business_id, key, name, channel, is_default, markup_pct, markup_fixed_cents, round_to_cents, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        dakinisNewId("plist"),
        businessId,
        key,
        DAKINIS_PRICE_LIST_LABELS[key] || key,
        key,
        isDefault,
        markupPct,
        markupFixed,
        roundTo
      ]
    );
  }
}

/**
 * Precio base salon (cents) desde tenant_menu_prices o price list salon.
 * @param {string} businessId
 * @param {string} itemId
 */
async function dakinisBaseSalonCents(businessId, itemId) {
  const explicit = await dakinisQueryOne(
    `SELECT price_cents FROM tenant_menu_prices
     WHERE business_id = ? AND item_id = ? AND channel = 'salon'`,
    [businessId, itemId]
  );
  if (explicit) return Number(explicit.price_cents) || 0;

  const list = await dakinisQueryOne(
    `SELECT id FROM tenant_price_lists WHERE business_id = ? AND key = 'salon'`,
    [businessId]
  );
  if (list) {
    const row = await dakinisQueryOne(
      `SELECT price_cents FROM tenant_price_list_items WHERE price_list_id = ? AND item_id = ?`,
      [list.id, itemId]
    );
    if (row) return Number(row.price_cents) || 0;
  }
  return 0;
}

/**
 * Resuelve precio en céntimos para un item + canal.
 * Orden: override en price_list_items → regla markup sobre base salon → base salon.
 *
 * @param {string} businessId
 * @param {string} itemId
 * @param {string} channel
 * @returns {Promise<{ priceCents: number, priceListKey: string, source: string }>}
 */
export async function dakinisResolveItemPriceCents(businessId, itemId, channel) {
  await dakinisEnsureDefaultPriceLists(businessId);
  const key = dakinisChannelToPriceListKey(channel);

  const list = await dakinisQueryOne(
    `SELECT id, markup_pct, markup_fixed_cents, round_to_cents FROM tenant_price_lists
     WHERE business_id = ? AND key = ? AND active = 1`,
    [businessId, key]
  );

  if (list) {
    const override = await dakinisQueryOne(
      `SELECT price_cents FROM tenant_price_list_items WHERE price_list_id = ? AND item_id = ?`,
      [list.id, itemId]
    );
    if (override) {
      return { priceCents: Number(override.price_cents) || 0, priceListKey: key, source: "list_item" };
    }
  }

  // Legacy: tenant_menu_prices por channel
  const channelPrice = await dakinisQueryOne(
    `SELECT price_cents FROM tenant_menu_prices
     WHERE business_id = ? AND item_id = ? AND channel = ?`,
    [businessId, itemId, key]
  );
  if (channelPrice) {
    return { priceCents: Number(channelPrice.price_cents) || 0, priceListKey: key, source: "menu_prices" };
  }

  const base = await dakinisBaseSalonCents(businessId, itemId);
  if (!list || key === "salon" || key === "barra") {
    return { priceCents: base, priceListKey: key, source: "base" };
  }

  let cents = base;
  if (list.markup_pct != null) cents = base * (1 + Number(list.markup_pct) / 100);
  if (list.markup_fixed_cents != null) cents += Number(list.markup_fixed_cents) || 0;
  cents = dakinisRoundCents(cents, list.round_to_cents);
  return { priceCents: cents, priceListKey: key, source: "rule" };
}

/**
 * Aplica tarifas a líneas de pedido (rellena unitPrice si falta o forceResolve).
 * @param {string} businessId
 * @param {Array} lines
 * @param {string} channel
 * @param {{ force?: boolean }} [opts]
 */
export async function dakinisApplyPriceListToLines(businessId, lines, channel, opts = {}) {
  const out = [];
  for (const line of lines) {
    const qty = Number(line.qty) || 1;
    let unitPrice = Number(line.unitPrice);
    let priceMeta = null;
    if (opts.force || !Number.isFinite(unitPrice) || unitPrice <= 0) {
      if (line.menuId) {
        priceMeta = await dakinisResolveItemPriceCents(businessId, line.menuId, channel);
        unitPrice = priceMeta.priceCents / 100;
      } else {
        unitPrice = Number(line.unitPrice) || 0;
      }
    }
    out.push({
      ...line,
      qty,
      unitPrice: Math.round(unitPrice * 100) / 100,
      priceListKey: priceMeta?.priceListKey,
      priceSource: priceMeta?.source
    });
  }
  return out;
}

export async function dakinisListPriceLists(businessId) {
  await dakinisEnsureDefaultPriceLists(businessId);
  const lists = await dakinisQueryAll(
    `SELECT id, key, name, channel, is_default, markup_pct, markup_fixed_cents, round_to_cents, active
     FROM tenant_price_lists WHERE business_id = ? ORDER BY is_default DESC, key ASC`,
    [businessId]
  );
  return lists.map((r) => ({
    id: r.id,
    key: r.key,
    name: r.name,
    channel: r.channel,
    isDefault: !!r.is_default,
    markupPct: r.markup_pct,
    markupFixedCents: r.markup_fixed_cents,
    roundToCents: r.round_to_cents,
    active: !!r.active
  }));
}

/**
 * Upsert precio explícito en una tarifa.
 */
export async function dakinisUpsertPriceListItem(businessId, priceListKey, itemId, priceEur) {
  await dakinisEnsureDefaultPriceLists(businessId);
  const list = await dakinisQueryOne(
    `SELECT id FROM tenant_price_lists WHERE business_id = ? AND key = ?`,
    [businessId, priceListKey]
  );
  if (!list) return { error: { status: 404, code: "NOT_FOUND", message: "Tarifa no encontrada" } };

  const cents = Math.round(Number(priceEur) * 100);
  if (!Number.isFinite(cents) || cents < 0) {
    return { error: { status: 400, code: "VALIDATION_ERROR", message: "Precio inválido" } };
  }

  const existing = await dakinisQueryOne(
    `SELECT id FROM tenant_price_list_items WHERE price_list_id = ? AND item_id = ?`,
    [list.id, itemId]
  );
  if (existing) {
    await dakinisRun(`UPDATE tenant_price_list_items SET price_cents = ? WHERE id = ?`, [cents, existing.id]);
  } else {
    await dakinisRun(
      `INSERT INTO tenant_price_list_items (id, business_id, price_list_id, item_id, price_cents, currency)
       VALUES (?, ?, ?, ?, ?, 'EUR')`,
      [dakinisNewId("pli"), businessId, list.id, itemId, cents]
    );
  }
  return { ok: true, priceCents: cents };
}

/**
 * Actualiza reglas de markup de una tarifa.
 */
export async function dakinisPatchPriceListRules(businessId, priceListKey, patch) {
  await dakinisEnsureDefaultPriceLists(businessId);
  const list = await dakinisQueryOne(
    `SELECT id, markup_pct, markup_fixed_cents, round_to_cents, name, active FROM tenant_price_lists WHERE business_id = ? AND key = ?`,
    [businessId, priceListKey]
  );
  if (!list) return { error: { status: 404, code: "NOT_FOUND", message: "Tarifa no encontrada" } };

  const next = {
    markup_pct: patch.markupPct !== undefined ? patch.markupPct : list.markup_pct,
    markup_fixed_cents: patch.markupFixedCents !== undefined ? patch.markupFixedCents : list.markup_fixed_cents,
    round_to_cents: patch.roundToCents !== undefined ? patch.roundToCents : list.round_to_cents,
    name: patch.name !== undefined ? String(patch.name) : list.name,
    active: patch.active !== undefined ? (patch.active ? 1 : 0) : list.active
  };

  await dakinisRun(
    `UPDATE tenant_price_lists SET markup_pct = ?, markup_fixed_cents = ?, round_to_cents = ?, name = ?, active = ?
     WHERE id = ?`,
    [next.markup_pct, next.markup_fixed_cents, next.round_to_cents, next.name, next.active, list.id]
  );
  return { ok: true };
}
