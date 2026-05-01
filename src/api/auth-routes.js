import bcrypt from "bcryptjs";
import { dakinisGetDb } from "../db/index.js";
import { dakinisSignUserToken } from "./auth-tenant.js";
import { dakinisJsonSuccess, dakinisJsonError } from "./responses.js";

function dakinisParseLoginBody(rawBody) {
  if (!rawBody) return {};
  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
}

export function dakinisHandleAuthLogin(rawBody) {
  const body = dakinisParseLoginBody(rawBody);
  if (body === null) {
    return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "email y password son obligatorios");
  }

  const db = dakinisGetDb();
  const user = db.prepare("SELECT * FROM users WHERE lower(email) = lower(?)").get(email);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return dakinisJsonError(401, "INVALID_CREDENTIALS", "Credenciales invalidas");
  }

  const business = db.prepare("SELECT * FROM business WHERE id = ?").get(user.business_id);
  if (!business) {
    return dakinisJsonError(500, "INTERNAL_ERROR", "Negocio asociado no encontrado");
  }

  const token = dakinisSignUserToken(user);

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
        plan: business.plan
      }
    },
    business.type,
    { businessId: business.id, businessSlug: business.slug }
  );
}

export function dakinisHandleMe(req) {
  const auth = req.dakinisAuth;
  if (!auth || auth.method !== "jwt") {
    return dakinisJsonError(401, "UNAUTHORIZED", "/api/me requiere Authorization: Bearer (JWT tras login)");
  }

  const db = dakinisGetDb();
  const user = db
    .prepare("SELECT id, business_id, email, role, created_at FROM users WHERE id = ?")
    .get(auth.userId);

  if (!user) {
    return dakinisJsonError(404, "NOT_FOUND", "Usuario no encontrado");
  }

  const business = db.prepare("SELECT id, slug, name, type, plan, created_at FROM business WHERE id = ?").get(user.business_id);
  if (!business) {
    return dakinisJsonError(404, "NOT_FOUND", "Negocio no encontrado");
  }

  return dakinisJsonSuccess({ user, business }, business.type, {
    businessId: business.id,
    businessSlug: business.slug
  });
}
