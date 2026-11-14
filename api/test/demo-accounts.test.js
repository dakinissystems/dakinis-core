import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  dakinisAssertProductionDemoPolicy,
  dakinisIsDemoAccountEmail
} from "../src/api/demo-accounts.js";

const prev = {
  NODE_ENV: process.env.NODE_ENV,
  CORE_SEED_DEMO: process.env.CORE_SEED_DEMO
};

afterEach(() => {
  if (prev.NODE_ENV === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = prev.NODE_ENV;
  if (prev.CORE_SEED_DEMO === undefined) delete process.env.CORE_SEED_DEMO;
  else process.env.CORE_SEED_DEMO = prev.CORE_SEED_DEMO;
});

describe("demo-accounts (A6)", () => {
  it("detecta emails seed demo y deja fuera el piloto Copérnico", () => {
    assert.equal(dakinisIsDemoAccountEmail("demo@local"), true);
    assert.equal(dakinisIsDemoAccountEmail("admin@restaurante-demo.local"), true);
    assert.equal(dakinisIsDemoAccountEmail("admin@heladeria-copernico.local"), false);
    assert.equal(dakinisIsDemoAccountEmail("owner@copernico.example"), false);
  });

  it("en producción tumba CORE_SEED_DEMO=true", () => {
    process.env.NODE_ENV = "production";
    process.env.CORE_SEED_DEMO = "true";
    assert.throws(() => dakinisAssertProductionDemoPolicy(), /CORE_SEED_DEMO/);
  });
});
