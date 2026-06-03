import { dakinisJsonSuccess } from "./responses.js";
import { dakinisGetEcosystemCatalog } from "../lib/ecosystem-catalog-store.js";

export async function dakinisHandlePublicCatalog() {
  const catalog = await dakinisGetEcosystemCatalog();
  return dakinisJsonSuccess(catalog, "custom");
}
