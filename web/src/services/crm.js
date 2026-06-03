import { api } from "./api.js";

export function dakinisCrmMeta() {
  return api("/api/v1/crm/meta");
}

export function dakinisCrmListContacts(q = "", limit = 100) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  params.set("limit", String(limit));
  return api(`/api/v1/crm/contacts?${params}`);
}

export function dakinisCrmCreateContact(payload) {
  return api("/api/v1/crm/contacts", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function dakinisCrmGetContact(contactId) {
  return api(`/api/v1/crm/contacts/${encodeURIComponent(contactId)}`);
}

export function dakinisCrmContactTimeline(contactId) {
  return api(`/api/v1/crm/contacts/${encodeURIComponent(contactId)}/timeline`);
}

export function dakinisCrmCreateActivity(contactId, payload) {
  return api(`/api/v1/crm/contacts/${encodeURIComponent(contactId)}/activities`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function dakinisCrmListCompanies() {
  return api("/api/v1/crm/companies");
}

export function dakinisCrmCreateCompany(payload) {
  return api("/api/v1/crm/companies", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

/** Demo legacy (segmentación en memoria del adaptador). */
export function dakinisCrmSegment(client) {
  return api("/api/v1/crm/segment", {
    method: "POST",
    body: JSON.stringify({ client })
  });
}

export function dakinisCrmTimeline(client) {
  return api("/api/v1/crm/timeline", {
    method: "POST",
    body: JSON.stringify({ client })
  });
}
