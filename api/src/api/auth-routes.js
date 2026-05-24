import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import {
  dakinisListModulesForPlan,
  dakinisNormalizeCommercialPlan
} from "@dakinis/shared/catalog/plan-modules.js";
import { dakinisQueryOne } from "../db/query.js";
import { dakinisSignUserToken, dakinisGetJwtSecret } from "./auth-tenant.js";
import { dakinisJsonSuccess, dakinisJsonError } from "./responses.js";
import { dakinisResolveBusinessFromHeader } from "./business-context.js";
import {
  dakinisVerifyPlatformAccessTokenOnly,
  dakinisResolveCoreUserFromPlatformToken
} from "./platform-user-bridge.js";

function dakinisParseLoginBody(rawBody) {
  if (!rawBody) return {};
  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
}

function dakinisIsTotpEnabled(user) {
  return Number(user.totp_enabled) === 1 || user.totp_enabled === true;
}

export async function dakinisHandleAuthLogin(rawBody) {
  const body = dakinisParseLoginBody(rawBody);
  if (body === null) {
    return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "email y password son obligatorios");
  }

  const user = await dakinisQueryOne("SELECT * FROM users WHERE lower(email) = lower(?)", [email]);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return dakinisJsonError(401, "INVALID_CREDENTIALS", "Credenciales invalidas");
  }

  if (user.role === "platform_admin" && dakinisIsTotpEnabled(user)) {
    const totpToken =
      typeof body.totpCode === "string" ? body.totpCode.trim().replace(/\s+/g, "") : "";
    if (!totpToken) {
      return dakinisJsonError(401, "TOTP_REQUIRED", "Introduce el codigo de autenticacion (TOTP)", {});
    }
    const secret = typeof user.totp_secret === "string" ? user.totp_secret.trim() : "";
    if (!secret) {
      return dakinisJsonError(500, "TOTP_MISCONFIGURED", "TOTP activado pero sin secreto en base de datos");
    }
    const ok = authenticator.verify({ token: totpToken, secret });
    if (!ok) {
      return dakinisJsonError(401, "INVALID_TOTP", "Codigo TOTP invalido");
    }
  }

  const business = await dakinisQueryOne("SELECT * FROM business WHERE id = ?", [user.business_id]);
  if (!business) {
    return dakinisJsonError(500, "INTERNAL_ERROR", "Negocio asociado no encontrado");
  }

  const token = dakinisSignUserToken(user);

  const planTier = dakinisNormalizeCommercialPlan(business.plan);
  const modulesEnabled = dakinisListModulesForPlan(planTier);

  return dakinisJsonSuccess(
    {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      business: {
        id: business.id,
        slug: business.slug,
        name: business.name,
        type: business.type,
        plan: business.plan,
        planTier,
        modulesEnabled
      }
    },
    business.type,
    { businessId: business.id, businessSlug: business.slug, planTier }
  );
}

export async function dakinisHandleMe(req) {
  const auth = req.dakinisAuth;
  if (!auth || auth.method !== "jwt") {
    return dakinisJsonError(401, "UNAUTHORIZED", "/api/me requiere Authorization: Bearer (JWT tras login)");
  }

  const user = await dakinisQueryOne(
    "SELECT id, business_id, email, role, created_at FROM users WHERE id = ?",
    [auth.userId]
  );

  if (!user) {
    return dakinisJsonError(404, "NOT_FOUND", "Usuario no encontrado");
  }

  const business = await dakinisQueryOne(
    "SELECT id, slug, name, type, plan, created_at FROM business WHERE id = ?",
    [user.business_id]
  );
  if (!business) {
    return dakinisJsonError(404, "NOT_FOUND", "Negocio no encontrado");
  }

  const planTier = dakinisNormalizeCommercialPlan(business.plan);
  const modulesEnabled = dakinisListModulesForPlan(planTier);

  return dakinisJsonSuccess(
    {
      user,
      business: {
        ...business,
        planTier,
        modulesEnabled
      }
    },
    business.type,
    {
      businessId: business.id,
      businessSlug: business.slug,
      planTier
    }
  );
}

/**
 * Intercambia JWT del IdP (`platform/auth`) por sesión core (JWT emitido por core).
 * Body JSON: `businessId` o `businessSlug` (uno obligatorio).
 */
export async function dakinisHandleAuthExchange(req, rawBody) {
  const authHeader = req.headers.authorization;
  const token =
    typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : "";
  if (!token) {
    return dakinisJsonError(401, "UNAUTHORIZED", "Authorization: Bearer con JWT del IdP requerido");
  }

  let body = {};
  try {
    body = rawBody && String(rawBody).trim() ? JSON.parse(rawBody) : {};
  } catch {
    return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  }

  const bizRef =
    (typeof body.businessId === "string" && body.businessId.trim()) ||
    (typeof body.businessSlug === "string" && body.businessSlug.trim()) ||
    "";

  if (!bizRef) {
    return dakinisJsonError(
      400,
      "VALIDATION_ERROR",
      "businessId o businessSlug requerido para enlazar el usuario al tenant"
    );
  }

  const business = await dakinisResolveBusinessFromHeader(bizRef);
  if (!business) {
    return dakinisJsonError(404, "UNKNOWN_TENANT", "Negocio no encontrado", { tenantRef: bizRef });
  }

  let payload;
  try {
    payload = dakinisVerifyPlatformAccessTokenOnly(token, dakinisGetJwtSecret());
  } catch {
    return dakinisJsonError(401, "INVALID_TOKEN", "JWT del IdP invalido o expirado");
  }

  let user;
  try {
    user = await dakinisResolveCoreUserFromPlatformToken(payload, business);
  } catch (e) {
    const code = e && e.code;
    if (code === "PLATFORM_USER_TENANT_MISMATCH") {
      return dakinisJsonError(
        403,
        "PLATFORM_USER_TENANT_MISMATCH",
        "El email ya esta vinculado a otro negocio en core"
      );
    }
    return dakinisJsonError(
      400,
      "INVALID_PLATFORM_IDENTITY",
      e instanceof Error ? e.message : "Identidad invalida"
    );
  }

  const coreJwt = dakinisSignUserToken(user);
  const planTier = dakinisNormalizeCommercialPlan(business.plan);
  const modulesEnabled = dakinisListModulesForPlan(planTier);

  return dakinisJsonSuccess(
    {
      token: coreJwt,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      business: {
        id: business.id,
        slug: business.slug,
        name: business.name,
        type: business.type,
        plan: business.plan,
        planTier,
        modulesEnabled
      }
    },
    business.type,
    { businessId: business.id, businessSlug: business.slug, planTier }
  );
}
