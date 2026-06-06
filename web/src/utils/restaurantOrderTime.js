export function dakinisKitchenElapsedMinutes(createdAt, nowMs = Date.now()) {
  const sent = new Date(createdAt).getTime();
  if (!Number.isFinite(sent)) return 0;
  return Math.max(0, Math.floor((nowMs - sent) / 60000));
}

export function dakinisFormatOrderSentTime(createdAt, locale = "es") {
  const sent = new Date(createdAt);
  if (Number.isNaN(sent.getTime())) return "—";
  const dateLocale = locale === "en" ? "en-US" : "es-ES";
  return sent.toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" });
}

export function dakinisKitchenElapsedTone(minutes) {
  if (minutes >= 15) return "late";
  if (minutes >= 8) return "warn";
  return "ok";
}
