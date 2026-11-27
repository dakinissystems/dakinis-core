import test from "node:test";
import assert from "node:assert/strict";
import {
  DAKINIS_ROLES,
  dakinisIsTenantAdminRole,
  dakinisRequireRoles
} from "../src/middleware/rbac.js";

/** Condición 2 — rol sin permiso no ejecuta. */

test("member is denied on admin-only gate", () => {
  const gate = dakinisRequireRoles([DAKINIS_ROLES.ADMIN, DAKINIS_ROLES.OWNER]);
  const denied = gate({ dakinisAuth: { role: "member" } });
  assert.equal(denied.status, 403);
  assert.equal(denied.body.error.code, "FORBIDDEN");
  assert.equal(denied.body.error.details.role, "member");
});

test("admin passes admin-only gate", () => {
  const gate = dakinisRequireRoles([DAKINIS_ROLES.ADMIN, DAKINIS_ROLES.OWNER]);
  assert.equal(gate({ dakinisAuth: { role: "admin" } }), null);
  assert.equal(gate({ user: { role: "owner" } }), null);
});

test("missing role is forbidden", () => {
  const gate = dakinisRequireRoles([DAKINIS_ROLES.ADMIN]);
  const denied = gate({});
  assert.equal(denied.status, 403);
  assert.equal(denied.body.error.details.role, null);
});

test("dakinisIsTenantAdminRole covers admin shapes", () => {
  assert.equal(dakinisIsTenantAdminRole("admin"), true);
  assert.equal(dakinisIsTenantAdminRole("owner"), true);
  assert.equal(dakinisIsTenantAdminRole("tenant_admin"), true);
  assert.equal(dakinisIsTenantAdminRole("member"), false);
  assert.equal(dakinisIsTenantAdminRole("readonly"), false);
});
