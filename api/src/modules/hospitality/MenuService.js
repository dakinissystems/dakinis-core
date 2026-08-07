import { randomUUID } from "node:crypto";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun } from "../../db/query.js";
import { dakinisSlugFromName } from "@dakinis/shared/catalog/stock-barcodes.js";
import { DAKINIS_HOSPITALITY_EVENTS, dakinisHospitalityEmit } from "./events.js";

function dakinisNewId(prefix) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

async function dakinisLoadConfig(businessId) {
  const biz = await dakinisQueryOne(`SELECT config_json FROM business WHERE id = ?`, [businessId]);
  try {
    return JSON.parse(biz?.config_json || "{}");
  } catch {
    return {};
  }
}

async function dakinisSaveConfig(businessId, config) {
  await dakinisRun(`UPDATE business SET config_json = ? WHERE id = ?`, [JSON.stringify(config), businessId]);
}

function dakinisEurToCents(priceEur) {
  const n = Number(priceEur);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

function dakinisCentsToEur(cents) {
  return Math.round(Number(cents) || 0) / 100;
}

/**
 * Import one-shot desde config_json.menu.items → tablas.
 * @param {string} businessId
 */
export async function dakinisEnsureMenuMigrated(businessId) {
  const existing = await dakinisQueryOne(
    `SELECT id FROM tenant_menu_items WHERE business_id = ? LIMIT 1`,
    [businessId]
  );
  if (existing) return { migrated: false, source: "tables" };

  const config = await dakinisLoadConfig(businessId);
  if (config?.hospitality?.migratedMenuAt) {
    return { migrated: false, source: "flag" };
  }

  const items = Array.isArray(config?.menu?.items) ? config.menu.items : [];
  if (!items.length) {
    const hosp = config.hospitality && typeof config.hospitality === "object" ? config.hospitality : {};
    await dakinisSaveConfig(businessId, {
      ...config,
      hospitality: { ...hosp, migratedMenuAt: new Date().toISOString() }
    });
    return { migrated: true, count: 0 };
  }

  const categoryIds = new Map();
  let sort = 0;
  for (const raw of items) {
    const category = String(raw?.category || "Otros").trim() || "Otros";
    if (!categoryIds.has(category)) {
      const catId = dakinisNewId("mcat");
      categoryIds.set(category, catId);
      await dakinisRun(
        `INSERT INTO tenant_menu_categories (id, business_id, name, sort_order, active) VALUES (?, ?, ?, ?, 1)`,
        [catId, businessId, category, sort++]
      );
    }
  }

  for (const raw of items) {
    const nameEs = String(raw?.nameEs || raw?.name || "").trim();
    if (!nameEs) continue;
    const category = String(raw?.category || "Otros").trim() || "Otros";
    const id =
      typeof raw?.id === "string" && raw.id.trim()
        ? raw.id.trim()
        : dakinisSlugFromName(nameEs) || dakinisNewId("dish");
    const cents = dakinisEurToCents(raw?.priceEur ?? raw?.price ?? 0) ?? 0;
    await dakinisRun(
      `INSERT OR IGNORE INTO tenant_menu_items
        (id, business_id, category_id, name, name_es, description, active, station, meta_json)
       VALUES (?, ?, ?, ?, ?, ?, 1, NULL, '{}')`,
      [
        id,
        businessId,
        categoryIds.get(category),
        String(raw?.name || nameEs).trim(),
        nameEs,
        String(raw?.description || "").trim()
      ]
    );
    const priceId = dakinisNewId("mprice");
    await dakinisRun(
      `INSERT OR IGNORE INTO tenant_menu_prices
        (id, business_id, item_id, channel, price_cents, currency)
       VALUES (?, ?, ?, 'salon', ?, 'EUR')`,
      [priceId, businessId, id, cents]
    );
  }

  const hosp = config.hospitality && typeof config.hospitality === "object" ? config.hospitality : {};
  await dakinisSaveConfig(businessId, {
    ...config,
    hospitality: { ...hosp, migratedMenuAt: new Date().toISOString() }
  });
  return { migrated: true, count: items.length };
}

/**
 * Lista menú en shape legacy `{ id, name, nameEs, category, priceEur, description? }[]`
 * @param {string} businessId
 */
export async function dakinisMenuListItems(businessId) {
  await dakinisEnsureMenuMigrated(businessId);

  const rows = await dakinisQueryAll(
    `SELECT i.id, i.name, i.name_es, i.description, i.active, c.name AS category,
            p.price_cents
     FROM tenant_menu_items i
     LEFT JOIN tenant_menu_categories c ON c.id = i.category_id
     LEFT JOIN tenant_menu_prices p
       ON p.item_id = i.id AND p.business_id = i.business_id AND p.channel = 'salon'
     WHERE i.business_id = ? AND i.active = 1
     ORDER BY c.sort_order ASC, i.name_es ASC`,
    [businessId]
  );

  if (rows.length) {
    return rows.map((r) => {
      const item = {
        id: r.id,
        name: r.name,
        nameEs: r.name_es || r.name,
        category: r.category || "Otros",
        priceEur: dakinisCentsToEur(r.price_cents)
      };
      if (r.description) item.description = r.description;
      return item;
    });
  }

  // Dual-read fallback JSON si tablas vacías
  const config = await dakinisLoadConfig(businessId);
  return Array.isArray(config?.menu?.items) ? config.menu.items : [];
}

function dakinisNormalizeMenuPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

function dakinisUniqueMenuItemId(baseId, existingIds) {
  let id = baseId || dakinisNewId("dish");
  if (!existingIds.has(id)) return id;
  let i = 2;
  while (existingIds.has(`${id}-${i}`)) i += 1;
  return `${id}-${i}`;
}

/**
 * PATCH legacy: { items: [{id, priceEur}], create: [...] }
 * @param {string} businessId
 * @param {object} body
 */
export async function dakinisMenuPatch(businessId, body) {
  await dakinisEnsureMenuMigrated(businessId);

  const current = await dakinisMenuListItems(businessId);
  const byId = new Map(current.map((it) => [it.id, { ...it }]));
  const existingIds = new Set(byId.keys());

  const priceUpdates = Array.isArray(body.items) ? body.items : [];
  for (const patch of priceUpdates) {
    const id = typeof patch?.id === "string" ? patch.id.trim() : "";
    if (!id || !byId.has(id)) continue;
    if (patch.priceEur === undefined && patch.price === undefined) continue;
    const price = dakinisNormalizeMenuPrice(patch.priceEur ?? patch.price);
    if (price === null) {
      return { error: { status: 400, code: "VALIDATION_ERROR", message: `Precio invalido para ${id}` } };
    }
    const cents = dakinisEurToCents(price);
    const existingPrice = await dakinisQueryOne(
      `SELECT id FROM tenant_menu_prices WHERE business_id = ? AND item_id = ? AND channel = 'salon'`,
      [businessId, id]
    );
    if (existingPrice) {
      await dakinisRun(`UPDATE tenant_menu_prices SET price_cents = ? WHERE id = ?`, [cents, existingPrice.id]);
    } else {
      await dakinisRun(
        `INSERT INTO tenant_menu_prices (id, business_id, item_id, channel, price_cents, currency)
         VALUES (?, ?, ?, 'salon', ?, 'EUR')`,
        [dakinisNewId("mprice"), businessId, id, cents]
      );
    }
    byId.get(id).priceEur = price;
  }

  const createList = Array.isArray(body.create) ? body.create : body.create ? [body.create] : [];
  for (const raw of createList) {
    const nameEs = String(raw?.nameEs || raw?.name || "").trim();
    if (!nameEs) {
      return { error: { status: 400, code: "VALIDATION_ERROR", message: "Cada producto necesita un nombre" } };
    }
    const price = dakinisNormalizeMenuPrice(raw?.priceEur ?? raw?.price ?? 0);
    if (price === null) {
      return { error: { status: 400, code: "VALIDATION_ERROR", message: `Precio invalido para ${nameEs}` } };
    }
    const category = String(raw?.category || "Otros").trim() || "Otros";
    const description = String(raw?.description || "").trim();
    const requestedId =
      typeof raw?.id === "string" && raw.id.trim()
        ? raw.id.trim()
        : dakinisSlugFromName(nameEs) || dakinisNewId("dish");
    const id = dakinisUniqueMenuItemId(requestedId, existingIds);
    existingIds.add(id);

    let cat = await dakinisQueryOne(
      `SELECT id FROM tenant_menu_categories WHERE business_id = ? AND name = ?`,
      [businessId, category]
    );
    if (!cat) {
      const catId = dakinisNewId("mcat");
      const maxSort = await dakinisQueryOne(
        `SELECT MAX(sort_order) AS m FROM tenant_menu_categories WHERE business_id = ?`,
        [businessId]
      );
      await dakinisRun(
        `INSERT INTO tenant_menu_categories (id, business_id, name, sort_order, active) VALUES (?, ?, ?, ?, 1)`,
        [catId, businessId, category, Number(maxSort?.m || 0) + 1]
      );
      cat = { id: catId };
    }

    await dakinisRun(
      `INSERT INTO tenant_menu_items
        (id, business_id, category_id, name, name_es, description, active, station, meta_json)
       VALUES (?, ?, ?, ?, ?, ?, 1, NULL, '{}')`,
      [id, businessId, cat.id, String(raw?.name || nameEs).trim(), nameEs, description]
    );
    await dakinisRun(
      `INSERT INTO tenant_menu_prices (id, business_id, item_id, channel, price_cents, currency)
       VALUES (?, ?, ?, 'salon', ?, 'EUR')`,
      [dakinisNewId("mprice"), businessId, id, dakinisEurToCents(price)]
    );

    const item = { id, name: String(raw?.name || nameEs).trim(), nameEs, category, priceEur: price };
    if (description) item.description = description;
    byId.set(id, item);
  }

  // Mirror to config_json.menu.items for consumers aún en JSON (dual-write suave)
  const config = await dakinisLoadConfig(businessId);
  const menuRoot = config.menu && typeof config.menu === "object" ? { ...config.menu } : {};
  menuRoot.items = [...byId.values()];
  const hosp = config.hospitality && typeof config.hospitality === "object" ? config.hospitality : {};
  await dakinisSaveConfig(businessId, {
    ...config,
    menu: menuRoot,
    hospitality: { ...hosp, migratedMenuAt: hosp.migratedMenuAt || new Date().toISOString() }
  });

  dakinisHospitalityEmit(DAKINIS_HOSPITALITY_EVENTS.MenuUpdated, { businessId });

  return { menu: [...byId.values()], brand: menuRoot.brand ?? config.brand ?? null };
}
