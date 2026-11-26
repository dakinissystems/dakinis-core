import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const src = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../src/lib/event-consumers.js"),
  "utf8"
);

test("Core escucha los eventos B7 de Billing (3DS, trial, disputa)", () => {
  for (const type of [
    "billing.payment_action_required",
    "billing.trial_will_end",
    "billing.dispute",
  ]) {
    assert.match(src, new RegExp(`dakinisSubscribeEvent\\("${type}"`));
  }
});

test("3DS no degrada el plan (solo audit)", () => {
  const block = src.slice(
    src.indexOf('dakinisSubscribeEvent("billing.payment_action_required"'),
    src.indexOf('dakinisSubscribeEvent("billing.trial_will_end"')
  );
  assert.equal(block.includes("dakinisSyncBusinessPlanFromBilling"), false);
  assert.match(block, /billing\.payment_action_required/);
});
