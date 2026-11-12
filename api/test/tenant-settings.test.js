import test from "node:test";
import assert from "node:assert/strict";
import { dakinisPublicTenantSettings } from "../src/api/tenant-settings-routes.js";

test("tenant settings keep only the public fields", () => {
  const settings = dakinisPublicTenantSettings({
    logoUrl: "javascript:alert(1)",
    primaryColor: "#112233",
    businessHours: "12-16",
    vatRate: 10,
    token: "secret",
    __proto__: { polluted: true }
  });
  assert.equal(settings.logoUrl, "");
  assert.equal(settings.primaryColor, "#112233");
  assert.equal(settings.businessHours, "12-16");
  assert.equal(settings.vatRate, 10);
  assert.equal(settings.token, undefined);
  assert.equal(settings.polluted, undefined);
});
