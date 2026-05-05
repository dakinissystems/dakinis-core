import { api } from "./api.js";

export function dakinisAppointmentSlots(dayStart, dayEnd) {
  return api("/api/v1/appointments/slots", {
    method: "POST",
    body: JSON.stringify({ dayStart, dayEnd })
  });
}

export function dakinisAppointmentCanSchedule(existingBookings, candidateStart, serviceMinutes) {
  return api("/api/v1/appointments/can-schedule", {
    method: "POST",
    body: JSON.stringify({ existingBookings, candidateStart, serviceMinutes })
  });
}

export function dakinisAppointmentValidate(payload) {
  return api("/api/v1/appointments/validate", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function dakinisAppointmentLink(businessSlug) {
  return api("/api/v1/appointments/link", {
    method: "POST",
    body: JSON.stringify({ businessSlug })
  });
}
