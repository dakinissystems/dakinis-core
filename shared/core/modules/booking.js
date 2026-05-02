export function dakinisCreateBookingModule(config) {
  /** URL pública de la página de reserva del negocio. */
  function dakinisGetBookingPageUrl(businessSlug) {
    return `https://book.dakinis.app/${encodeURIComponent(businessSlug)}`;
  }

  /** Comprueba que el formulario de reserva traiga los campos obligatorios. */
  function dakinisCheckBookingFields(payload) {
    const requiredFields = ["serviceId", "date", "time", "customerName", "phone"];
    const missingFields = requiredFields.filter((field) => !payload[field]);
    if (config.booking.collectWhatsApp && !payload.whatsApp) missingFields.push("whatsApp");
    return { valid: missingFields.length === 0, missingFields };
  }

  return {
    dakinisGetBookingPageUrl,
    dakinisCheckBookingFields
  };
}
