import { api } from "./api.js";

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
