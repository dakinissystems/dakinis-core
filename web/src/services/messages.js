import { api } from "./api.js";

export function dakinisMessageConfirmation(payload) {
  return api("/api/v1/messages/confirmation", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function dakinisMessageReminder(payload) {
  return api("/api/v1/messages/reminder", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function dakinisMessageReactivation(payload) {
  return api("/api/v1/messages/reactivation", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
