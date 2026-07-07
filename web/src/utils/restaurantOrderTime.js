function dakinisKitchenElapsedSeconds(createdAt, nowMs = Date.now()) {
  const sent = new Date(createdAt).getTime();
  if (!Number.isFinite(sent)) return 0;
  return Math.max(0, Math.floor((nowMs - sent) / 1000));
}

export function dakinisKitchenElapsedMinutes(createdAt, nowMs = Date.now()) {
  return Math.floor(dakinisKitchenElapsedSeconds(createdAt, nowMs) / 60);
}

/** Tiempo transcurrido legible: "0:45 min", "12:08 min", "1:05 h". */
export function dakinisFormatKitchenElapsed(createdAt, nowMs = Date.now(), locale = "es") {
  const totalSec = dakinisKitchenElapsedSeconds(createdAt, nowMs);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const pad = (n) => String(n).padStart(2, "0");

  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return locale === "en" ? `${h}:${pad(m)} h` : `${h}:${pad(m)} h`;
  }
  const clock = `${min}:${pad(sec)}`;
  return locale === "en" ? `${clock} min` : `${clock} min`;
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
