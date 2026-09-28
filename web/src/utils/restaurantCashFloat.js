/**
 * Fondo de caja / dinero de inicio de día (por negocio + fecha local).
 */

function dakinisTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dakinisCashFloatStorageKey(businessId, dateKey = dakinisTodayKey()) {
  return `dakinis-cash-float:${businessId || "local"}:${dateKey}`;
}

/** @returns {number|null} */
export function dakinisReadCashFloat(businessId, dateKey = dakinisTodayKey()) {
  try {
    const raw = localStorage.getItem(dakinisCashFloatStorageKey(businessId, dateKey));
    if (raw == null || raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** @param {number} amountEur */
export function dakinisWriteCashFloat(businessId, amountEur, dateKey = dakinisTodayKey()) {
  const n = Number(amountEur);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error("Importe inválido");
  }
  try {
    localStorage.setItem(dakinisCashFloatStorageKey(businessId, dateKey), String(Math.round(n * 100) / 100));
  } catch {
    /* ignore quota */
  }
  return Math.round(n * 100) / 100;
}

export function dakinisCashFloatDateKey() {
  return dakinisTodayKey();
}
