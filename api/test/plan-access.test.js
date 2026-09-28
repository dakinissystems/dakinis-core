import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dakinisTenantApiPathRequiredModule,
  dakinisPlanModuleDenialOrNull,
} from "../src/api/plan-access.js";

describe("plan-access capability gates", () => {
  it("maps inventory and sales paths to modules", () => {
    assert.equal(dakinisTenantApiPathRequiredModule("/api/inventario/items"), "inventory");
    assert.equal(dakinisTenantApiPathRequiredModule("/api/ventas/orders"), "sales");
    assert.equal(dakinisTenantApiPathRequiredModule("/api/reportes/summary"), "reports");
    assert.equal(dakinisTenantApiPathRequiredModule("/api/whatsapp/conversations"), "whatsapp");
  });

  it("denies whatsapp on starter plan", () => {
    const denied = dakinisPlanModuleDenialOrNull({ plan: "starter" }, "/api/whatsapp/send");
    assert.ok(denied);
    assert.equal(denied.status, 403);
    assert.equal(denied.body.error.code, "PLAN_MODULE_DENIED");
  });

  it("allows inventory on starter", () => {
    const ok = dakinisPlanModuleDenialOrNull({ plan: "starter" }, "/api/inventario");
    assert.equal(ok, null);
  });

  it("denies reports on starter", () => {
    const denied = dakinisPlanModuleDenialOrNull({ plan: "starter" }, "/api/reportes");
    assert.ok(denied);
    assert.equal(denied.body.error.code, "PLAN_MODULE_DENIED");
  });
});
