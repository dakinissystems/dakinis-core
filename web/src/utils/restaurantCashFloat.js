/**
 * Fondo de caja / dinero de inicio de día (por negocio + fecha local).
 * B4: fuente de verdad = API `/api/tenant/restaurant/cash-day`.
 * localStorage queda como caché offline / migración.
 */

import { dakinisTenantJsonFetch } from "../services/api.js";

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

function dakinisCashCloseStorageKey(businessId, dateKey = dakinisTodayKey()) {
  return `dakinis-cash-close:${businessId || "local"}:${dateKey}`;
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
  const rounded = Math.round(n * 100) / 100;
  try {
    localStorage.setItem(dakinisCashFloatStorageKey(businessId, dateKey), String(rounded));
  } catch {
    /* ignore quota */
  }
  return rounded;
}

export function dakinisCashFloatDateKey() {
  return dakinisTodayKey();
}

export function dakinisReadCashClose(businessId, dateKey = dakinisTodayKey()) {
  try {
    const raw = localStorage.getItem(dakinisCashCloseStorageKey(businessId, dateKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function dakinisWriteCashClose(businessId, close, dateKey = dakinisTodayKey()) {
  try {
    localStorage.setItem(dakinisCashCloseStorageKey(businessId, dateKey), JSON.stringify(close));
  } catch {
    /* ignore quota */
  }
  return close;
}

/**
 * Lee fondo + cierre del servidor; rellena caché local.
 * @returns {Promise<{ openingFloat: number|null, close: object|null, dateKey: string }>}
 */
export async function dakinisFetchCashDay(apiSession, businessId, dateKey = dakinisTodayKey()) {
  const q = encodeURIComponent(dateKey);
  const json = await dakinisTenantJsonFetch(`/api/tenant/restaurant/cash-day?dateKey=${q}`, apiSession, {
    method: "GET"
  });
  const day = json?.data?.day || {};
  const opening =
    day.openingFloat == null || day.openingFloat === ""
      ? null
      : Number(day.openingFloat);
  if (Number.isFinite(opening)) {
    dakinisWriteCashFloat(businessId, opening, dateKey);
  }
  if (day.close) {
    dakinisWriteCashClose(businessId, day.close, dateKey);
  }
  return {
    dateKey,
    openingFloat: Number.isFinite(opening) ? opening : dakinisReadCashFloat(businessId, dateKey),
    close: day.close || dakinisReadCashClose(businessId, dateKey)
  };
}

/**
 * Guarda el fondo en servidor (y caché local).
 * @returns {Promise<number>}
 */
export async function dakinisSaveCashFloatRemote(apiSession, businessId, amountEur, dateKey = dakinisTodayKey()) {
  if (String(amountEur).trim() === "") {
    throw new Error("Escribe el importe del fondo. Un campo vacío no es 0 €.");
  }
  const n = Number(amountEur);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error("Importe inválido");
  }
  const json = await dakinisTenantJsonFetch("/api/tenant/restaurant/cash-day", apiSession, {
    method: "PUT",
    body: { dateKey, openingFloat: n }
  });
  const opening = Number(json?.data?.day?.openingFloat);
  const saved = Number.isFinite(opening) ? opening : Math.round(n * 100) / 100;
  dakinisWriteCashFloat(businessId, saved, dateKey);
  return saved;
}
