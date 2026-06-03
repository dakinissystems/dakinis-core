import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dakinisNormalizeWhatsappPhone } from "../src/services/whatsapp-cloud.js";

describe("dakinisNormalizeWhatsappPhone", () => {
  it("strips non-digits and accepts E.164 length", () => {
    assert.equal(dakinisNormalizeWhatsappPhone("+34 600 11 22 33"), "34600112233");
  });

  it("rejects too short numbers", () => {
    assert.equal(dakinisNormalizeWhatsappPhone("123"), null);
  });

  it("rejects empty", () => {
    assert.equal(dakinisNormalizeWhatsappPhone(""), null);
  });
});
