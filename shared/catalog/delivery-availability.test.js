import assert from "node:assert/strict";
import test from "node:test";
import { dakinisDeliveryAvailability } from "./deliveryProviders.js";
import { dakinisRestaurantValidatePlan } from "./restaurant-kitchen.js";
import { dakinisUserFacingMessage } from "../../web/src/services/user-facing-error.js";

test("a partner channel is not shown as disconnected", () => {
  assert.equal(
    dakinisDeliveryAvailability({
      phase: "partner_access",
      healthStatus: "disconnected",
      healthOk: false,
      enabled: false
    }),
    "pending_access"
  );
  assert.equal(dakinisDeliveryAvailability({ phase: "soon", healthStatus: "stub" }), "coming_soon");
});

test("a live channel without a previous sync can be configured", () => {
  assert.equal(
    dakinisDeliveryAvailability({ phase: "live", healthStatus: "disabled", healthOk: false, enabled: false }),
    "available"
  );
  assert.equal(
    dakinisDeliveryAvailability({
      phase: "live",
      healthStatus: "offline",
      healthOk: false,
      enabled: true,
      lastSyncAt: "2026-11-13T00:00:00Z"
    }),
    "connection_error"
  );
});

test("production with no stock is rejected", () => {
  const recipes = [
    {
      slug: "empanada",
      lines: [{ itemSlug: "harina", quantity: 1000 }]
    }
  ];
  const result = dakinisRestaurantValidatePlan([{ recipeSlug: "empanada", batches: 1 }], recipes, { harina: 0 });
  assert.equal(result.ok, false);
  assert.equal(result.shortages[0].available, 0);
});

test("infrastructure text never reaches the screen", () => {
  const raw = "Failed to fetch. No se pudo contactar /api en este sitio. En Railway (Core Front): API_UPSTREAM=https://tu-api.railway.app y redeploy.";
  const shown = dakinisUserFacingMessage(raw);
  assert.equal(shown.includes("API_UPSTREAM"), false);
  assert.equal(shown.includes("Railway"), false);
  assert.equal(dakinisUserFacingMessage("Stock insuficiente para el plan"), "Stock insuficiente para el plan");
});
