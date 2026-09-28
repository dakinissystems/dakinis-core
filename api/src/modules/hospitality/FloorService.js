import { randomUUID } from "node:crypto";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun } from "../../db/query.js";
import { DAKINIS_RESTAURANT_DEFAULT_FLOOR_TABLES } from "@dakinis/shared/catalog/restaurant-floor.js";
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

function dakinisParseCart(raw) {
  try {
    const v = JSON.parse(raw || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/**
 * @param {string} businessId
 */
export async function dakinisEnsureFloorMigrated(businessId) {
  const existing = await dakinisQueryOne(`SELECT id FROM tenant_tables WHERE business_id = ? LIMIT 1`, [
    businessId
  ]);
  if (existing) return { migrated: false, source: "tables" };

  const config = await dakinisLoadConfig(businessId);
  if (config?.hospitality?.migratedFloorAt) {
    return { migrated: false, source: "flag" };
  }

  const tables =
    Array.isArray(config?.floor?.tables) && config.floor.tables.length
      ? config.floor.tables
      : DAKINIS_RESTAURANT_DEFAULT_FLOOR_TABLES.map((t) => ({ ...t }));
  const sessions =
    config?.floor?.sessions && typeof config.floor.sessions === "object" && !Array.isArray(config.floor.sessions)
      ? config.floor.sessions
      : {};

  for (const t of tables) {
    const id = String(t.id || dakinisNewId("tbl"));
    await dakinisRun(
      `INSERT INTO tenant_tables (id, business_id, zone, label, x, y, seats, status, meta_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, '{}')`,
      [
        id,
        businessId,
        String(t.zone || ""),
        String(t.label || id),
        Number(t.x) || 0,
        Number(t.y) || 0,
        Number(t.seats) || 2,
        String(t.status || "libre")
      ]
    );
    const sess = sessions[id];
    if (sess && typeof sess === "object") {
      await dakinisRun(
        `INSERT INTO tenant_table_sessions
          (id, business_id, table_id, opened_at, closed_at, cart_json, notes, waiter_user_id)
         VALUES (?, ?, ?, ?, NULL, ?, ?, NULL)`,
        [
          dakinisNewId("tsess"),
          businessId,
          id,
          new Date().toISOString(),
          JSON.stringify(Array.isArray(sess.cart) ? sess.cart : []),
          String(sess.notes || "")
        ]
      );
    }
  }

  const hosp = config.hospitality && typeof config.hospitality === "object" ? config.hospitality : {};
  await dakinisSaveConfig(businessId, {
    ...config,
    hospitality: { ...hosp, migratedFloorAt: new Date().toISOString() }
  });
  return { migrated: true, count: tables.length };
}

/**
 * Shape legacy `{ tables, sessions }`
 * @param {string} businessId
 */
export async function dakinisFloorGet(businessId) {
  await dakinisEnsureFloorMigrated(businessId);

  const tableRows = await dakinisQueryAll(
    `SELECT id, zone, label, x, y, seats, status FROM tenant_tables WHERE business_id = ? ORDER BY label ASC`,
    [businessId]
  );

  if (!tableRows.length) {
    const config = await dakinisLoadConfig(businessId);
    const tables =
      Array.isArray(config?.floor?.tables) && config.floor.tables.length
        ? config.floor.tables
        : DAKINIS_RESTAURANT_DEFAULT_FLOOR_TABLES.map((t) => ({ ...t }));
    const sessions =
      config?.floor?.sessions && typeof config.floor.sessions === "object" && !Array.isArray(config.floor.sessions)
        ? config.floor.sessions
        : {};
    return { tables, sessions };
  }

  const sessionRows = await dakinisQueryAll(
    `SELECT table_id, cart_json, notes, opened_at
     FROM tenant_table_sessions
     WHERE business_id = ? AND closed_at IS NULL`,
    [businessId]
  );

  const sessions = {};
  for (const s of sessionRows) {
    sessions[s.table_id] = {
      cart: dakinisParseCart(s.cart_json),
      notes: s.notes || "",
      openedAt: s.opened_at
    };
  }

  return {
    tables: tableRows.map((t) => ({
      id: t.id,
      zone: t.zone,
      label: t.label,
      x: t.x,
      y: t.y,
      seats: t.seats,
      status: t.status
    })),
    sessions
  };
}

/**
 * PATCH floor: replace tables and/or sessions map.
 * @param {string} businessId
 * @param {{ tables?: object[], sessions?: Record<string, object> }} body
 */
export async function dakinisFloorPatch(businessId, body) {
  await dakinisEnsureFloorMigrated(businessId);
  const prev = await dakinisFloorGet(businessId);

  const nextTables = Array.isArray(body.tables) ? body.tables : prev.tables;
  const nextSessions =
    body.sessions && typeof body.sessions === "object" && !Array.isArray(body.sessions)
      ? body.sessions
      : prev.sessions || {};

  const tables =
    Array.isArray(nextTables) && nextTables.length
      ? nextTables
      : DAKINIS_RESTAURANT_DEFAULT_FLOOR_TABLES.map((t) => ({ ...t }));

  // Replace tables for business (simple sync)
  await dakinisRun(`DELETE FROM tenant_table_sessions WHERE business_id = ?`, [businessId]);
  await dakinisRun(`DELETE FROM tenant_tables WHERE business_id = ?`, [businessId]);

  for (const t of tables) {
    const id = String(t.id || dakinisNewId("tbl"));
    await dakinisRun(
      `INSERT INTO tenant_tables (id, business_id, zone, label, x, y, seats, status, meta_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, '{}')`,
      [
        id,
        businessId,
        String(t.zone || ""),
        String(t.label || id),
        Number(t.x) || 0,
        Number(t.y) || 0,
        Number(t.seats) || 2,
        String(t.status || "libre")
      ]
    );
  }

  for (const [tableId, sess] of Object.entries(nextSessions)) {
    if (!sess || typeof sess !== "object") continue;
    const cart = Array.isArray(sess.cart) ? sess.cart : [];
    const notes = String(sess.notes || "");
    if (!cart.length && !notes) continue;
    await dakinisRun(
      `INSERT INTO tenant_table_sessions
        (id, business_id, table_id, opened_at, closed_at, cart_json, notes, waiter_user_id)
       VALUES (?, ?, ?, ?, NULL, ?, ?, NULL)`,
      [dakinisNewId("tsess"), businessId, tableId, new Date().toISOString(), JSON.stringify(cart), notes]
    );
    dakinisHospitalityEmit(DAKINIS_HOSPITALITY_EVENTS.TableOpened, { businessId, tableId });
  }

  // Dual-write config mirror
  const config = await dakinisLoadConfig(businessId);
  const hosp = config.hospitality && typeof config.hospitality === "object" ? config.hospitality : {};
  await dakinisSaveConfig(businessId, {
    ...config,
    floor: { tables, sessions: nextSessions },
    hospitality: { ...hosp, migratedFloorAt: hosp.migratedFloorAt || new Date().toISOString() }
  });

  return { tables, sessions: nextSessions };
}

/**
 * Upsert open session for one table (cart / notes).
 * @param {string} businessId
 * @param {string} tableId
 * @param {{ cart?: object[], notes?: string, close?: boolean }} body
 */
export async function dakinisFloorUpsertSession(businessId, tableId, body) {
  await dakinisEnsureFloorMigrated(businessId);

  const table = await dakinisQueryOne(`SELECT id FROM tenant_tables WHERE business_id = ? AND id = ?`, [
    businessId,
    tableId
  ]);
  if (!table) {
    // Ensure table exists from defaults / create stub
    await dakinisRun(
      `INSERT INTO tenant_tables (id, business_id, zone, label, x, y, seats, status, meta_json)
       VALUES (?, ?, '', ?, 0, 0, 2, 'ocupada', '{}')`,
      [tableId, businessId, tableId]
    );
  }

  if (body.close || body.clear) {
    await dakinisRun(
      `UPDATE tenant_table_sessions SET closed_at = ? WHERE business_id = ? AND table_id = ? AND closed_at IS NULL`,
      [new Date().toISOString(), businessId, tableId]
    );
    await dakinisRun(`UPDATE tenant_tables SET status = 'libre' WHERE business_id = ? AND id = ?`, [
      businessId,
      tableId
    ]);
    dakinisHospitalityEmit(DAKINIS_HOSPITALITY_EVENTS.TableClosed, { businessId, tableId });
  } else {
    const open = await dakinisQueryOne(
      `SELECT id FROM tenant_table_sessions WHERE business_id = ? AND table_id = ? AND closed_at IS NULL`,
      [businessId, tableId]
    );
    const cart = Array.isArray(body.cart) ? body.cart : undefined;
    const notes = body.notes !== undefined ? String(body.notes) : undefined;

    if (open) {
      if (cart !== undefined) {
        await dakinisRun(`UPDATE tenant_table_sessions SET cart_json = ? WHERE id = ?`, [
          JSON.stringify(cart),
          open.id
        ]);
      }
      if (notes !== undefined) {
        await dakinisRun(`UPDATE tenant_table_sessions SET notes = ? WHERE id = ?`, [notes, open.id]);
      }
    } else {
      await dakinisRun(
        `INSERT INTO tenant_table_sessions
          (id, business_id, table_id, opened_at, closed_at, cart_json, notes, waiter_user_id)
         VALUES (?, ?, ?, ?, NULL, ?, ?, NULL)`,
        [
          dakinisNewId("tsess"),
          businessId,
          tableId,
          new Date().toISOString(),
          JSON.stringify(cart || []),
          notes || ""
        ]
      );
      dakinisHospitalityEmit(DAKINIS_HOSPITALITY_EVENTS.TableOpened, { businessId, tableId });
    }
    await dakinisRun(`UPDATE tenant_tables SET status = 'ocupada' WHERE business_id = ? AND id = ?`, [
      businessId,
      tableId
    ]);
  }

  // Mirror sessions into config for dual-write
  const floor = await dakinisFloorGet(businessId);
  const config = await dakinisLoadConfig(businessId);
  await dakinisSaveConfig(businessId, { ...config, floor });

  return floor;
}
