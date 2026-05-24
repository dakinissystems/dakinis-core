import { dakinisQueryOne } from "../db/query.js";

export async function dakinisResolveBusinessFromHeader(businessIdHeader) {
  if (businessIdHeader === undefined || businessIdHeader === null) return null;
  const raw = String(businessIdHeader).trim();
  if (!raw) return null;

  const byId = await dakinisQueryOne("SELECT * FROM business WHERE id = ?", [raw]);
  if (byId) return byId;

  return (
    (await dakinisQueryOne("SELECT * FROM business WHERE lower(slug) = lower(?)", [raw])) || null
  );
}
