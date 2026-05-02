import { dakinisGetDb } from "../db/index.js";
import { dakinisJsonSuccess } from "./responses.js";

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
