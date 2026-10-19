import { createHash } from "node:crypto";

/**
 * Canonical JSON (sorted keys) for deterministic hashing.
 * @param {unknown} value
 */
export function dakinisFiscalCanonicalJson(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => dakinisFiscalCanonicalJson(v)).join(",")}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${dakinisFiscalCanonicalJson(value[k])}`).join(",")}}`;
}

/**
 * SHA-256 hex of a fiscal record payload + previous hash (VERI*FACTU-style chain).
 * @param {object} record
 * @param {string} [previousHash]
 */
export function dakinisFiscalComputeRecordHash(record, previousHash = "") {
  const material = dakinisFiscalCanonicalJson({
    ...record,
    previousRecordHash: previousHash || ""
  });
  return createHash("sha256").update(material, "utf8").digest("hex");
}

/**
 * Verify that a stored hash matches recomputation.
 */
export function dakinisFiscalVerifyRecordHash(record, previousHash, expectedHash) {
  return dakinisFiscalComputeRecordHash(record, previousHash) === expectedHash;
}
