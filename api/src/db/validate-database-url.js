/**
 * Valida formato de DATABASE_URL sin exponer credenciales.
 * @param {string} [rawUrl]
 * @returns {{
 *   ok: boolean,
 *   errors: string[],
 *   warnings: string[],
 *   meta: { host: string|null, port: number|null, database: string|null, provider: string, pooler: boolean, sslRecommended: boolean }
 * }}
 */
export function dakinisValidateDatabaseUrl(rawUrl) {
  const errors = [];
  const warnings = [];
  const url = String(rawUrl || process.env.DATABASE_URL || "").trim();

  const meta = {
    host: null,
    port: null,
    database: null,
    provider: "unknown",
    pooler: false,
    sslRecommended: false
  };

  if (!url) {
    errors.push("DATABASE_URL vacío — en Railway Core Back define DATABASE_URL (no DATABASE_URL_CORE).");
    return { ok: false, errors, warnings, meta };
  }

  if (url.includes("REPLACE") || url.includes("PASSWORD") || url.includes("xxx")) {
    errors.push("DATABASE_URL parece plantilla sin reemplazar.");
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    errors.push("DATABASE_URL no es una URI válida (postgresql://...).");
    return { ok: false, errors, warnings, meta };
  }

  if (!["postgresql:", "postgres:"].includes(parsed.protocol)) {
    errors.push(`Protocolo debe ser postgresql:// (actual: ${parsed.protocol})`);
  }

  meta.host = parsed.hostname;
  meta.port = parsed.port ? Number(parsed.port) : 5432;
  meta.database = parsed.pathname?.replace(/^\//, "") || "postgres";

  const host = (meta.host || "").toLowerCase();

  if (host.includes("supabase.com") || host.includes("supabase.co")) {
    meta.provider = "supabase";
    meta.sslRecommended = true;
    meta.pooler = host.includes("pooler") || meta.port === 6543;

    if (!meta.pooler && meta.port === 5432) {
      warnings.push(
        "Supabase: puerto 5432 (direct/session). Para Railway APIs largas suele ir mejor pooler :6543 (Transaction)."
      );
    }
    if (meta.pooler && meta.port !== 6543) {
      warnings.push("Host pooler Supabase pero puerto distinto de 6543 — verifica Connection string en dashboard.");
    }
    if (!parsed.searchParams.has("pgbouncer") && meta.port === 6543) {
      warnings.push("Opcional: añadir ?pgbouncer=true al final de la URI (Transaction pooler).");
    }
  } else if (host.includes("railway") || host.includes("rlwy.net")) {
    meta.provider = "railway-postgres";
    warnings.push(
      "Detectado host Railway Postgres. Si tu base principal es Supabase, usa la URI del pooler Supabase, no ${{Postgres.DATABASE_URL}}."
    );
  } else if (host === "postgres" || host === "localhost" || host === "127.0.0.1") {
    meta.provider = "docker-local";
  } else {
    meta.provider = "custom";
  }

  if (!parsed.username) {
    warnings.push("URI sin usuario — Supabase suele usar postgres.[PROJECT_REF].");
  }

  if (!parsed.password) {
    errors.push("URI sin contraseña.");
  }

  if (parsed.password && /[@#/?]/.test(decodeURIComponent(parsed.password))) {
    warnings.push("La contraseña contiene caracteres especiales — deben ir URL-encoded en la URI.");
  }

  const driver = String(process.env.DB_DRIVER || "").toLowerCase();
  if (url && driver === "sqlite") {
    warnings.push("DB_DRIVER=sqlite pero DATABASE_URL está definido — el driver forzado gana; usa DB_DRIVER=postgres en prod.");
  }

  if (url && !driver && process.env.NODE_ENV === "production") {
    warnings.push("Define DB_DRIVER=postgres explícitamente en producción.");
  }

  return { ok: errors.length === 0, errors, warnings, meta };
}

/** URI enmascarada para logs/health */
export function dakinisMaskDatabaseUrl(rawUrl) {
  const url = String(rawUrl || "").trim();
  if (!url) return null;
  try {
    const p = new URL(url);
    if (p.password) p.password = "***";
    return p.toString();
  } catch {
    return "invalid-uri";
  }
}
