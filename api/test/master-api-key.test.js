import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  DAKINIS_DEV_MASTER_API_KEY,
  dakinisAssertProductionMasterApiKey,
  dakinisResolveMasterApiKey
} from "../src/api/master-api-key.js";

const prevEnv = {
  NODE_ENV: process.env.NODE_ENV,
  DAKINIS_MASTER_API_KEY: process.env.DAKINIS_MASTER_API_KEY
};

afterEach(() => {
  if (prevEnv.NODE_ENV === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = prevEnv.NODE_ENV;
  if (prevEnv.DAKINIS_MASTER_API_KEY === undefined) delete process.env.DAKINIS_MASTER_API_KEY;
  else process.env.DAKINIS_MASTER_API_KEY = prevEnv.DAKINIS_MASTER_API_KEY;
});

describe("master-api-key (A4)", () => {
  it("en producción no arranca si la master key es la de desarrollo", () => {
    process.env.NODE_ENV = "production";
    process.env.DAKINIS_MASTER_API_KEY = DAKINIS_DEV_MASTER_API_KEY;
    assert.throws(() => dakinisAssertProductionMasterApiKey(), /clave de desarrollo/);
  });

  it("en producción admite master ausente (deshabilitada)", () => {
    process.env.NODE_ENV = "production";
    delete process.env.DAKINIS_MASTER_API_KEY;
    assert.doesNotThrow(() => dakinisAssertProductionMasterApiKey());
    assert.equal(dakinisResolveMasterApiKey(), null);
  });

  it("en desarrollo cae a dakinis-dev-key si no hay variable", () => {
    process.env.NODE_ENV = "development";
    delete process.env.DAKINIS_MASTER_API_KEY;
    assert.equal(dakinisResolveMasterApiKey(), DAKINIS_DEV_MASTER_API_KEY);
  });
});
