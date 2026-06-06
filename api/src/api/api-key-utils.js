import bcrypt from "bcryptjs";
import { dakinisQueryAll } from "../db/query.js";

const BCRYPT_ROUNDS = 12;

export function dakinisIsBcryptHash(value) {
  return typeof value === "string" && /^\$2[aby]\$/.test(value);
}

/**
 * @param {string} plainKey
 * @returns {string}
 */
export function dakinisHashTenantApiKey(plainKey) {
  return bcrypt.hashSync(String(plainKey), BCRYPT_ROUNDS);
}

/**
 * Compara clave en texto plano con valor almacenado (hash bcrypt o legado en claro).
 * @param {string} candidate
 * @param {string} stored
 */
export function dakinisVerifyTenantApiKey(candidate, stored) {
  const plain = String(candidate || "");
  const rowValue = String(stored || "");
  if (!plain || !rowValue) return false;
  if (dakinisIsBcryptHash(rowValue)) {
    return bcrypt.compareSync(plain, rowValue);
  }
  return plain === rowValue;
}

/**
 * Busca fila de API key del tenant comparando hash o valor legado.
 * @param {string} businessId
 * @param {string} candidateKey
 */
export async function dakinisFindTenantApiKeyRow(businessId, candidateKey) {
  const rows = await dakinisQueryAll("SELECT * FROM tenant_api_keys WHERE business_id = ?", [businessId]);
  for (const row of rows) {
    if (dakinisVerifyTenantApiKey(candidateKey, row.key_value)) {
      return row;
    }
  }
  return null;
}
