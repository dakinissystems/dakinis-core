/**
 * Log estructurado (JSON línea) para observabilidad mínima sin dependencias extra.
 * @param {Record<string, unknown>} entry
 */
export function dakinisStructuredLog(entry) {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...entry });
  if (entry.level === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
}
