import { api } from "./api.js";

function dakinisWhatsappConfirmation(payload) {
  return api("/api/v1/whatsapp/confirmation", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

function dakinisWhatsappReminder(payload) {
  return api("/api/v1/whatsapp/reminder", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

function dakinisWhatsappReactivation(payload) {
  return api("/api/v1/whatsapp/reactivation", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function dakinisWhatsappRules() {
  return api("/api/v1/whatsapp/rules");
}

export function dakinisWhatsappSend(payload) {
  return api("/api/v1/whatsapp/send", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function dakinisWhatsappConversations(limit = 50) {
  return api(`/api/v1/whatsapp/conversations?limit=${limit}`);
}

export function dakinisWhatsappThreadMessages(phone, limit = 100) {
  const peer = encodeURIComponent(String(phone).replace(/\D/g, ""));
  return api(`/api/v1/whatsapp/conversations/${peer}/messages?limit=${limit}`);
}

export function dakinisWhatsappContacts() {
  return api("/api/v1/whatsapp/contacts");
}
