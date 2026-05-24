import test from "node:test";
import assert from "node:assert/strict";
import { dakinisResolveDbDriver, dakinisToPostgresPlaceholders, dakinisSqlInsertIgnore } from "../src/db/dialect.js";

test("dakinisResolveDbDriver defaults to sqlite without DATABASE_URL", () => {
  const prev = process.env.DATABASE_URL;
  const prevDriver = process.env.DB_DRIVER;
  delete process.env.DATABASE_URL;
  delete process.env.DB_DRIVER;
  assert.equal(dakinisResolveDbDriver(), "sqlite");
  if (prev !== undefined) process.env.DATABASE_URL = prev;
  if (prevDriver !== undefined) process.env.DB_DRIVER = prevDriver;
});

test("dakinisToPostgresPlaceholders converts ? to $n", () => {
  assert.equal(dakinisToPostgresPlaceholders("SELECT * FROM t WHERE id = ? AND x = ?"), "SELECT * FROM t WHERE id = $1 AND x = $2");
});

test("dakinisSqlInsertIgnore uses ON CONFLICT for postgres", () => {
  const prev = process.env.DB_DRIVER;
  process.env.DB_DRIVER = "postgres";
  const sql = dakinisSqlInsertIgnore("business", ["id", "slug"]);
  assert.match(sql, /ON CONFLICT DO NOTHING/);
  if (prev !== undefined) process.env.DB_DRIVER = prev;
  else delete process.env.DB_DRIVER;
});
