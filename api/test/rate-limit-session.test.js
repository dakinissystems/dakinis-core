import assert from "node:assert/strict";
import test from "node:test";

process.env.DAKINIS_AUTHED_RATE_LIMIT_MAX = "2";
process.env.DAKINIS_RATE_LIMIT_MAX_REQUESTS = "2";
process.env.TRUST_PROXY = "false";

const { dakinisEnforceRateLimit } = await import("../src/api/security.js");

const menuUrl = new URL("http://localhost/api/tenant/restaurant/menu");

function mock(token) {
  const headers = {};
  return {
    headers,
    req: {
      headers: {
        ...(token ? { authorization: `Bearer aaa.bbb.${token}` } : {}),
        "x-business-id": "casa",
        "x-forwarded-for": "203.0.113.8"
      },
      socket: { remoteAddress: "10.0.0.5" }
    },
    res: {
      setHeader(name, value) {
        headers[name] = value;
      }
    }
  };
}

test("cada sesión con JWT tiene su cupo aunque el proxy comparta IP", () => {
  const first = mock("signatureOneAAAA");
  const second = mock("signatureOneAAAA");
  const third = mock("signatureOneAAAA");
  const other = mock("signatureTwoBBBB");
  assert.equal(dakinisEnforceRateLimit(first.req, first.res, menuUrl), null);
  assert.equal(dakinisEnforceRateLimit(second.req, second.res, menuUrl), null);
  const blocked = dakinisEnforceRateLimit(third.req, third.res, menuUrl);
  assert.equal(blocked.status, 429);
  assert.equal(blocked.body.error.code, "RATE_LIMIT_EXCEEDED");
  assert.ok(Number(third.headers["Retry-After"]) >= 1);
  assert.equal(dakinisEnforceRateLimit(other.req, other.res, menuUrl), null);
});

test("sin bearer el cupo sigue siendo el del IP", () => {
  const first = mock("");
  const second = mock("");
  const third = mock("");
  assert.equal(dakinisEnforceRateLimit(first.req, first.res, menuUrl), null);
  assert.equal(dakinisEnforceRateLimit(second.req, second.res, menuUrl), null);
  assert.equal(dakinisEnforceRateLimit(third.req, third.res, menuUrl).status, 429);
});
