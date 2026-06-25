export const DAKINIS_AUTH_EXPIRED_EVENT = "dakinis:auth-expired";

let dakinisAuthExpiredEmitted = false;

export function dakinisResetAuthExpiredFlag() {
  dakinisAuthExpiredEmitted = false;
}

export function dakinisEmitAuthExpired(detail = {}) {
  if (typeof window === "undefined" || dakinisAuthExpiredEmitted) return;
  dakinisAuthExpiredEmitted = true;
  window.dispatchEvent(new CustomEvent(DAKINIS_AUTH_EXPIRED_EVENT, { detail }));
}
