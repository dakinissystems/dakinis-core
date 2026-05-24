/** @returns {"sqlite"|"postgres"} */
export function dakinisResolveDbDriver() {
  const forced = String(process.env.DB_DRIVER || "").trim().toLowerCase();
  if (forced === "postgres" || forced === "sqlite") return forced;
  if (String(process.env.DATABASE_URL || "").trim()) return "postgres";
  return "sqlite";
}

/** Convierte placeholders `?` a `$1`, `$2`, … para PostgreSQL. */
export function dakinisToPostgresPlaceholders(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

/** ORDER BY email case-insensitive. */
export function dakinisSqlOrderEmail(column = "email") {
  return dakinisResolveDbDriver() === "postgres"
    ? `lower(${column})`
    : `${column} COLLATE NOCASE`;
}

/** ORDER BY created_at DESC (SQLite datetime helper vs PG timestamptz). */
export function dakinisSqlOrderCreatedAtDesc(column = "created_at") {
  return dakinisResolveDbDriver() === "postgres"
    ? `${column} DESC`
    : `datetime(${column}) DESC`;
}

/** INSERT OR IGNORE (SQLite) → ON CONFLICT DO NOTHING (Postgres). */
export function dakinisSqlInsertIgnore(table, columns) {
  const cols = columns.join(", ");
  const placeholders = columns.map(() => "?").join(", ");
  if (dakinisResolveDbDriver() === "postgres") {
    return `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
  }
  return `INSERT OR IGNORE INTO ${table} (${cols}) VALUES (${placeholders})`;
}
