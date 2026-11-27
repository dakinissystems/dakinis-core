import { mock, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Condición 7 — acción admin sensible queda registrada. */

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

test("cash-close path calls dakinisAuditLog with restaurant.cash_close", () => {
  const src = fs.readFileSync(path.join(root, "src/api/tenant-restaurant.js"), "utf8");
  assert.match(src, /dakinisAuditLog\(\{[\s\S]*action:\s*"restaurant\.cash_close"/);
  assert.match(src, /resourceType:\s*"cash_close"/);
});

let inserts;
let dakinisAuditLog;

beforeEach(async () => {
  inserts = [];
  mock.reset();
  mock.module("../src/db/index.js", {
    namedExports: {
      dakinisGetDbDriver: () => "postgres",
    },
  });
  mock.module("../src/db/query.js", {
    namedExports: {
      async dakinisRun(sql, params) {
        inserts.push({ sql: String(sql), params });
        return { rowCount: 1 };
      },
    },
  });
  mock.module("../src/api/structured-logger.js", {
    namedExports: {
      dakinisStructuredLog() {},
    },
  });
  ({ dakinisAuditLog } = await import("../src/lib/audit-log.js"));
});

afterEach(() => {
  mock.reset();
});

test("dakinisAuditLog inserts tenant_audit_logs row", async () => {
  await dakinisAuditLog({
    action: "restaurant.cash_close",
    tenantId: "biz-1",
    userId: "user-1",
    resourceType: "cash_close",
    resourceId: "2026-11-27",
  });
  assert.equal(inserts.length, 1);
  assert.match(inserts[0].sql, /INSERT INTO tenant_audit_logs/);
  assert.equal(inserts[0].params[1], "biz-1");
  assert.equal(inserts[0].params[2], "user-1");
  assert.equal(inserts[0].params[3], "restaurant.cash_close");
  assert.equal(inserts[0].params[4], "cash_close");
  assert.equal(inserts[0].params[5], "2026-11-27");
});
