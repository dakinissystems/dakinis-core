/**
 * Helpers para tests de integración contra dakinisDispatch.
 */

/**
 * @param {import("../../src/app.js").dakinisDispatch} dispatch
 * @param {{ method?: string, path: string, headers?: Record<string, string>, body?: unknown }} opts
 */
function dakinisNormalizeHeaders(headers = {}) {
  const out = {};
  for (const [key, value] of Object.entries(headers)) {
    out[String(key).toLowerCase()] = value;
  }
  return out;
}

export async function dakinisCallApi(dispatch, opts) {
  const method = opts.method || "GET";
  const req = {
    method,
    headers: dakinisNormalizeHeaders(opts.headers)
  };
  const url = new URL(opts.path, "http://localhost");
  const rawBody =
    opts.body !== undefined
      ? typeof opts.body === "string"
        ? opts.body
        : JSON.stringify(opts.body)
      : "";
  return dispatch(req, rawBody, url);
}

/**
 * @param {{ status: number, body: unknown }} result
 */
export function dakinisParseApiBody(result) {
  if (result.body == null) return null;
  if (typeof result.body === "string") {
    try {
      return JSON.parse(result.body);
    } catch {
      return result.body;
    }
  }
  return result.body;
}
