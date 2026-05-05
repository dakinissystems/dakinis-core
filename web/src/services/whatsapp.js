import { api } from "./api.js";

export function dakinisWhatsappConfirmation(payload) {
  return api("/api/v1/whatsapp/confirmation", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function dakinisWhatsappReminder(payload) {
  return api("/api/v1/whatsapp/reminder", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function dakinisWhatsappReactivation(payload) {
  return api("/api/v1/whatsapp/reactivation", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function dakinisWhatsappRules() {
  return api("/api/v1/whatsapp/rules");
}
