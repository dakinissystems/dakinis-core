import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dakinisCommercialRoutePlanDenialOrNull } from "../src/api/route-plan-access.js";

describe("route-plan-access", () => {
  it("bloquea Copilot en starter", () => {
    const denied = dakinisCommercialRoutePlanDenialOrNull(
      { plan: "starter" },
      "POST",
      "/api/v1/tenant/copilot"
    );
    assert.ok(denied);
    assert.equal(denied.status, 403);
    assert.equal(denied.body.error.code, "PLAN_MODULE_DENIED");
  });

  it("permite Copilot en pro", () => {
    const denied = dakinisCommercialRoutePlanDenialOrNull(
      { plan: "pro" },
      "POST",
      "/api/v1/tenant/copilot"
    );
    assert.equal(denied, null);
  });

  it("permite benchmark real en growth", () => {
    const denied = dakinisCommercialRoutePlanDenialOrNull(
      { plan: "growth" },
      "GET",
      "/api/v1/tenant/benchmark/real"
    );
    assert.equal(denied, null);
  });

  it("no aplica a profile (ruta libre)", () => {
    const denied = dakinisCommercialRoutePlanDenialOrNull(
      { plan: "starter" },
      "GET",
      "/api/v1/tenant/profile"
    );
    assert.equal(denied, null);
  });
});
