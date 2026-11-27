import test from "node:test";
import assert from "node:assert/strict";
import {
  dakinisAddTenantBranch,
  dakinisPatchTenantBranch,
  dakinisRemoveTenantBranch,
} from "../src/api/tenant-settings-routes.js";

test("add first branch becomes default", () => {
  const branches = dakinisAddTenantBranch([], { name: "Centro" });
  assert.equal(branches.length, 1);
  assert.equal(branches[0].name, "Centro");
  assert.equal(branches[0].slug, "centro");
  assert.equal(branches[0].isDefault, true);
  assert.match(branches[0].id, /^br_/);
});

test("add second branch keeps previous default unless requested", () => {
  const first = dakinisAddTenantBranch([], { name: "Centro" });
  const both = dakinisAddTenantBranch(first, { name: "Norte" });
  assert.equal(both.length, 2);
  assert.equal(both.filter((b) => b.isDefault).length, 1);
  assert.equal(both[0].isDefault, true);
  assert.equal(both[1].isDefault, false);
});

test("patch can promote default", () => {
  const first = dakinisAddTenantBranch([], { name: "Centro" });
  const both = dakinisAddTenantBranch(first, { name: "Norte" });
  const patched = dakinisPatchTenantBranch(both, both[1].id, { isDefault: true });
  assert.equal(patched[0].isDefault, false);
  assert.equal(patched[1].isDefault, true);
});

test("remove default promotes another", () => {
  const first = dakinisAddTenantBranch([], { name: "Centro" });
  const both = dakinisAddTenantBranch(first, { name: "Norte" });
  const next = dakinisRemoveTenantBranch(both, both[0].id);
  assert.equal(next.length, 1);
  assert.equal(next[0].name, "Norte");
  assert.equal(next[0].isDefault, true);
});

test("cannot remove last branch", () => {
  const first = dakinisAddTenantBranch([], { name: "Centro" });
  assert.throws(() => dakinisRemoveTenantBranch(first, first[0].id), /BRANCH_LAST/);
});
