import test from "node:test";
import assert from "node:assert/strict";
import { dakinisCoreRoleFromWorkspaceMembership } from "../src/api/platform-user-bridge.js";

test("workspace membership maps operators and leaves viewers out", () => {
  assert.equal(dakinisCoreRoleFromWorkspaceMembership("owner"), "admin");
  assert.equal(dakinisCoreRoleFromWorkspaceMembership("admin"), "admin");
  assert.equal(dakinisCoreRoleFromWorkspaceMembership("member"), "member");
  assert.equal(dakinisCoreRoleFromWorkspaceMembership("viewer"), null);
  assert.equal(dakinisCoreRoleFromWorkspaceMembership(""), null);
});
