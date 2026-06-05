import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun } from "../db/query.js";
import { dakinisSqlOrderEmail } from "../db/dialect.js";
import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import {
  dakinisIsValidTenantRole,
  dakinisRoleCanManageUsers
} from "@dakinis/shared/catalog/tenant-roles.js";

const TENANT_USER_ROLES = new Set([
  "admin",
  "member",
  "owner",
  "manager",
  "employee",
  "accountant",
  "marketing",
  "support"
]);

function dakinisParseJson(rawBody) {
  try {
    return JSON.parse(rawBody || "{}");
  } catch {
    return null;
  }
}

/** Solo JWT del usuario humano del negocio con rol `admin`, no API keys. */
export function dakinisRequireTenantJwtAdmin(req) {
  const auth = req.dakinisAuth;
  if (!auth || auth.method !== "jwt") {
    return dakinisJsonError(
      403,
      "FORBIDDEN",
      "La gestion de usuarios del negocio requiere iniciar sesion como administrador (JWT), no API key"
    );
  }
  if (!dakinisRoleCanManageUsers(auth.role)) {
    return dakinisJsonError(403, "FORBIDDEN", "Solo propietario o gerente puede gestionar usuarios");
  }
  return null;
}

function dakinisTenantUsersForbiddenIfPlatform(business) {
  if (String(business.type).toLowerCase() === "platform") {
    return dakinisJsonError(
      403,
      "FORBIDDEN",
      "Los usuarios de plataforma se gestionan con la API /api/platform/*"
    );
  }
  return null;
}

async function dakinisCountAdminsInBusiness(businessId) {
  const row = await dakinisQueryOne(
    `SELECT COUNT(*) AS n FROM users WHERE business_id = ? AND role IN ('admin', 'owner', 'manager')`,
    [businessId]
  );
  const n = row?.n;
  return typeof n === "number" ? n : Number(n) || 0;
}

export async function dakinisHandleTenantUsersGet(req) {
  const bizErr = dakinisTenantUsersForbiddenIfPlatform(req.dakinisBusiness);
  if (bizErr) return bizErr;
  const authErr = dakinisRequireTenantJwtAdmin(req);
  if (authErr) return authErr;

  const orderEmail = dakinisSqlOrderEmail("email");
  const rows = await dakinisQueryAll(
    `SELECT id, email, role, created_at FROM users WHERE business_id = ? ORDER BY ${orderEmail}`,
    [req.dakinisBusiness.id]
  );

  return dakinisJsonSuccess({ users: rows }, req.dakinisBusiness.type, {
    businessId: req.dakinisBusiness.id,
    businessSlug: req.dakinisBusiness.slug
  });
}

export async function dakinisHandleTenantUsersPost(req, rawBody) {
  const bizErr = dakinisTenantUsersForbiddenIfPlatform(req.dakinisBusiness);
  if (bizErr) return bizErr;
  const authErr = dakinisRequireTenantJwtAdmin(req);
  if (authErr) return authErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) {
    return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = typeof body.role === "string" ? body.role.trim().toLowerCase() : "member";

  if (!email || !password) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "email y password son obligatorios");
  }
  if (password.length < 8) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "password: minimo 8 caracteres");
  }
  if (!dakinisIsValidTenantRole(role)) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "role no valido (owner, manager, employee, accountant, marketing, support o legacy admin/member)");
  }

  const exists = await dakinisQueryOne("SELECT id FROM users WHERE lower(email) = lower(?)", [email]);
  if (exists) {
    return dakinisJsonError(409, "EMAIL_TAKEN", "Ya existe un usuario con ese email");
  }

  const id = `usr_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const passwordHash = bcrypt.hashSync(password, 10);

  await dakinisRun(
    `INSERT INTO users (id, business_id, email, password_hash, role, totp_secret, totp_enabled)
     VALUES (?, ?, ?, ?, ?, NULL, ?)`,
    [id, req.dakinisBusiness.id, email, passwordHash, role, 0]
  );

  const row = await dakinisQueryOne(`SELECT id, email, role, created_at FROM users WHERE id = ?`, [id]);

  return dakinisJsonSuccess({ user: row }, req.dakinisBusiness.type, {
    businessId: req.dakinisBusiness.id,
    businessSlug: req.dakinisBusiness.slug
  });
}

export async function dakinisHandleTenantUsersPatch(req, userId, rawBody) {
  const bizErr = dakinisTenantUsersForbiddenIfPlatform(req.dakinisBusiness);
  if (bizErr) return bizErr;
  const authErr = dakinisRequireTenantJwtAdmin(req);
  if (authErr) return authErr;

  const id = typeof userId === "string" ? userId.trim() : "";
  if (!id) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "id de usuario invalido");
  }

  const body = dakinisParseJson(rawBody);
  if (body === null) {
    return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  }

  const target = await dakinisQueryOne("SELECT * FROM users WHERE id = ? AND business_id = ?", [
    id,
    req.dakinisBusiness.id
  ]);

  if (!target) {
    return dakinisJsonError(404, "NOT_FOUND", "Usuario no encontrado en este negocio");
  }

  const roleIn =
    body.role !== undefined && typeof body.role === "string"
      ? body.role.trim().toLowerCase()
      : undefined;
  const newPassword = typeof body.password === "string" ? body.password : undefined;

  if (roleIn !== undefined && !TENANT_USER_ROLES.has(roleIn)) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "role debe ser admin o member");
  }
  if (newPassword !== undefined && newPassword.length > 0 && newPassword.length < 8) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "password: minimo 8 caracteres");
  }

  if (
    roleIn !== undefined &&
    roleIn !== target.role &&
    ["admin", "owner", "manager"].includes(target.role)
  ) {
    const admins = await dakinisCountAdminsInBusiness(req.dakinisBusiness.id);
    if (admins <= 1 && !["admin", "owner", "manager"].includes(roleIn)) {
      return dakinisJsonError(400, "LAST_ADMIN", "Debe existir al menos un propietario o gerente en el negocio");
    }
  }

  const nextRole = roleIn !== undefined ? roleIn : target.role;
  let nextHash = target.password_hash;
  if (newPassword !== undefined && newPassword.length > 0) {
    nextHash = bcrypt.hashSync(newPassword, 10);
  }

  await dakinisRun(`UPDATE users SET role = ?, password_hash = ? WHERE id = ? AND business_id = ?`, [
    nextRole,
    nextHash,
    id,
    req.dakinisBusiness.id
  ]);

  const row = await dakinisQueryOne(`SELECT id, email, role, created_at FROM users WHERE id = ?`, [id]);
  return dakinisJsonSuccess({ user: row }, req.dakinisBusiness.type, {
    businessId: req.dakinisBusiness.id,
    businessSlug: req.dakinisBusiness.slug
  });
}
