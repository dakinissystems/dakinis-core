import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun } from "../db/query.js";
import { dakinisIsPostgresDriver } from "../db/postgres.js";
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

/** Owner y admin operan como admin. Member opera como member. Viewer no entra. */
export function dakinisCoreRoleFromWorkspaceMembership(workspaceRole) {
  const r = String(workspaceRole || "").toLowerCase();
  if (r === "owner" || r === "admin") return "admin";
  if (r === "member") return "member";
  return null;
}

function dakinisMembershipLookupSkipped(err) {
  const msg = String(err?.message || err || "").toLowerCase();
  return (
    err?.code === "42P01" ||
    err?.code === "22P02" ||
    msg.includes("does not exist") ||
    msg.includes("no such table") ||
    msg.includes("invalid input syntax")
  );
}

async function dakinisWorkspaceRoleForBusiness(platformSub, businessSlug) {
  if (!dakinisIsPostgresDriver()) return null;
  const slug = String(businessSlug || "").trim();
  const sub = String(platformSub || "").trim();
  if (!slug || !sub) return null;
  try {
    const row = await dakinisQueryOne(
      `SELECT wm.role
       FROM meta.workspaces w
       INNER JOIN meta.workspace_members wm ON wm.workspace_id = w.id
       WHERE wm.user_id = ?::uuid
         AND wm.status = 'active'
         AND lower(coalesce(nullif(w.core_tenant_slug, ''), w.slug)) = lower(?)
       ORDER BY CASE wm.role
         WHEN 'owner' THEN 0
         WHEN 'admin' THEN 1
         WHEN 'member' THEN 2
         ELSE 3
       END
       LIMIT 1`,
      [sub, slug]
    );
    return row?.role || null;
  } catch (err) {
    if (dakinisMembershipLookupSkipped(err)) return null;
    throw err;
  }
}

/** Negocios de Core en los que esta persona puede operar. Viewer no entra. */
export async function dakinisListOperatorTenantsForPlatformUser(platformSub) {
  if (!dakinisIsPostgresDriver()) return [];
  const sub = String(platformSub || "").trim();
  if (!sub) return [];
  try {
    const rows = await dakinisQueryAll(
      `SELECT DISTINCT b.slug, b.name
       FROM meta.workspace_members wm
       INNER JOIN meta.workspaces w ON w.id = wm.workspace_id
       INNER JOIN business b
         ON lower(b.slug) = lower(coalesce(nullif(w.core_tenant_slug, ''), w.slug))
       WHERE wm.user_id = ?::uuid
         AND wm.status = 'active'
         AND wm.role IN ('owner', 'admin', 'member')
       ORDER BY b.name ASC`,
      [sub]
    );
    return rows
      .filter((row) => row?.slug)
      .map((row) => ({ slug: String(row.slug), name: String(row.name || row.slug) }));
  } catch (err) {
    if (dakinisMembershipLookupSkipped(err)) return [];
    throw err;
  }
}

async function dakinisSyncUserRoleFromIdp(user, payload, business) {
  const membership = business?.slug
    ? dakinisCoreRoleFromWorkspaceMembership(
        await dakinisWorkspaceRoleForBusiness(payload.sub, business.slug)
      )
    : null;
  const fromToken = dakinisMapPlatformRoleToCoreRole(payload.role);
  let next = membership || fromToken;
  const current = String(user.role || "").toLowerCase();
  const alreadyOperates =
    current === "admin" || current === "tenant_admin" || current === "platform_admin" || current === "owner";
  if (next === "member" && alreadyOperates) {
    next = current === "owner" || current === "tenant_admin" ? "admin" : current;
  }
  if (next === "owner") next = "admin";
  if (next === user.role) return user;
  await dakinisRun("UPDATE users SET role = ? WHERE id = ?", [next, user.id]);
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
    user = await dakinisSyncUserRoleFromIdp(user, payload, targetBusiness);
    return user;
  }

  const allowProvision =
    String(process.env.DAKINIS_AUTH_EXCHANGE_AUTO_PROVISION || "").toLowerCase() === "true" ||
    process.env.NODE_ENV !== "production";
  const membershipRole = allowProvision
    ? null
    : dakinisCoreRoleFromWorkspaceMembership(
        await dakinisWorkspaceRoleForBusiness(platformSub, targetBusiness.slug)
      );
  if (!allowProvision && !membershipRole) {
    const err = new Error("USER_NOT_PROVISIONED");
    err.code = "USER_NOT_PROVISIONED";
    throw err;
  }

  const newId = `usr_plat_${platformSub.replace(/-/g, "") || randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const role = membershipRole || dakinisMapPlatformRoleToCoreRole(payload.role);
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
