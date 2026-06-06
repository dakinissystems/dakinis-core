import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { dakinisResolveDbDriver } from "../db/dialect.js";
import { dakinisQueryOne, dakinisRun } from "../db/query.js";
import {
  dakinisIsResendConfigured,
  dakinisOnboardingEmailHtml,
  dakinisPasswordResetEmailHtml,
  dakinisSendResendEmail
} from "../adapters/email/resend-mail.js";

const RESET_TTL_MS = 24 * 60 * 60 * 1000;
const TEMP_PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export function dakinisGenerateTempPassword(length = 12) {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += TEMP_PASSWORD_CHARS[bytes[i] % TEMP_PASSWORD_CHARS.length];
  }
  return out;
}

export function dakinisHashResetToken(plain) {
  return createHash("sha256").update(String(plain)).digest("hex");
}

export function dakinisBuildResetUrl(plainToken) {
  const base = String(
    process.env.CORE_WEB_URL || process.env.CORS_ORIGIN || "https://core.dakinissystems.com"
  ).replace(/\/$/, "");
  return `${base}/reset-password?token=${encodeURIComponent(plainToken)}`;
}

function dakinisResetExpiresIso() {
  return new Date(Date.now() + RESET_TTL_MS).toISOString();
}

function dakinisIsResetExpired(expiresAt) {
  if (!expiresAt) return true;
  const t = new Date(expiresAt).getTime();
  return Number.isNaN(t) || t < Date.now();
}

export async function dakinisIssuePasswordResetForUser(userId) {
  const plainToken = randomBytes(32).toString("hex");
  const tokenHash = dakinisHashResetToken(plainToken);
  const expiresAt = dakinisResetExpiresIso();
  const mustChange = dakinisResolveDbDriver() === "postgres" ? true : 1;

  await dakinisRun(
    `UPDATE users SET password_reset_token_hash = ?, password_reset_expires_at = ?, must_change_password = ? WHERE id = ?`,
    [tokenHash, expiresAt, mustChange, userId]
  );

  return {
    plainToken,
    resetUrl: dakinisBuildResetUrl(plainToken),
    expiresAt
  };
}

export async function dakinisConsumePasswordReset(plainToken, newPassword) {
  const token = String(plainToken || "").trim();
  const password = String(newPassword || "");
  if (!token || token.length < 16) {
    return { ok: false, code: "INVALID_TOKEN", message: "Token invalido" };
  }
  if (password.length < 8) {
    return { ok: false, code: "VALIDATION_ERROR", message: "password: minimo 8 caracteres" };
  }

  const tokenHash = dakinisHashResetToken(token);
  const user = await dakinisQueryOne(
    `SELECT * FROM users WHERE password_reset_token_hash = ?`,
    [tokenHash]
  );
  if (!user) {
    return { ok: false, code: "INVALID_TOKEN", message: "Token invalido o expirado" };
  }
  if (dakinisIsResetExpired(user.password_reset_expires_at)) {
    return { ok: false, code: "TOKEN_EXPIRED", message: "El enlace ha caducado. Solicita uno nuevo." };
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const mustChange = dakinisResolveDbDriver() === "postgres" ? false : 0;
  const confirmedAt = new Date().toISOString();

  await dakinisRun(
    `UPDATE users SET password_hash = ?, must_change_password = ?, password_reset_token_hash = NULL, password_reset_expires_at = NULL, confirmed_at = ? WHERE id = ?`,
    [passwordHash, mustChange, confirmedAt, user.id]
  );

  return { ok: true, userId: user.id };
}

async function dakinisLoadUserBusiness(user) {
  if (!user?.business_id) return null;
  return dakinisQueryOne("SELECT id, slug, name, type, plan FROM business WHERE id = ?", [
    user.business_id
  ]);
}

export async function dakinisSendOnboardingEmail({ user, business, tempPassword, resetUrl }) {
  if (!dakinisIsResendConfigured()) {
    return { ok: false, error: "RESEND_API_KEY not set", skipped: true };
  }
  const html = dakinisOnboardingEmailHtml({
    businessName: business?.name || business?.slug || "tu negocio",
    businessSlug: business?.slug || "",
    tempPassword,
    resetUrl
  });
  return dakinisSendResendEmail({
    to: user.email,
    subject: `Acceso a ${business?.name || "tu negocio"} — Dakinis One`,
    html,
    text: `Negocio: ${business?.name}\nContraseña temporal: ${tempPassword}\nConfirmar: ${resetUrl}`
  });
}

export async function dakinisSendPasswordResetEmail({ user, business, resetUrl }) {
  if (!dakinisIsResendConfigured()) {
    return { ok: false, error: "RESEND_API_KEY not set", skipped: true };
  }
  const html = dakinisPasswordResetEmailHtml({
    businessName: business?.name || "",
    resetUrl
  });
  return dakinisSendResendEmail({
    to: user.email,
    subject: "Restablecer contraseña — Dakinis One",
    html,
    text: `Restablecer contraseña: ${resetUrl}`
  });
}

/** No revela si el email existe (anti-enumeración). */
export async function dakinisRequestPasswordResetByEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) {
    return { ok: true, sent: false };
  }

  const user = await dakinisQueryOne("SELECT * FROM users WHERE lower(email) = lower(?)", [normalized]);
  if (!user || user.role === "platform_admin") {
    return { ok: true, sent: false };
  }

  const business = await dakinisLoadUserBusiness(user);
  const { resetUrl } = await dakinisIssuePasswordResetForUser(user.id);
  const mail = await dakinisSendPasswordResetEmail({ user, business, resetUrl });
  return { ok: true, sent: mail.ok, mailError: mail.ok ? undefined : mail.error };
}

export async function dakinisResendPasswordResetForUserId(userId) {
  const user = await dakinisQueryOne("SELECT * FROM users WHERE id = ?", [userId]);
  if (!user) {
    return { ok: false, code: "NOT_FOUND", message: "Usuario no encontrado" };
  }
  const business = await dakinisLoadUserBusiness(user);
  const { resetUrl, plainToken } = await dakinisIssuePasswordResetForUser(user.id);
  const mail = await dakinisSendPasswordResetEmail({ user, business, resetUrl });
  return {
    ok: true,
    emailSent: mail.ok,
    mailError: mail.ok ? undefined : mail.error,
    resetUrl: mail.ok ? undefined : resetUrl,
    devToken: process.env.NODE_ENV !== "production" && !mail.ok ? plainToken : undefined
  };
}
