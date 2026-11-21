import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculatePay, selectComponents } from "@dakinis/payroll";

/**
 * Guards the Core ↔ engine contract: API must not reimplement calculation.
 */
describe("payroll engine wire", () => {
  it("calculatePay remains the only calculator for a salary slip", () => {
    const components = selectComponents(
      [{ code: "BASE", kind: "earning", method: "contract", sequence: 10, jurisdictionCode: "" }],
      { jurisdictionCode: "GENERIC", onDate: "2026-11-01" }
    );
    const slip = calculatePay({
      engagement: { currency: "EUR", payBasis: "salary", amountMinor: 250000 },
      components
    });
    assert.equal(slip.ok, true);
    assert.equal(slip.grossMinor, 250000);
    assert.equal(slip.netMinor, 250000);
  });
});
