import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { dakinisQueryOne, dakinisRun } from "../db/query.js";
import {
  getPlatformJwtAudience,
  getPlatformJwtIssuer
} from "./jwt-verify.js";

const SSO_PASSWORD_PLACEHOLDER = "__dakinis_sso_no_local_login__";

export function dakinisIsPlatformIdpPayload(payload) {
  if (!payload || typeof payload !== "object") return false;
  const iss = typeof payload.iss === "string" ? payload.iss.trim() : "";
  return iss === getPlatformJwtIssuer();
}

function dakinisMapPlatformRoleToCoreRole(platformRole) {
  const r = String(platformRole || "user").toLowerCase();
  if (r === "platform_admin") return "platform_admin";
  if (r === "admin" || r === "owner" || r === "tenant_admin") return "admin";
  return "member";
}

async function dakinisSyncUserRoleFromIdp(user, payload) {
  const mapped = dakinisMapPlatformRoleToCoreRole(payload.role);
  if (mapped === user.role) return user;
  await dakinisRun("UPDATE users SET role = ? WHERE id = ?", [mapped, user.id]);
  return dakinisQueryOne("SELECT * FROM users WHERE id = ?", [user.id]);
}

/**
 * Resuelve o crea usuario enlazado al IdP (UUID sub + email).
 */
export async function dakinisResolveCoreUserFromPlatformToken(payload, targetBusiness) {
  const platformSub = String(payload.sub || "").trim();
  const email =
    typeof payload.email === "string" ? payload.email.toLowerCase().trim() : "";
  if (!platformSub || !email) {
    const err = new Error("INVALID_PLATFORM_IDENTITY");
    err.code = "INVALID_PLATFORM_IDENTITY";
    throw err;
  }

  let user = await dakinisQueryOne("SELECT * FROM users WHERE platform_user_id = ?", [platformSub]);
  if (!user) {
    user = await dakinisQueryOne("SELECT * FROM users WHERE lower(email) = ?", [email]);
  }

  if (user) {
    if (user.business_id !== targetBusiness.id) {
      const err = new Error("PLATFORM_USER_TENANT_MISMATCH");
      err.code = "PLATFORM_USER_TENANT_MISMATCH";
      throw err;
    }
    if (!user.platform_user_id) {
      await dakinisRun("UPDATE users SET platform_user_id = ? WHERE id = ?", [platformSub, user.id]);
      user = await dakinisQueryOne("SELECT * FROM users WHERE id = ?", [user.id]);
    }
    user = await dakinisSyncUserRoleFromIdp(user, payload);
    return user;
  }

  const allowProvision =
    String(process.env.DAKINIS_AUTH_EXCHANGE_AUTO_PROVISION || "").toLowerCase() === "true" ||
    process.env.NODE_ENV !== "production";
  if (!allowProvision) {
    const err = new Error("USER_NOT_PROVISIONED");
    err.code = "USER_NOT_PROVISIONED";
    throw err;
  }

  const newId = `usr_plat_${platformSub.replace(/-/g, "") || randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const role = dakinisMapPlatformRoleToCoreRole(payload.role);
  const passwordHash = bcrypt.hashSync(SSO_PASSWORD_PLACEHOLDER, 10);
  await dakinisRun(
    `INSERT INTO users (id, business_id, email, password_hash, role, platform_user_id, totp_enabled)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [newId, targetBusiness.id, email, passwordHash, role, platformSub, false]
  );

  return dakinisQueryOne("SELECT * FROM users WHERE id = ?", [newId]);
}

export async function dakinisResolvePlatformTenantClaimToBusinessId(rawSlug) {
  const slug = String(rawSlug || "").trim();
  if (!slug) return "";
  const byId = await dakinisQueryOne("SELECT id FROM business WHERE id = ?", [slug]);
  if (byId) return byId.id;
  const bySlug = await dakinisQueryOne("SELECT id FROM business WHERE lower(slug) = lower(?)", [slug]);
  return bySlug ? bySlug.id : "";
}

export function dakinisVerifyPlatformAccessTokenOnly(token, secret) {
  return jwt.verify(token, secret, {
    algorithms: ["HS256"],
    issuer: getPlatformJwtIssuer(),
    audience: getPlatformJwtAudience()
  });
}
