import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dakinisRequirePayrollPermission } from "../src/modules/payroll/authz.js";

function req({ role, permissions } = {}) {
  return {
    dakinisAuth: {
      method: "jwt",
      role: role || "member",
      permissions: permissions || []
    }
  };
}

describe("payroll authz", () => {
  it("allows owner all payroll keys", () => {
    for (const key of ["payroll.view", "payroll.manage", "payroll.run", "payroll.approve", "payroll.pay"]) {
      assert.equal(dakinisRequirePayrollPermission(req({ role: "owner" }), key), null);
    }
  });

  it("allows member view by default but not run", () => {
    assert.equal(dakinisRequirePayrollPermission(req({ role: "member" }), "payroll.view"), null);
    const denied = dakinisRequirePayrollPermission(req({ role: "member" }), "payroll.run");
    assert.equal(denied.status, 403);
    assert.equal(denied.body?.error?.code || denied.error?.code || denied.code, "FORBIDDEN");
  });

  it("honours explicit permissions on JWT", () => {
    assert.equal(
      dakinisRequirePayrollPermission(req({ role: "member", permissions: ["payroll.run"] }), "payroll.run"),
      null
    );
  });

  it("rejects missing JWT", () => {
    const denied = dakinisRequirePayrollPermission({ dakinisAuth: null }, "payroll.view");
    assert.ok(denied);
    assert.equal(denied.status, 403);
  });
});
