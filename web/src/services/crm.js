import { dakinisTenantJsonFetch } from "./api.js";

function dakinisCrmSession() {
  try {
    const rawSession = sessionStorage.getItem("dakinis_session_v1");
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      if (parsed?.token) return parsed;
    }
  } catch {
    /* ignore */
  }
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("dakinis_token") ||
    localStorage.getItem("authToken") ||
    "";
  return token ? { token } : { token: undefined };
}

function dakinisCrmFetch(path, options = {}) {
  const session = dakinisCrmSession();
  return dakinisTenantJsonFetch(path, session, {
    ...options,
    businessId: session?.business?.slug || session?.business?.id
  });
}

export function dakinisCrmMeta() {
  return dakinisCrmFetch("/api/v1/crm/meta");
}

export function dakinisCrmListContacts(q = "", limit = 100) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("limit", String(limit));
  return dakinisCrmFetch(`/api/v1/crm/contacts?${params}`);
}

export function dakinisCrmCreateContact(payload) {
  return dakinisCrmFetch("/api/v1/crm/contacts", {
    method: "POST",
    body: payload
  });
}

export function dakinisCrmGetContact(contactId) {
  return dakinisCrmFetch(`/api/v1/crm/contacts/${encodeURIComponent(contactId)}`);
}

export function dakinisCrmContactTimeline(contactId) {
  return dakinisCrmFetch(`/api/v1/crm/contacts/${encodeURIComponent(contactId)}/timeline`);
}

export function dakinisCrmCreateActivity(contactId, payload) {
  return dakinisCrmFetch(`/api/v1/crm/contacts/${encodeURIComponent(contactId)}/activities`, {
    method: "POST",
    body: payload
  });
}

export function dakinisCrmListCompanies() {
  return dakinisCrmFetch("/api/v1/crm/companies");
}

export function dakinisCrmCreateCompany(payload) {
  return dakinisCrmFetch("/api/v1/crm/companies", {
    method: "POST",
    body: payload
  });
}
