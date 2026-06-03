import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import {
  dakinisGetEcosystemCatalog,
  dakinisSaveEcosystemCatalog
} from "../lib/ecosystem-catalog-store.js";

function dakinisParseCatalogBody(rawBody) {
  if (!rawBody || !String(rawBody).trim()) return {};
  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
}

export async function dakinisHandlePlatformCatalogGet() {
  const catalog = await dakinisGetEcosystemCatalog();
  return dakinisJsonSuccess(catalog, "platform");
}

export async function dakinisHandlePlatformCatalogPut(rawBody) {
  const body = dakinisParseCatalogBody(rawBody);
  if (body === null) {
    return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  }
  try {
    const saved = await dakinisSaveEcosystemCatalog(body);
    return dakinisJsonSuccess(saved, "platform");
  } catch (e) {
    if (e?.code === "VALIDATION_ERROR") {
      return dakinisJsonError(400, "VALIDATION_ERROR", e instanceof Error ? e.message : "Datos invalidos");
    }
    throw e;
  }
}
