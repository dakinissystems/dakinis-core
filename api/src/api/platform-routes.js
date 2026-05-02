import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import {
  dakinisIsValidBusinessTypeKey,
  dakinisNormalizeBusinessTypeKey
} from "@dakinis/shared/catalog/business-type-display.js";
import { dakinisGetDb } from "../db/index.js";
import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";

function dakinisParseJson(rawBody) {
  try {
    return JSON.parse(rawBody || "{}");
  } catch {
    return null;
  }
}

export function dakinisHandlePlatformBusinessCreate(rawBody) {
  const body = dakinisParseJson(rawBody);
  if (body === null) {
    return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const type = dakinisNormalizeBusinessTypeKey(typeof body.type === "string" ? body.type : "");
  const plan =
    typeof body.plan === "string" && body.plan.trim() ? body.plan.trim() : "starter";

  if (!name || !slug || !type) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "name, slug y type son obligatorios");
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "slug: solo minusculas, numeros y guiones");
  }
  if (!dakinisIsValidBusinessTypeKey(type, { allowPlatform: false })) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "type: usa clinica, peluqueria, restaurante, inmobiliaria o una clave personalizada (minusculas, numeros, guiones, 2-48 caracteres). No uses platform al crear.");
  }

  const db = dakinisGetDb();
  const exists = db.prepare("SELECT id FROM business WHERE lower(slug) = lower(?)").get(slug);
  if (exists) {
    return dakinisJsonError(409, "SLUG_TAKEN", "Ya existe un negocio con ese slug");
  }

  const ownerEmail =
    typeof body.ownerEmail === "string" ? body.ownerEmail.trim().toLowerCase() : "";
  const ownerPassword = typeof body.ownerPassword === "string" ? body.ownerPassword : "";

  if (ownerEmail || ownerPassword) {
    if (!ownerEmail || !ownerPassword) {
      return dakinisJsonError(
        400,
        "VALIDATION_ERROR",
        "Para crear el primer administrador incluye ownerEmail y ownerPassword"
      );
    }
    if (ownerPassword.length < 8) {
      return dakinisJsonError(400, "VALIDATION_ERROR", "ownerPassword: minimo 8 caracteres");
    }
    const emailTaken = db.prepare("SELECT id FROM users WHERE lower(email) = lower(?)").get(ownerEmail);
    if (emailTaken) {
      return dakinisJsonError(409, "EMAIL_TAKEN", "Ya existe un usuario con ownerEmail");
    }
  }

  const id = `biz_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const uid =
    ownerEmail && ownerPassword ? `usr_${randomUUID().replace(/-/g, "").slice(0, 16)}` : null;
  const passwordHash =
    ownerEmail && ownerPassword ? bcrypt.hashSync(ownerPassword, 10) : null;

  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO business (id, slug, name, type, plan, config_json)
       VALUES (?, ?, ?, ?, ?, NULL)`
    ).run(id, slug, name, type, plan);
    if (uid && passwordHash) {
      db.prepare(
        `INSERT INTO users (id, business_id, email, password_hash, role, totp_secret, totp_enabled)
         VALUES (?, ?, ?, ?, 'admin', NULL, 0)`
      ).run(uid, id, ownerEmail, passwordHash);
    }
  });
  tx();

  let initialUser = null;
  if (uid) {
    initialUser = db.prepare(`SELECT id, email, role, created_at FROM users WHERE id = ?`).get(uid);
  }

  const row = db.prepare("SELECT id, slug, name, type, plan, created_at FROM business WHERE id = ?").get(id);
  return dakinisJsonSuccess({ business: row, initialUser }, "platform", {});
}

export function dakinisHandlePlatformBusinessUpdate(businessId, rawBody) {
  const id = typeof businessId === "string" ? businessId.trim() : "";
  if (!id) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "id de negocio invalido");
  }
  const body = dakinisParseJson(rawBody);
  if (body === null) {
    return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  }

  const db = dakinisGetDb();
  const existing = db.prepare("SELECT * FROM business WHERE id = ?").get(id);
  if (!existing) {
    return dakinisJsonError(404, "NOT_FOUND", "Negocio no encontrado");
  }

  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  let slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : undefined;
  const typeRaw = typeof body.type === "string" ? body.type : "";
  const type =
    typeRaw === "" ? undefined : dakinisNormalizeBusinessTypeKey(typeRaw);
  const plan = typeof body.plan === "string" ? body.plan.trim() : undefined;

  if (slug !== undefined) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return dakinisJsonError(400, "VALIDATION_ERROR", "slug: solo minusculas, numeros y guiones");
    }
    if (slug !== existing.slug) {
      const clash = db.prepare("SELECT id FROM business WHERE lower(slug) = lower(?) AND id != ?").get(slug, id);
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
  const nextPlan = plan !== undefined && plan !== "" ? plan : existing.plan;

  db.prepare(`UPDATE business SET name = ?, slug = ?, type = ?, plan = ? WHERE id = ?`).run(
    nextName,
    nextSlug,
    nextType,
    nextPlan,
    id
  );

  const row = db.prepare("SELECT id, slug, name, type, plan, created_at FROM business WHERE id = ?").get(id);
  return dakinisJsonSuccess({ business: row }, "platform", {});
}

export function dakinisHandlePlatformBusinesses() {
  const db = dakinisGetDb();
  const rows = db
    .prepare(
      `SELECT id, slug, name, type, plan, created_at
       FROM business
       ORDER BY name COLLATE NOCASE`
    )
    .all();
  return dakinisJsonSuccess({ businesses: rows }, "platform", {});
}

export function dakinisHandlePlatformUsers() {
  const db = dakinisGetDb();
  const rows = db
    .prepare(
      `SELECT u.id, u.email, u.role, u.created_at,
              b.slug AS business_slug, b.name AS business_name, b.type AS business_type, b.plan AS business_plan
       FROM users u
       JOIN business b ON b.id = u.business_id
       ORDER BY b.name COLLATE NOCASE, u.email COLLATE NOCASE`
    )
    .all();
  return dakinisJsonSuccess({ users: rows }, "platform", {});
}
