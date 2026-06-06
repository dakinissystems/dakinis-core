import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  dakinisGenerateTempPassword,
  dakinisHashResetToken,
  dakinisBuildResetUrl
} from "../src/services/password-reset.js";

describe("password-reset helpers", () => {
  it("generates temp password with expected length", () => {
    const p = dakinisGenerateTempPassword(12);
    assert.equal(p.length, 12);
    assert.match(p, /^[A-Za-z0-9]+$/);
  });

  it("hashes reset token deterministically", () => {
    const a = dakinisHashResetToken("abc");
    const b = dakinisHashResetToken("abc");
    assert.equal(a, b);
    assert.notEqual(a, dakinisHashResetToken("abcd"));
  });

  it("builds reset url with encoded token", () => {
    const url = dakinisBuildResetUrl("tok en+1");
    assert.ok(url.includes("/reset-password?token="));
    assert.ok(url.includes(encodeURIComponent("tok en+1")));
  });
});
