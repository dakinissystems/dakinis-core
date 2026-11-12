import { dakinisCurrentRequestId } from "./request-id.js";

function dakinisGenerateRequestId() {
  return dakinisCurrentRequestId();
}

export function dakinisJsonSuccess(data, adapter, metaExtra = {}) {
  return {
    status: 200,
    body: {
      ok: true,
      data,
      meta: {
        requestId: dakinisGenerateRequestId(),
        adapter,
        ...metaExtra
      }
    }
  };
}

export function dakinisJsonError(status, code, message, details = {}) {
  return {
    status,
    body: {
      ok: false,
      error: {
        code,
        message,
        details
      },
      meta: {
        requestId: dakinisGenerateRequestId()
      }
    }
  };
}
