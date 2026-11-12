import test from "node:test";
import assert from "node:assert/strict";
import { dakinisNormalizeUserEmail } from "../src/api/tenant-users.js";

test("user email is trimmed, lowercased, and rejected when it is not an address", () => {
  assert.equal(dakinisNormalizeUserEmail("  Ana@Copernico.ES "), "ana@copernico.es");
  assert.equal(dakinisNormalizeUserEmail("sin-arroba"), null);
  assert.equal(dakinisNormalizeUserEmail(""), null);
  assert.equal(dakinisNormalizeUserEmail(null), null);
});
