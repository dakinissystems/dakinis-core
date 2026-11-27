import assert from "node:assert/strict";
import { generateKeyPairSync, createPublicKey } from "node:crypto";
import test from "node:test";
import jwt from "jsonwebtoken";
import {
  dakinisResetPlatformJwksCacheForTests,
  dakinisVerifyPlatformEs256Token
} from "../src/api/platform-jwks.js";
import { dakinisVerifyPlatformAccessTokenOnly } from "../src/api/platform-user-bridge.js";

function dakinisTestEs256Pair() {
  const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
  const jwk = publicKey.export({ format: "jwk" });
  const kid = "test-kid";
  return {
    privateKey,
    publicKey,
    kid,
    jwk: { ...jwk, kid, use: "sig", alg: "ES256" }
  };
}

test("verifica JWT IdP ES256 con clave JWKS en cache", async () => {
  const pair = dakinisTestEs256Pair();
  const key = createPublicKey({ key: pair.jwk, format: "jwk" });
  dakinisResetPlatformJwksCacheForTests({
    fetchedAt: Date.now(),
    keys: new Map([[pair.kid, key]])
  });

  const token = jwt.sign(
    { sub: "user-1", email: "a@b.c", role: "admin" },
    pair.privateKey,
    {
      algorithm: "ES256",
      keyid: pair.kid,
      issuer: "platform-auth",
      audience: "dakinis-platform",
      expiresIn: "5m"
    }
  );

  const payload = await dakinisVerifyPlatformEs256Token(token);
  assert.equal(payload.sub, "user-1");

  const viaBridge = await dakinisVerifyPlatformAccessTokenOnly(token, "unused-hs-secret");
  assert.equal(viaBridge.sub, "user-1");

  dakinisResetPlatformJwksCacheForTests(null);
});

test("HS256 sigue verificando con secreto compartido", async () => {
  const secret = "test-hs-secret-at-least-32-chars!!";
  const token = jwt.sign(
    { sub: "user-2", email: "c@d.e" },
    secret,
    {
      algorithm: "HS256",
      issuer: "platform-auth",
      audience: "dakinis-platform",
      expiresIn: "5m"
    }
  );
  const payload = await dakinisVerifyPlatformAccessTokenOnly(token, secret);
  assert.equal(payload.sub, "user-2");
});
