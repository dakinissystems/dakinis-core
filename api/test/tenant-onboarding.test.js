import test from "node:test";
import assert from "node:assert/strict";
import {
  dakinisApplyOnboardingAdvance,
  dakinisResolveOnboardingTeamCount,
} from "../src/api/tenant-onboarding.js";

test("markComplete marca onboarding.completed", () => {
  const next = dakinisApplyOnboardingAdvance({ settings: { businessName: "A" } }, { markComplete: true });
  assert.equal(next.onboarding.completed, true);
  assert.ok(next.onboarding.completedAt);
});

test("stepId se acumula en skipped", () => {
  const once = dakinisApplyOnboardingAdvance({}, { stepId: "empleados" });
  assert.deepEqual(once.onboarding.skipped, ["empleados"]);
  const twice = dakinisApplyOnboardingAdvance(once, { stepId: "carta" });
  assert.deepEqual(twice.onboarding.skipped, ["empleados", "carta"]);
});

test("team count usa Hub members aunque Core solo tenga el owner", () => {
  assert.equal(dakinisResolveOnboardingTeamCount(1, null), 1);
  assert.equal(dakinisResolveOnboardingTeamCount(1, 1), 1);
  assert.equal(dakinisResolveOnboardingTeamCount(1, 2), 2);
  assert.equal(dakinisResolveOnboardingTeamCount(3, 2), 3);
  assert.equal(dakinisResolveOnboardingTeamCount(0, 0), 1);
});
