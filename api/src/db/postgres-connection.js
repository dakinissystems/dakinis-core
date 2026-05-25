/**
 * Opciones de conexión PostgreSQL — Supabase (pooler 6543) y Railway.
 * @see docs/supabase/SETUP.md
 */

/** @returns {boolean} */
export function dakinisIsSupabasePoolerUrl(connectionString) {
  const u = String(connectionString || "").toLowerCase();
  return u.includes("pooler.supabase.com") || u.includes(":6543/") || u.includes("pgbouncer=true");
}

/**
 * @param {string} connectionString
 * @returns {import("pg").PoolConfig}
 */
export function dakinisBuildPgPoolConfig(connectionString) {
  const useSsl =
    String(process.env.DATABASE_SSL || "").toLowerCase() !== "false" &&
    (dakinisIsSupabasePoolerUrl(connectionString) ||
      String(process.env.DATABASE_SSL || "").toLowerCase() === "true");

  const max = Number(process.env.DATABASE_POOL_MAX || 10);
  const isPooler = dakinisIsSupabasePoolerUrl(connectionString);

  /** @type {import("pg").PoolConfig} */
  const config = {
    connectionString,
    max,
    idleTimeoutMillis: Number(process.env.DATABASE_IDLE_TIMEOUT_MS || 30000),
    connectionTimeoutMillis: Number(process.env.DATABASE_CONNECT_TIMEOUT_MS || 10000)
  };

  if (useSsl) {
    config.ssl = { rejectUnauthorized: false };
  }

  // Supabase transaction pooler (6543): evitar prepared statements en pg
  if (isPooler) {
    config.allowExitOnIdle = true;
  }

  return config;
}
