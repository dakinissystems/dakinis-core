import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Condición 7 — acción admin sensible queda registrada (sin mock.module; CI usa node --test). */

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

test("cash-close path calls dakinisAuditLog with restaurant.cash_close", () => {
  const src = fs.readFileSync(path.join(root, "src/api/tenant-restaurant.js"), "utf8");
  assert.match(src, /dakinisAuditLog\(\{[\s\S]*action:\s*"restaurant\.cash_close"/);
  assert.match(src, /resourceType:\s*"cash_close"/);
  assert.match(src, /tenantId:\s*req\.dakinisBusiness\.id/);
  assert.match(src, /userId:\s*actorUserId/);
});

test("audit-log persists to tenant_audit_logs on postgres", () => {
  const src = fs.readFileSync(path.join(root, "src/lib/audit-log.js"), "utf8");
  assert.match(src, /INSERT INTO tenant_audit_logs/);
  assert.match(src, /dakinisGetDbDriver\(\) !== "postgres"/);
  assert.match(src, /entry\.action/);
  assert.match(src, /entry\.tenantId \|\| entry\.businessId/);
  assert.match(src, /entry\.userId \|\| entry\.actorUserId/);
});

test("tenant users audit role change and create", () => {
  const src = fs.readFileSync(path.join(root, "src/api/tenant-users.js"), "utf8");
  assert.match(src, /action:\s*"tenant\.user_create"/);
  assert.match(src, /action:\s*roleChanged \? "tenant\.user_role_change" : "tenant\.user_update"/);
});

test("stock adjust paths call inventory.stock_adjust audit", () => {
  const src = fs.readFileSync(path.join(root, "src/api/tenant-restaurant.js"), "utf8");
  assert.match(src, /action:\s*"inventory\.stock_adjust"/);
  assert.match(src, /salida-manual/);
  assert.match(src, /salida-escaneo/);
});
