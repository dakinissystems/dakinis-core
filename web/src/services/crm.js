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

function dakinisCrmGetContact(contactId) {
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

function dakinisCrmListCompanies() {
  return api("/api/v1/crm/companies");
}

function dakinisCrmCreateCompany(payload) {
  return api("/api/v1/crm/companies", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

/** Demo legacy (segmentación en memoria del adaptador). */
function dakinisCrmSegment(client) {
  return api("/api/v1/crm/segment", {
    method: "POST",
    body: JSON.stringify({ client })
  });
}

function dakinisCrmTimeline(client) {
  return api("/api/v1/crm/timeline", {
    method: "POST",
    body: JSON.stringify({ client })
  });
}
