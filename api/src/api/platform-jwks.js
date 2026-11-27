import { createPublicKey } from "node:crypto";
import jwt from "jsonwebtoken";
import {
  getPlatformJwtAudience,
  getPlatformJwtIssuer
} from "./jwt-verify.js";

const DEFAULT_JWKS_URL = "https://auth.dakinissystems.com/auth/.well-known/jwks.json";
const CACHE_TTL_MS = 5 * 60 * 1000;

/** @type {{ fetchedAt: number, keys: Map<string, import("node:crypto").KeyObject> } | null} */
let cache = null;

export function dakinisAuthJwksUrl() {
  return (
    String(process.env.AUTH_JWKS_URL || process.env.DAKINIS_AUTH_JWKS_URL || "").trim() ||
    DEFAULT_JWKS_URL
  );
}

function dakinisJwkToKey(jwk) {
  return createPublicKey({ key: jwk, format: "jwk" });
}

async function dakinisFetchJwksKeys(force = false) {
  const now = Date.now();
  if (!force && cache && now - cache.fetchedAt < CACHE_TTL_MS && cache.keys.size > 0) {
    return cache.keys;
  }

  const url = dakinisAuthJwksUrl();
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(5000)
  });
  if (!res.ok) {
    throw new Error(`JWKS fetch failed: HTTP ${res.status}`);
  }
  const doc = await res.json();
  const keys = new Map();
  for (const jwk of Array.isArray(doc?.keys) ? doc.keys : []) {
    if (!jwk || jwk.kty !== "EC") continue;
    const kid = String(jwk.kid || "").trim() || "_";
    try {
      keys.set(kid, dakinisJwkToKey(jwk));
    } catch {
      /* skip bad key */
    }
  }
  if (keys.size === 0) {
    throw new Error("JWKS sin claves EC usables");
  }
  cache = { fetchedAt: now, keys };
  return keys;
}

/**
 * Verifica access token IdP firmado con ES256 (JWKS de Auth).
 * @param {string} token
 */
export async function dakinisVerifyPlatformEs256Token(token) {
  const header = jwt.decode(token, { complete: true })?.header;
  if (!header || header.alg !== "ES256") {
    throw new Error("Not ES256");
  }

  const kid = String(header.kid || "").trim();
  let keys = await dakinisFetchJwksKeys(false);
  let key = (kid && keys.get(kid)) || (keys.size === 1 ? [...keys.values()][0] : null);

  if (!key) {
    keys = await dakinisFetchJwksKeys(true);
    key = (kid && keys.get(kid)) || (keys.size === 1 ? [...keys.values()][0] : null);
  }
  if (!key) {
    throw new Error("JWKS kid no encontrado");
  }

  return jwt.verify(token, key, {
    algorithms: ["ES256"],
    issuer: getPlatformJwtIssuer(),
    audience: getPlatformJwtAudience()
  });
}

/** @param {{ fetchedAt?: number, keys?: Map<string, unknown> } | null} [next] */
export function dakinisResetPlatformJwksCacheForTests(next = null) {
  cache = next;
}
