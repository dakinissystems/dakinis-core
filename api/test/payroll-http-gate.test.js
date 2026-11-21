import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dakinisHandlePayrollRoute } from "../src/modules/payroll/http.js";

describe("payroll http gates", () => {
  it("ignores non-payroll paths", async () => {
    const res = await dakinisHandlePayrollRoute({ method: "GET" }, "{}", "/api/tenant/fiscal/settings", null);
    assert.equal(res, null);
  });

  it("requires resolved business before authz", async () => {
    const res = await dakinisHandlePayrollRoute(
      { method: "GET", dakinisBusiness: null },
      "{}",
      "/api/tenant/payroll/settings",
      null
    );
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, "UNAUTHORIZED");
  });

  it("rejects API-key-only auth for payroll.view", async () => {
    const res = await dakinisHandlePayrollRoute(
      {
        method: "GET",
        dakinisBusiness: { id: "biz_x", slug: "x", type: "restaurant" },
        dakinisAuth: { method: "api-key", role: "full-access" }
      },
      "{}",
      "/api/tenant/payroll/settings",
      null
    );
    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, "FORBIDDEN");
  });
});
