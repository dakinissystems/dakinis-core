import { dakinisGetDb } from "../db/index.js";

export function dakinisResolveBusinessFromHeader(businessIdHeader) {
  if (businessIdHeader === undefined || businessIdHeader === null) return null;
  const raw = String(businessIdHeader).trim();
  if (!raw) return null;

  const db = dakinisGetDb();
  const byId = db.prepare("SELECT * FROM business WHERE id = ?").get(raw);
  if (byId) return byId;

  return db.prepare("SELECT * FROM business WHERE lower(slug) = lower(?)").get(raw) || null;
}
