import { dakinisInitDb } from "../src/db/index.js";
import { dakinisQueryOne } from "../src/db/query.js";

process.env.DB_DRIVER = process.env.DB_DRIVER || "sqlite";
await dakinisInitDb();
for (const table of ["tenant_feature_usage", "tenant_feature_events"]) {
  const row = await dakinisQueryOne(
    `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
    [table]
  );
  if (!row?.name) {
    console.error(`FAIL: ${table} missing`);
    process.exit(1);
  }
  console.log(`OK: ${table}`);
}
