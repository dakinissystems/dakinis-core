import { randomUUID } from "node:crypto";
import { dakinisQueryAll, dakinisRun } from "../db/query.js";
import { dakinisSqlInsertIgnore, dakinisSqlTimestampNow } from "../db/dialect.js";
import { dakinisPublishEvent } from "./event-bus.js";

/**
 * B3 — transactional-ish domain outbox (durable row + async drain).
 * Inventory stock rows stay in the request path; this persists domain events
 * so Hub/timeline/consumers survive process restarts.
 */

const OUTBOX_EVENTS = new Set(["StockReduced", "OrderPaid", "sale.completed"]);

let schemaReady = false;
let drainTimer = null;
let draining = false;

export function dakinisOutboxShouldPersist(eventName) {
  return OUTBOX_EVENTS.has(String(eventName || ""));
}

export function dakinisNewOutboxEventId(prefix = "evt") {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
}

export async function dakinisEnsureDomainOutboxSchema() {
  if (schemaReady) return;
  try {
    await dakinisRun(`
      CREATE TABLE IF NOT EXISTS tenant_domain_outbox (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_id TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        published_at TEXT,
        attempts INTEGER NOT NULL DEFAULT 0
      )
    `);
    await dakinisRun(
      `CREATE UNIQUE INDEX IF NOT EXISTS tenant_domain_outbox_event_id_uidx ON tenant_domain_outbox (event_id)`
    );
    await dakinisRun(
      `CREATE INDEX IF NOT EXISTS tenant_domain_outbox_unpublished_idx ON tenant_domain_outbox (published_at, created_at)`
    );
  } catch (err) {
    const msg = String(err?.message || err || "");
    if (!/already exists|duplicate/i.test(msg)) throw err;
  }
  schemaReady = true;
}

/**
 * Persist one domain event. Duplicate event_id is ignored (idempotent).
 * @returns {Promise<{ inserted: boolean, eventId: string }>}
 */
export async function dakinisOutboxEnqueue({
  businessId,
  eventType,
  eventId,
  payload
}) {
  await dakinisEnsureDomainOutboxSchema();
  const id = dakinisNewOutboxEventId("obx");
  const eid = String(eventId || dakinisNewOutboxEventId("evt"));
  const type = String(eventType || "");
  const biz = String(businessId || "");
  const body = JSON.stringify({
    ...payload,
    eventId: eid,
    event: type,
    businessId: biz || payload?.businessId || null
  });
  const sql = dakinisSqlInsertIgnore("tenant_domain_outbox", [
    "id",
    "business_id",
    "event_type",
    "event_id",
    "payload_json",
    "created_at",
    "attempts"
  ]);
  const result = await dakinisRun(sql, [id, biz, type, eid, body, new Date().toISOString(), 0]);
  const inserted = Number(result?.changes ?? result?.rowCount ?? 1) > 0;
  return { inserted, eventId: eid };
}

export async function dakinisOutboxListUnpublished(limit = 40) {
  await dakinisEnsureDomainOutboxSchema();
  return dakinisQueryAll(
    `SELECT id, business_id, event_type, event_id, payload_json, attempts
     FROM tenant_domain_outbox
     WHERE published_at IS NULL
     ORDER BY created_at ASC
     LIMIT ?`,
    [limit]
  );
}

export async function dakinisOutboxMarkPublished(id) {
  await dakinisRun(
    `UPDATE tenant_domain_outbox SET published_at = ${dakinisSqlTimestampNow()}, attempts = attempts + 1 WHERE id = ?`,
    [id]
  );
}

export async function dakinisOutboxBumpAttempt(id) {
  await dakinisRun(`UPDATE tenant_domain_outbox SET attempts = attempts + 1 WHERE id = ?`, [id]);
}

/**
 * Drain unpublished rows to the platform event bus (local + optional Redis/BullMQ).
 */
export async function dakinisOutboxDrainOnce(limit = 40) {
  if (draining) return { drained: 0, skipped: true };
  draining = true;
  try {
    const rows = await dakinisOutboxListUnpublished(limit);
    let drained = 0;
    for (const row of rows) {
      let payload = {};
      try {
        payload = JSON.parse(row.payload_json || "{}");
      } catch {
        payload = {};
      }
      try {
        await dakinisPublishEvent(row.event_type, {
          ...payload,
          eventId: row.event_id,
          businessId: row.business_id,
          outboxId: row.id
        });
        await dakinisOutboxMarkPublished(row.id);
        drained += 1;
      } catch (err) {
        await dakinisOutboxBumpAttempt(row.id);
        console.warn(
          "[domain-outbox] drain failed",
          row.event_id,
          err instanceof Error ? err.message : err
        );
      }
    }
    return { drained, skipped: false };
  } finally {
    draining = false;
  }
}

/** Start a light in-process drainer (API process). No-op if already started. */
export function dakinisStartDomainOutboxDrainer({ intervalMs = 5000 } = {}) {
  if (drainTimer) return;
  const tick = () => {
    dakinisOutboxDrainOnce().catch((err) => {
      console.warn("[domain-outbox] tick", err instanceof Error ? err.message : err);
    });
  };
  drainTimer = setInterval(tick, intervalMs);
  if (typeof drainTimer.unref === "function") drainTimer.unref();
  // First pass soon after boot.
  setTimeout(tick, 1500).unref?.();
}
