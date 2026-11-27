import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dakinisIsPlatformAdminSession,
  dakinisIsTenantAdminSession,
} from "./businessDemoMode.js";

describe("dakinisIsTenantAdminSession", () => {
  it("allows admin/owner/manager and platform admin", () => {
    assert.equal(dakinisIsTenantAdminSession({ token: "t", user: { role: "admin" } }), true);
    assert.equal(dakinisIsTenantAdminSession({ token: "t", user: { role: "owner" } }), true);
    assert.equal(dakinisIsTenantAdminSession({ token: "t", user: { role: "manager" } }), true);
    assert.equal(dakinisIsTenantAdminSession({ token: "t", user: { role: "platform_admin" } }), true);
  });

  it("blocks member and anonymous", () => {
    assert.equal(dakinisIsTenantAdminSession({ token: "t", user: { role: "member" } }), false);
    assert.equal(dakinisIsTenantAdminSession({ user: { role: "admin" } }), false);
    assert.equal(dakinisIsTenantAdminSession(null), false);
  });

  it("keeps platform admin helper", () => {
    assert.equal(dakinisIsPlatformAdminSession({ user: { role: "platform_admin" } }), true);
    assert.equal(dakinisIsPlatformAdminSession({ user: { role: "admin" } }), false);
  });
});
