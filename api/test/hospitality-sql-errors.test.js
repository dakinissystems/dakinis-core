import test from "node:test";
import assert from "node:assert/strict";
import { dakinisIsMissingRelation } from "../src/modules/hospitality/sql-errors.js";

test("missing relation covers postgres and sqlite", () => {
  assert.equal(dakinisIsMissingRelation({ code: "42P01", message: "relation missing" }), true);
  assert.equal(dakinisIsMissingRelation(new Error('relation "tenant_menu_items" does not exist')), true);
  assert.equal(dakinisIsMissingRelation(new Error("no such table: tenant_menu_items")), true);
  assert.equal(dakinisIsMissingRelation(new Error("syntax error at or near OR")), false);
});
