import test from "node:test";
import assert from "node:assert/strict";
import {
  dakinisEffectivePlanForAccess,
  dakinisNormalizeAccessRow
} from "../src/services/tenant-access-store.js";

test("dakinisEffectivePlanForAccess degrades to starter", () => {
  const access = dakinisNormalizeAccessRow({
    plan: "pro",
    entitled_plan: "pro",
    access_state: "degraded",
    status: "past_due"
  });
  assert.equal(dakinisEffectivePlanForAccess(access, "pro"), "starter");
});

test("dakinisEffectivePlanForAccess restores entitled plan when active", () => {
  const access = dakinisNormalizeAccessRow({
    plan: "starter",
    entitled_plan: "growth",
    access_state: "active",
    status: "active"
  });
  assert.equal(dakinisEffectivePlanForAccess(access, "starter"), "starter");
});

test("dakinisNormalizeAccessRow defaults safely", () => {
  const access = dakinisNormalizeAccessRow(null);
  assert.equal(access.accessState, "active");
  assert.equal(access.entitledPlan, "starter");
});
