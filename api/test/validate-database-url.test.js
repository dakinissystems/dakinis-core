import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  dakinisValidateDatabaseUrl,
  dakinisMaskDatabaseUrl
} from "../src/db/validate-database-url.js";

describe("dakinisValidateDatabaseUrl", () => {
  it("rechaza URL vacía", () => {
    const r = dakinisValidateDatabaseUrl("");
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => e.includes("vacío")));
  });

  it("acepta Supabase pooler 6543", () => {
    const r = dakinisValidateDatabaseUrl(
      "postgresql://postgres.abcdef:secret%40pass@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
    );
    assert.equal(r.ok, true);
    assert.equal(r.meta.provider, "supabase");
    assert.equal(r.meta.pooler, true);
    assert.equal(r.meta.port, 6543);
  });

  it("advierte Railway postgres host", () => {
    const r = dakinisValidateDatabaseUrl(
      "postgresql://postgres:pass@containers-us-west-123.railway.app:5432/railway"
    );
    assert.equal(r.meta.provider, "railway-postgres");
    assert.ok(r.warnings.length > 0);
  });

  it("enmascara contraseña", () => {
    const masked = dakinisMaskDatabaseUrl("postgresql://user:secret@host:6543/postgres");
    assert.ok(masked.includes("***"));
    assert.ok(!masked.includes("secret"));
  });
});
