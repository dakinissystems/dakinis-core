import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dakinisPickTenantRef } from "../src/middleware/tenant.js";

describe("dakinisPickTenantRef (A4)", () => {
  it("con Bearer usa solo el tenant del JWT e ignora el header", () => {
    const picked = dakinisPickTenantRef({
      fromJwt: "biz-from-jwt",
      fromHeader: "biz-from-header",
      hasBearer: true,
      isProd: true
    });
    assert.equal(picked.tenantRef, "biz-from-jwt");
    assert.equal(picked.errorStatus, undefined);
  });

  it("en producción con Bearer sin tenant no cae al header", () => {
    const picked = dakinisPickTenantRef({
      fromJwt: "",
      fromHeader: "biz-from-header",
      hasBearer: true,
      isProd: true
    });
    assert.equal(picked.tenantRef, undefined);
    assert.equal(picked.errorStatus, 401);
  });

  it("sin Bearer usa x-business-id (flujo API key)", () => {
    const picked = dakinisPickTenantRef({
      fromJwt: "",
      fromHeader: "biz-api-key",
      hasBearer: false,
      isProd: true
    });
    assert.equal(picked.tenantRef, "biz-api-key");
  });
});
