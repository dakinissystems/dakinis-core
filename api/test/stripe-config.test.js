import test from "node:test";
import assert from "node:assert/strict";

process.env.STRIPE_PRICE_STARTER_MONTHLY = "price_starter_test";
process.env.STRIPE_PRICE_GROWTH_MONTHLY = "price_growth_test";
process.env.STRIPE_PRICE_PRO_MONTHLY = "price_pro_test";

const { dakinisStripePlanFromPriceId, dakinisStripePublicPlansPayload } = await import(
  "../src/services/stripe-config.js"
);

test("dakinisStripePlanFromPriceId maps configured prices", () => {
  assert.equal(dakinisStripePlanFromPriceId("price_growth_test"), "growth");
  assert.equal(dakinisStripePlanFromPriceId("price_unknown"), null);
});

test("dakinisStripePublicPlansPayload exposes checkout flags", () => {
  const payload = dakinisStripePublicPlansPayload();
  assert.equal(payload.plans.growth.priceId, "price_growth_test");
  assert.equal(payload.plans.growth.checkoutAvailable, true);
});
