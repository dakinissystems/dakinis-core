import { dakinisToDate } from "../utils.js";

export function dakinisCreateAgendaModule(config) {
  /** Fin del servicio a partir de la hora de inicio y duración en minutos. */
  function dakinisGetAppointmentEnd(startDate, serviceMinutes) {
    const start = dakinisToDate(startDate, "startDate");
    return new Date(start.getTime() + serviceMinutes * 60000);
  }

  /** Indica si el hueco cabe sin solaparse con reservas existentes (salvo overbooking). */
  function dakinisIsSlotAvailable(existingBookings, candidateStart, serviceMinutes) {
    if (config.agenda.allowOverbooking) return true;
    const start = dakinisToDate(candidateStart, "candidateStart");
    const candidateEnd = dakinisGetAppointmentEnd(start, serviceMinutes);
    return existingBookings.every((booking) => {
      const bookingStart = dakinisToDate(booking.startAt, "booking.startAt");
      const bookingEnd = dakinisToDate(booking.endAt, "booking.endAt");
      return candidateEnd <= bookingStart || start >= bookingEnd;
    });
  }

  /** Genera los tramos del día según `slotMinutes` de la agenda. */
  function dakinisGenerateDaySlots(dayStart, dayEnd) {
    const start = dakinisToDate(dayStart, "dayStart");
    const end = dakinisToDate(dayEnd, "dayEnd");
    const slots = [];
    let current = new Date(start);
    while (current < end) {
      const next = new Date(current.getTime() + config.agenda.slotMinutes * 60000);
      slots.push({ startAt: new Date(current), endAt: next });
      current = next;
    }
    return slots;
  }

  return {
    dakinisGetAppointmentEnd,
    dakinisIsSlotAvailable,
    dakinisGenerateDaySlots
  };
}
