/** Postgres 42P01 and SQLite "no such table". Migration 059 is not applied in production. */
export function dakinisIsMissingRelation(err) {
  const msg = String(err?.message || err || "").toLowerCase();
  return (
    msg.includes("no such table") ||
    msg.includes("does not exist") ||
    msg.includes("undefined_table") ||
    err?.code === "42P01"
  );
}
