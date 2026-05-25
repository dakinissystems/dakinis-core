import { dakinisResolveDbDriver } from "./dialect.js";

/** Alias lógicos → schema físico en Supabase. */
const DAKINIS_SCHEMA_ALIASES = Object.freeze({
  core: "dakinis_core",
  core_prod: "dakinis_core_prod",
  core_dev: "dakinis_core_dev",
  auth: "dakinis_auth"
});

function dakinisResolveSchemaName(raw) {
  const key = String(raw || "").trim().toLowerCase();
  if (!key) return "";
  if (DAKINIS_SCHEMA_ALIASES[key]) return DAKINIS_SCHEMA_ALIASES[key];
  return key.replace(/[^a-z0-9_]/gi, "") || "dakinis_core";
}

/**
 * Schema PostgreSQL — Supabase + Railway.
 *
 * Supabase prod (Core Back):  POSTGRES_SCHEMA=dakinis_core_prod  o  DB_SCHEMA=core_prod
 * Supabase staging:           POSTGRES_SCHEMA=dakinis_core_dev
 * Docker local:               dakinis_core (default dev)
 */
export function dakinisPostgresSchema() {
  const explicit = String(process.env.POSTGRES_SCHEMA || process.env.DB_SCHEMA || "").trim();
  if (explicit) return dakinisResolveSchemaName(explicit);

  if (process.env.NODE_ENV === "production") {
    return "dakinis_core_prod";
  }
  return dakinisResolveSchemaName(process.env.POSTGRES_SCHEMA_DEV || "dakinis_core");
}

/** En producción con Postgres, el seed demo está desactivado salvo override explícito. */
export function dakinisShouldSeedDemo() {
  const raw = String(process.env.CORE_SEED_DEMO ?? "").trim().toLowerCase();
  if (raw === "true" || raw === "1") return true;
  if (raw === "false" || raw === "0") return false;
  if (process.env.NODE_ENV === "production" && dakinisResolveDbDriver() === "postgres") {
    return false;
  }
  return true;
}
