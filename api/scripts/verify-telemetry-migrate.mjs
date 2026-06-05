import { dakinisInitDb } from "../src/db/index.js";
import { dakinisQueryOne } from "../src/db/query.js";

process.env.DB_DRIVER = process.env.DB_DRIVER || "sqlite";
await dakinisInitDb();
const row = await dakinisQueryOne(
  "SELECT name FROM sqlite_master WHERE type='table' AND name='tenant_feature_usage'"
);
if (!row?.name) {
  console.error("FAIL: tenant_feature_usage missing");
  process.exit(1);
}
console.log("OK: tenant_feature_usage");
