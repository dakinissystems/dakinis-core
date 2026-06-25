import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { dakinisSetSqliteDb } from "../src/db/query.js";
import {
  dakinisAnalyticsInactiveCrm,
  dakinisAnalyticsSupplierOverview,
  dakinisAnalyticsSlowProducts,
  dakinisAnalyticsExpiringLots
} from "../src/api/tenant-intelligence-analytics.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function dakinisWithTempDb(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dakinis-core-test-"));
  const dbPath = path.join(dir, "test.db");
  const db = new Database(dbPath);
  const schemaPath = path.join(__dirname, "../src/db/schema.sql");
  db.exec(fs.readFileSync(schemaPath, "utf8"));

  db.prepare(
    `INSERT INTO business (id, slug, name, type, plan) VALUES ('biz_t', 't', 'Test', 'clinica', 'pro')`
  ).run();
  db.prepare(
    `INSERT INTO tenant_records (id, business_id, entity, payload, created_at)
     VALUES ('r1', 'biz_t', 'paciente', ?, '2020-01-01T00:00:00.000Z')`
  ).run(JSON.stringify({ id: "r1", nombre: "Ana Vieja", fecha: "2020-06-01" }));
  db.prepare(
    `INSERT INTO tenant_supply_deliveries (id, business_id, supplier, arrival_window, contents, status)
     VALUES ('sd1', 'biz_t', 'Proveedor A', 'Lun', 'Kit', 'Programado')`
  ).run();

  dakinisSetSqliteDb(db);
  try {
    await fn(db);
  } finally {
    db.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test("inactive CRM analytics finds old records", async () => {
  await dakinisWithTempDb(async () => {
    const data = await dakinisAnalyticsInactiveCrm("biz_t", "clinica", { daysInactive: 30 });
    assert.equal(data.total, 1);
    assert.equal(data.inactive[0].name, "Ana Vieja");
  });
});

test("supplier overview aggregates deliveries", async () => {
  await dakinisWithTempDb(async () => {
    const data = await dakinisAnalyticsSupplierOverview("biz_t");
    assert.equal(data.deliveryCount, 1);
    assert.equal(data.suppliers[0].supplier, "Proveedor A");
    assert.equal(data.suppliers[0].pending, 1);
  });
});

test("expiring lots returns demo restaurant lots", async () => {
  await dakinisWithTempDb(async (db) => {
    db.prepare(`UPDATE business SET type = 'restaurante' WHERE id = 'biz_t'`).run();
    const data = await dakinisAnalyticsExpiringLots("biz_t", "restaurante", { withinDays: 14 });
    assert.ok(data.lots.length >= 1);
    assert.equal(data.hasLotTracking, true);
    assert.ok(data.lots[0].productName);
  });
});

test("slow products returns supply alerts", async () => {
  await dakinisWithTempDb(async (db) => {
    db.prepare(
      `INSERT INTO tenant_supply_alerts (id, business_id, title, product_ref, condition_text, severity)
       VALUES ('sa1', 'biz_t', 'Stock bajo', 'REF-1', 'Menos de 5', 'warning')`
    ).run();
    const data = await dakinisAnalyticsSlowProducts("biz_t");
    assert.equal(data.supplyAlerts.length, 1);
  });
});
