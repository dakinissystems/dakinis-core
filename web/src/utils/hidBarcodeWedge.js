import { dakinisIsPlausibleBarcode, dakinisNormalizeScanReading } from "./stockBarcodeDecode.js";

const DAKINIS_WEDGE_TERMINATOR_KEYS = new Set(["Enter", "Tab"]);

function dakinisIsEditableTarget(el) {
  if (!el || !(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag === "INPUT") {
    const type = String(el.getAttribute("type") || "text").toLowerCase();
    if (type === "button" || type === "submit" || type === "checkbox" || type === "radio") {
      return false;
    }
    return !el.dataset.dakinisBarcodeWedge;
  }
  return el.isContentEditable;
}

/**
 * Escuchador para lectores USB/Bluetooth tipo teclado (keyboard wedge).
 * Acumula teclas rápidas y confirma con Enter/Tab o pausa corta tras el último carácter.
 *
 * @param {(code: string) => void} onScan
 * @param {{ maxGapMs?: number, suffixPauseMs?: number, minLength?: number, cooldownMs?: number, enabled?: () => boolean }} [opts]
 * @returns {() => void} cleanup
 */
export function dakinisAttachHidBarcodeWedge(onScan, opts = {}) {
  const maxGapMs = opts.maxGapMs ?? 120;
  const suffixPauseMs = opts.suffixPauseMs ?? 180;
  const minLength = opts.minLength ?? 8;
  const cooldownMs = opts.cooldownMs ?? 800;
  const enabled = opts.enabled ?? (() => true);

  let buffer = "";
  let lastKeyAt = 0;
  let lastEmitAt = 0;
  let lastEmitted = "";
  let flushTimer = null;

  function dakinisResetBuffer() {
    buffer = "";
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
  }

  function dakinisEmitBuffer() {
    const code = dakinisNormalizeScanReading(buffer);
    dakinisResetBuffer();
    if (!dakinisIsPlausibleBarcode(code, { requireChecksum: false })) return;

    const now = Date.now();
    if (code === lastEmitted && now - lastEmitAt < cooldownMs) return;

    lastEmitAt = now;
    lastEmitted = code;
    onScan(code);
  }

  function dakinisScheduleSuffixFlush() {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(() => {
      if (buffer.length >= minLength) dakinisEmitBuffer();
      else dakinisResetBuffer();
    }, suffixPauseMs);
  }

  function dakinisOnKeyDown(e) {
    if (!enabled()) return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    const now = Date.now();
    if (e.target instanceof HTMLElement && e.target.dataset.dakinisBarcodeWedge === "1") {
      return;
    }

    if (dakinisIsEditableTarget(e.target)) return;

    if (now - lastKeyAt > maxGapMs) buffer = "";
    lastKeyAt = now;

    if (DAKINIS_WEDGE_TERMINATOR_KEYS.has(e.key)) {
      if (buffer.length >= minLength) {
        e.preventDefault();
        dakinisEmitBuffer();
      } else {
        dakinisResetBuffer();
      }
      return;
    }

    if (e.key.length !== 1) return;

    buffer += e.key;
    dakinisScheduleSuffixFlush();
  }

  window.addEventListener("keydown", dakinisOnKeyDown, true);

  return () => {
    window.removeEventListener("keydown", dakinisOnKeyDown, true);
    dakinisResetBuffer();
  };
}
