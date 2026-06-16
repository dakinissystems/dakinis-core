import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import {
  dakinisIsValidBusinessTypeKey,
  dakinisNormalizeBusinessTypeKey
} from "@dakinis/shared/catalog/business-type-display.js";
import { dakinisParseCommercialPlanForStorage } from "@dakinis/shared/catalog/plan-modules.js";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun, dakinisWithTransaction } from "../db/query.js";
import { dakinisSqlOrderEmail } from "../db/dialect.js";
import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import { dakinisPublishEvent } from "../lib/event-bus.js";
import {
  dakinisBuildInitialBusinessConfig,
  dakinisSeedDefaultBranchAsync,
  dakinisSeedIndustryModuleOverrides
} from "../services/tenant-intelligence-store.js";
import { dakinisGetIndustryTemplate } from "@dakinis/shared/catalog/business-templates.js";
import { dakinisResolveDbDriver } from "../db/dialect.js";
import {
  dakinisGenerateTempPassword,
  dakinisIssuePasswordResetForUser,
  dakinisResendPasswordResetForUserId,
  dakinisSendOnboardingEmail
} from "../services/password-reset.js";
import {
  dakinisApplyAdminTenantAccess
} from "../services/tenant-access-store.js";

function dakinisParseJson(rawBody) {
  try {
    return JSON.parse(rawBody || "{}");
  } catch {
    return null;
  }
}

export async function dakinisHandlePlatformBusinessCreate(rawBody) {
  const body = dakinisParseJson(rawBody);
  if (body === null) {
    return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const type = dakinisNormalizeBusinessTypeKey(typeof body.type === "string" ? body.type : "");
  const planParsed = dakinisParseCommercialPlanForStorage(
    typeof body.plan === "string" && body.plan.trim() ? body.plan.trim() : "starter"
  );
  if (planParsed === null) {
    return dakinisJsonError(400, "INVALID_PLAN", "plan debe ser starter, growth o pro (aliases: advanced, enterprise -> pro)");
  }

  if (!name || !slug || !type) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "name, slug y type son obligatorios");
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "slug: solo minusculas, numeros y guiones");
  }
  if (!dakinisIsValidBusinessTypeKey(type, { allowPlatform: false })) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "type: usa un perfil de industria (clinica, restaurante, gimnasio, retail…) o clave personalizada 2-48 caracteres. No uses platform al crear.");
  }

  const exists = await dakinisQueryOne("SELECT id FROM business WHERE lower(slug) = lower(?)", [slug]);
  if (exists) {
    return dakinisJsonError(409, "SLUG_TAKEN", "Ya existe un negocio con ese slug");
  }

  const ownerEmail =
    typeof body.ownerEmail === "string" ? body.ownerEmail.trim().toLowerCase() : "";
  const ownerPasswordRaw = typeof body.ownerPassword === "string" ? body.ownerPassword : "";
  const sendCredentials = body.sendCredentials !== false;

  if (ownerPasswordRaw && !ownerEmail) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "ownerEmail es obligatorio si indicas contraseña");
  }

  let ownerPassword = ownerPasswordRaw;
  if (ownerEmail) {
    if (!ownerPassword) {
      ownerPassword = dakinisGenerateTempPassword();
    } else if (ownerPassword.length < 8) {
      return dakinisJsonError(400, "VALIDATION_ERROR", "ownerPassword: minimo 8 caracteres");
    }
    const emailTaken = await dakinisQueryOne("SELECT id FROM users WHERE lower(email) = lower(?)", [ownerEmail]);
    if (emailTaken) {
      return dakinisJsonError(409, "EMAIL_TAKEN", "Ya existe un usuario con ownerEmail");
    }
  }

  const id = `biz_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const uid = ownerEmail ? `usr_${randomUUID().replace(/-/g, "").slice(0, 16)}` : null;
  const passwordHash = ownerEmail ? bcrypt.hashSync(ownerPassword, 10) : null;
  const mustChangePassword = dakinisResolveDbDriver() === "postgres" ? true : 1;
  const configJson = await dakinisBuildInitialBusinessConfig(type);
  const industryTemplate = dakinisGetIndustryTemplate(type);

  await dakinisWithTransaction(async (tx) => {
    await tx.run(
      `INSERT INTO business (id, slug, name, type, plan, config_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, slug, name, type, planParsed, configJson]
    );
    if (uid && passwordHash) {
      await tx.run(
        `INSERT INTO users (id, business_id, email, password_hash, role, totp_secret, totp_enabled, must_change_password)
         VALUES (?, ?, ?, ?, 'owner', NULL, ?, ?)`,
        [uid, id, ownerEmail, passwordHash, 0, mustChangePassword]
      );
    }
  });

  let initialUser = null;
  if (uid) {
    initialUser = await dakinisQueryOne(
      `SELECT id, email, role, created_at FROM users WHERE id = ?`,
      [uid]
    );
  }

  const row = await dakinisQueryOne(
    "SELECT id, slug, name, type, plan, created_at FROM business WHERE id = ?",
    [id]
  );

  await dakinisSeedDefaultBranchAsync(id, name, slug);
  await dakinisSeedIndustryModuleOverrides(id, type, planParsed);

  await dakinisPublishEvent("tenant.created", {
    tenantId: id,
    slug,
    name,
    type,
    plan: planParsed,
    ownerUserId: uid ?? null,
    industryTemplate: industryTemplate?.key || type
  });

  let credentialsDelivery = null;
  if (uid && ownerEmail && sendCredentials) {
    const userRow = await dakinisQueryOne("SELECT * FROM users WHERE id = ?", [uid]);
    const { resetUrl } = await dakinisIssuePasswordResetForUser(uid);
    const mail = await dakinisSendOnboardingEmail({
      user: userRow,
      business: row,
      tempPassword: ownerPassword,
      resetUrl
    });
    credentialsDelivery = {
      email: ownerEmail,
      emailSent: mail.ok,
      mailError: mail.ok ? undefined : mail.error,
      resetUrl: mail.ok ? undefined : resetUrl,
      tempPassword: mail.ok ? undefined : ownerPassword
    };
  }

  return dakinisJsonSuccess(
    {
      business: row,
      initialUser,
      credentialsDelivery,
      onboarding: {
        title: industryTemplate?.onboardingTitle || "Configura tu negocio",
        steps: industryTemplate?.onboardingSteps || [],
        autoModules: industryTemplate?.autoModules || []
      }
    },
    "platform",
    {}
  );
}

export async function dakinisHandlePlatformBusinessUpdate(businessId, rawBody) {
  const id = typeof businessId === "string" ? businessId.trim() : "";
  if (!id) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "id de negocio invalido");
  }
  const body = dakinisParseJson(rawBody);
  if (body === null) {
    return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  }

  const existing = await dakinisQueryOne("SELECT * FROM business WHERE id = ?", [id]);
  if (!existing) {
    return dakinisJsonError(404, "NOT_FOUND", "Negocio no encontrado");
  }

  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  let slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : undefined;
  const typeRaw = typeof body.type === "string" ? body.type : "";
  const type =
    typeRaw === "" ? undefined : dakinisNormalizeBusinessTypeKey(typeRaw);
  const plan = typeof body.plan === "string" ? body.plan.trim() : undefined;

  if (plan !== undefined && plan !== "") {
    const planParsed = dakinisParseCommercialPlanForStorage(plan);
    if (planParsed === null) {
      return dakinisJsonError(400, "INVALID_PLAN", "plan debe ser starter, growth o pro (aliases: advanced, enterprise -> pro)");
    }
  }

  if (slug !== undefined) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return dakinisJsonError(400, "VALIDATION_ERROR", "slug: solo minusculas, numeros y guiones");
    }
    if (slug !== existing.slug) {
      const clash = await dakinisQueryOne(
        "SELECT id FROM business WHERE lower(slug) = lower(?) AND id != ?",
        [slug, id]
      );
      if (clash) {
        return dakinisJsonError(409, "SLUG_TAKEN", "Ya existe otro negocio con ese slug");
      }
    }
  }
  if (type !== undefined && !dakinisIsValidBusinessTypeKey(type, { allowPlatform: true })) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "type no valido (presets, platform o clave personalizada 2-48 caracteres)");
  }
  if (name !== undefined && !name) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "name no puede estar vacio");
  }

  const nextName = name !== undefined ? name : existing.name;
  const nextSlug = slug !== undefined ? slug : existing.slug;
  const nextType = type !== undefined ? type : existing.type;
  const nextPlan =
    plan !== undefined && plan !== ""
      ? dakinisParseCommercialPlanForStorage(plan)
      : existing.plan;

  await dakinisRun(`UPDATE business SET name = ?, slug = ?, type = ?, plan = ? WHERE id = ?`, [
    nextName,
    nextSlug,
    nextType,
    nextPlan,
    id
  ]);

  const row = await dakinisQueryOne(
    "SELECT id, slug, name, type, plan, created_at FROM business WHERE id = ?",
    [id]
  );

  await dakinisPublishEvent("tenant.updated", {
    tenantId: id,
    slug: nextSlug,
    type: nextType,
    plan: nextPlan
  });

  return dakinisJsonSuccess({ business: row }, "platform", {});
}

export async function dakinisHandlePlatformBusinesses() {
  const orderName = dakinisSqlOrderEmail("name");
  const rows = await dakinisQueryAll(
    `SELECT b.id, b.slug, b.name, b.type, b.plan, b.created_at,
            ts.status AS stripe_status,
            ts.access_state,
            ts.access_reason,
            ts.entitled_plan,
            ts.closed_at
       FROM business b
       LEFT JOIN tenant_subscriptions ts ON ts.business_id = b.id
       ORDER BY ${orderName}`
  );
  return dakinisJsonSuccess({ businesses: rows }, "platform", {});
}

export async function dakinisHandlePlatformUsers() {
  const orderBiz = dakinisSqlOrderEmail("b.name");
  const orderEmail = dakinisSqlOrderEmail("u.email");
  const rows = await dakinisQueryAll(
    `SELECT u.id, u.email, u.role, u.created_at, u.must_change_password, u.confirmed_at,
              b.id AS business_id, b.slug AS business_slug, b.name AS business_name, b.type AS business_type, b.plan AS business_plan
       FROM users u
       JOIN business b ON b.id = u.business_id
       ORDER BY ${orderBiz}, ${orderEmail}`
  );
  return dakinisJsonSuccess({ users: rows }, "platform", {});
}

export async function dakinisHandlePlatformUserPatch(userId, rawBody) {
  const id = typeof userId === "string" ? userId.trim() : "";
  if (!id) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "id de usuario invalido");
  }
  const body = dakinisParseJson(rawBody);
  if (body === null) {
    return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  }

  const target = await dakinisQueryOne("SELECT * FROM users WHERE id = ?", [id]);
  if (!target) {
    return dakinisJsonError(404, "NOT_FOUND", "Usuario no encontrado");
  }
  if (target.role === "platform_admin") {
    return dakinisJsonError(403, "FORBIDDEN", "No se puede editar platform_admin desde esta ruta");
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined;
  if (email !== undefined) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return dakinisJsonError(400, "VALIDATION_ERROR", "email invalido");
    }
    if (email !== target.email) {
      const clash = await dakinisQueryOne("SELECT id FROM users WHERE lower(email) = lower(?) AND id != ?", [
        email,
        id
      ]);
      if (clash) {
        return dakinisJsonError(409, "EMAIL_TAKEN", "Ya existe un usuario con ese email");
      }
      await dakinisRun("UPDATE users SET email = ? WHERE id = ?", [email, id]);
    }
  }

  const row = await dakinisQueryOne(
    `SELECT u.id, u.email, u.role, u.created_at, u.must_change_password, u.confirmed_at,
            b.slug AS business_slug, b.name AS business_name
     FROM users u
     JOIN business b ON b.id = u.business_id
     WHERE u.id = ?`,
    [id]
  );
  return dakinisJsonSuccess({ user: row }, "platform", {});
}

export async function dakinisHandlePlatformUserResendReset(userId) {
  const id = typeof userId === "string" ? userId.trim() : "";
  if (!id) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "id de usuario invalido");
  }
  const target = await dakinisQueryOne("SELECT * FROM users WHERE id = ?", [id]);
  if (!target) {
    return dakinisJsonError(404, "NOT_FOUND", "Usuario no encontrado");
  }
  if (target.role === "platform_admin") {
    return dakinisJsonError(403, "FORBIDDEN", "No aplica a platform_admin");
  }

  const result = await dakinisResendPasswordResetForUserId(id);
  if (!result.ok) {
    return dakinisJsonError(404, result.code || "NOT_FOUND", result.message || "Usuario no encontrado");
  }
  return dakinisJsonSuccess(
    {
      email: target.email,
      emailSent: result.emailSent,
      mailError: result.mailError,
      resetUrl: result.resetUrl,
      devToken: result.devToken
    },
    "platform",
    {}
  );
}

export async function dakinisHandlePlatformBusinessAccessPatch(businessId, rawBody) {
  const id = typeof businessId === "string" ? businessId.trim() : "";
  if (!id) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "id de negocio invalido");
  }
  const body = dakinisParseJson(rawBody);
  if (body === null) {
    return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  }
  const action = typeof body.action === "string" ? body.action.trim().toLowerCase() : "";
  if (!["suspend", "reactivate", "close"].includes(action)) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "action debe ser suspend, reactivate o close");
  }

  const result = await dakinisApplyAdminTenantAccess(id, {
    action,
    reason: body.reason,
    note: body.note
  });
  if (!result.ok) {
    const code = result.reason === "platform_account_protected" ? "FORBIDDEN" : "VALIDATION_ERROR";
    return dakinisJsonError(result.reason === "business_not_found" ? 404 : 400, code, result.reason);
  }

  const business = await dakinisQueryOne(
    `SELECT b.id, b.slug, b.name, b.type, b.plan, b.created_at,
            ts.status AS stripe_status, ts.access_state, ts.access_reason, ts.entitled_plan, ts.closed_at
     FROM business b
     LEFT JOIN tenant_subscriptions ts ON ts.business_id = b.id
     WHERE b.id = ?`,
    [id]
  );

  await dakinisPublishEvent("tenant.access.changed", {
    tenantId: id,
    action,
    accessState: result.accessState,
    reason: body.reason || null
  });

  return dakinisJsonSuccess({ business, access: result }, "platform", {});
}

export async function dakinisHandlePlatformBusinessDelete(businessId, rawBody) {
  const body = dakinisParseJson(rawBody || "{}") || {};
  return dakinisHandlePlatformBusinessAccessPatch(
    businessId,
    JSON.stringify({
      action: "close",
      reason: body.reason || "admin_other",
      note: body.note || "Eliminado desde panel plataforma"
    })
  );
}
