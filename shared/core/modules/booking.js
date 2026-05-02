export function dakinisCreateBookingModule(config) {
  function dakinisBuildPublicBookingLink(businessSlug) {
    return `https://book.dakinis.app/${encodeURIComponent(businessSlug)}`;
  }

  function dakinisValidateBookingRequest(payload) {
    const requiredFields = ["serviceId", "date", "time", "customerName", "phone"];
    const missingFields = requiredFields.filter((field) => !payload[field]);
    if (config.booking.collectWhatsApp && !payload.whatsApp) missingFields.push("whatsApp");
    return { valid: missingFields.length === 0, missingFields };
  }

  return {
    dakinisBuildPublicBookingLink,
    dakinisValidateBookingRequest
  };
}
