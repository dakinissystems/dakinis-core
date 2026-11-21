import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dakinisNewOutboxEventId,
  dakinisOutboxShouldPersist
} from "../src/lib/domain-outbox.js";

describe("domain outbox (B3)", () => {
  it("persists StockReduced and OrderPaid only", () => {
    assert.equal(dakinisOutboxShouldPersist("StockReduced"), true);
    assert.equal(dakinisOutboxShouldPersist("OrderPaid"), true);
    assert.equal(dakinisOutboxShouldPersist("sale.completed"), true);
    assert.equal(dakinisOutboxShouldPersist("MenuUpdated"), false);
    assert.equal(dakinisOutboxShouldPersist("OrderCreated"), false);
  });

  it("generates stable-looking event ids", () => {
    const a = dakinisNewOutboxEventId("hevt");
    const b = dakinisNewOutboxEventId("hevt");
    assert.match(a, /^hevt_[a-f0-9]{20}$/);
    assert.notEqual(a, b);
  });
});
