/** Readers for live camera — keep short for speed (restaurant 1D). */
const LIVE_BARCODE_READERS = ["ean_reader", "ean_8_reader", "upc_reader", "code_128_reader"];

/** Broader set for still images (photo may include older symbologies). */
const IMAGE_BARCODE_READERS = [
  "ean_reader",
  "ean_8_reader",
  "code_128_reader",
  "upc_reader",
  "code_39_reader",
  "upc_e_reader"
];

const MIN_BARCODE_LENGTH = 8;
const MAX_BARCODE_LENGTH = 64;

/** Normaliza lectura cruda del escáner (sin espacios, mayúsculas). */
export function dakinisNormalizeScanReading(code) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

/**
 * Check digit GTIN (EAN-8 / UPC-A / EAN-13 / GTIN-14).
 * @param {string} code
 * @returns {boolean}
 */
export function dakinisIsValidGtinChecksum(code) {
  const s = String(code || "");
  if (!/^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(s)) return false;
  const digits = s.split("").map((d) => Number(d));
  const check = digits.pop();
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    const weight = (digits.length - i) % 2 === 0 ? 1 : 3;
    sum += digits[i] * weight;
  }
  return (10 - (sum % 10)) % 10 === check;
}

/**
 * Descarta fragmentos cortos / ruido típico de Quagga en vivo.
 * EAN/UPC numéricos deben pasar checksum; Code128 puede ser alfanumérico o numérico interno.
 *
 * @param {string} code
 * @param {{ requireChecksum?: boolean, format?: string }} [opts]
 */
export function dakinisIsPlausibleBarcode(code, opts = {}) {
  const s = dakinisNormalizeScanReading(code);
  if (s.length < MIN_BARCODE_LENGTH || s.length > MAX_BARCODE_LENGTH) return false;

  const format = String(opts.format || "").toLowerCase();
  const isCode128 = /code_?128/.test(format);
  const requireChecksum = opts.requireChecksum !== false && !isCode128;

  if (/^\d+$/.test(s)) {
    if (![8, 12, 13, 14].includes(s.length)) return false;
    if (requireChecksum && !dakinisIsValidGtinChecksum(s)) return false;
    return true;
  }
  return /^[A-Z0-9\-._/]+$/.test(s);
}

/**
 * @param {number[][]} [box]
 * @returns {{ x: number, y: number } | null}
 */
function dakinisBarcodeBoxCenter(box) {
  if (!Array.isArray(box) || box.length < 2) return null;
  let sx = 0;
  let sy = 0;
  let n = 0;
  for (const point of box) {
    if (!Array.isArray(point) || point.length < 2) continue;
    sx += Number(point[0]) || 0;
    sy += Number(point[1]) || 0;
    n += 1;
  }
  if (!n) return null;
  return { x: sx / n, y: sy / n };
}

/**
 * Emisor estable: votos + checksum + estabilidad espacial.
 * No emite lecturas parciales; solo confirma tras consenso.
 *
 * @param {(code: string) => void} onConfirmed
 * @param {{
 *   onActivity?: () => void,
 *   minVotes?: number,
 *   windowMs?: number,
 *   cooldownMs?: number,
 *   maxCenterDeltaPx?: number
 * }} [opts]
 */
function dakinisCreateStableBarcodeEmitter(onConfirmed, opts = {}) {
  const minVotes = opts.minVotes ?? 4;
  const windowMs = opts.windowMs ?? 700;
  const cooldownMs = opts.cooldownMs ?? 1000;
  const maxCenterDeltaPx = opts.maxCenterDeltaPx ?? 48;
  const onActivity = opts.onActivity;

  /** @type {{ code: string, t: number, x: number, y: number }[]} */
  let recent = [];
  let lastEmitAt = 0;
  let lastEmitted = "";
  let lastActivityAt = 0;

  return function dakinisStableBarcodeHit(rawCode, meta = {}) {
    const code = dakinisNormalizeScanReading(rawCode);
    if (!dakinisIsPlausibleBarcode(code, { format: meta.format })) return;

    const now = Date.now();
    if (code === lastEmitted && now - lastEmitAt < cooldownMs) return;

    const center = dakinisBarcodeBoxCenter(meta.box);
    const x = center?.x ?? Number.NaN;
    const y = center?.y ?? Number.NaN;

    recent = recent.filter((h) => now - h.t <= windowMs);

    if (Number.isFinite(x) && Number.isFinite(y) && recent.length) {
      const sameCode = recent.filter((h) => h.code === code && Number.isFinite(h.x));
      if (sameCode.length) {
        const avgX = sameCode.reduce((a, h) => a + h.x, 0) / sameCode.length;
        const avgY = sameCode.reduce((a, h) => a + h.y, 0) / sameCode.length;
        if (Math.hypot(x - avgX, y - avgY) > maxCenterDeltaPx) {
          recent = recent.filter((h) => h.code !== code);
        }
      }
    }

    recent.push({ code, t: now, x, y });

    if (now - lastActivityAt > 120) {
      lastActivityAt = now;
      onActivity?.();
    }

    /** @type {Map<string, number>} */
    const votes = new Map();
    for (const hit of recent) {
      votes.set(hit.code, (votes.get(hit.code) || 0) + 1);
    }

    let bestCode = "";
    let bestVotes = 0;
    let secondVotes = 0;
    for (const [c, n] of votes) {
      if (n > bestVotes) {
        secondVotes = bestVotes;
        bestVotes = n;
        bestCode = c;
      } else if (n > secondVotes) {
        secondVotes = n;
      }
    }

    if (bestVotes < minVotes) return;
    if (bestVotes <= secondVotes) return;
    if (now - lastEmitAt < cooldownMs && bestCode !== lastEmitted) return;

    lastEmitAt = now;
    lastEmitted = bestCode;
    recent = [];
    onConfirmed(bestCode);
  };
}

function dakinisScaleImageToDataUrl(dataUrl, maxSize = 1200) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      const scale = maxSize / Math.max(w, h, 1);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      try {
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

async function dakinisTryDecodeWithZXing(dataUrl) {
  if (!dataUrl) return null;
  try {
    const { BrowserMultiFormatReader } = await import("@zxing/browser");
    const codeReader = new BrowserMultiFormatReader();
    const result = await codeReader.decodeFromImageUrl(dataUrl);
    if (result?.getText()) return result.getText().trim();
  } catch {
    /* sin código */
  }
  return null;
}

async function dakinisQuaggaDecodeSingle(src, readers = IMAGE_BARCODE_READERS) {
  const Quagga = (await import("@ericblade/quagga2")).default;
  const configs = [
    { size: 1200, patchSize: "large", halfSample: false, singleChannel: false },
    { size: 1200, patchSize: "x-large", halfSample: false, singleChannel: true },
    { size: 800, patchSize: "large", halfSample: true, singleChannel: false },
    { size: 1600, patchSize: "large", halfSample: false, singleChannel: false },
    { size: 800, patchSize: "medium", halfSample: false, singleChannel: false }
  ];

  for (const { size, patchSize, halfSample, singleChannel } of configs) {
    try {
      const result = await Quagga.decodeSingle({
        decoder: { readers, multiple: false },
        locate: true,
        src,
        numOfWorkers: 0,
        inputStream: { size, singleChannel: !!singleChannel },
        locator: { patchSize: patchSize || "large", halfSample: !!halfSample }
      });
      const code = result?.codeResult?.code;
      if (code && dakinisIsPlausibleBarcode(code, { requireChecksum: /^\d+$/.test(String(code)) })) {
        return dakinisNormalizeScanReading(code);
      }
    } catch {
      continue;
    }
  }
  return null;
}

/** Decodifica imagen (foto o captura): Quagga multi-config + ZXing (QR y 1D). */
export async function dakinisDecodeBarcodeFromImage(dataUrl) {
  let code = await dakinisQuaggaDecodeSingle(dataUrl);
  if (code) return code;

  const scaled1200 = await dakinisScaleImageToDataUrl(dataUrl, 1200);
  if (scaled1200 !== dataUrl) {
    code = await dakinisQuaggaDecodeSingle(scaled1200);
    if (code) return code;
  }

  const scaled800 = await dakinisScaleImageToDataUrl(dataUrl, 800);
  if (scaled800 !== dataUrl) {
    code = await dakinisQuaggaDecodeSingle(scaled800);
    if (code) return code;
  }

  code = await dakinisTryDecodeWithZXing(dataUrl);
  if (code && dakinisIsPlausibleBarcode(code, { requireChecksum: false })) {
    return dakinisNormalizeScanReading(code);
  }
  code = await dakinisTryDecodeWithZXing(scaled1200 || dataUrl);
  if (code && dakinisIsPlausibleBarcode(code, { requireChecksum: false })) {
    return dakinisNormalizeScanReading(code);
  }
  code = await dakinisTryDecodeWithZXing(scaled800 || dataUrl);
  if (code && dakinisIsPlausibleBarcode(code, { requireChecksum: false })) {
    return dakinisNormalizeScanReading(code);
  }
  return null;
}

/**
 * Intenta continuous autofocus + torch (cocina / poca luz).
 * @param {MediaStreamTrack} track
 * @param {{ torch?: boolean }} [opts]
 */
async function dakinisEnhanceCameraTrack(track, opts = {}) {
  if (!track || typeof track.applyConstraints !== "function") return;

  try {
    await track.applyConstraints({
      advanced: [{ focusMode: "continuous" }]
    });
  } catch {
    /* no soportado */
  }

  if (opts.torch) {
    try {
      await track.applyConstraints({
        advanced: [{ torch: true }]
      });
    } catch {
      /* no soportado */
    }
  }

  try {
    const caps = track.getCapabilities?.() || {};
    if (typeof caps.zoom === "object" && caps.zoom.max > caps.zoom.min) {
      const mid = Math.min(caps.zoom.max, Math.max(caps.zoom.min, (caps.zoom.min + 1.4)));
      await track.applyConstraints({ advanced: [{ zoom: mid }] });
    }
  } catch {
    /* no soportado */
  }
}

/** @typedef {"environment"|"user"} DakinisCameraFacing */

/**
 * Inicia escáner en vivo (1D). Solo confirma tras votos + checksum; no preview de parciales.
 * @param {HTMLVideoElement} videoEl
 * @param {(code: string) => void} onCode
 * @param {{
 *   onActivity?: () => void,
 *   minVotes?: number,
 *   windowMs?: number,
 *   cooldownMs?: number,
 *   facingMode?: DakinisCameraFacing,
 *   torch?: boolean
 * }} [opts]
 * @returns {Promise<() => void>}
 */
export async function dakinisStartLiveBarcodeScanner(videoEl, onCode, opts = {}) {
  const Quagga = (await import("@ericblade/quagga2")).default;
  const stable = dakinisCreateStableBarcodeEmitter(onCode, {
    onActivity: opts.onActivity,
    minVotes: opts.minVotes ?? 4,
    windowMs: opts.windowMs ?? 700,
    cooldownMs: opts.cooldownMs ?? 1000
  });

  const facingMode = opts.facingMode === "user" ? "user" : "environment";
  const wantTorch = opts.torch !== false && facingMode === "environment";

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: facingMode },
      width: { min: 640, ideal: 1280, max: 1920 },
      height: { min: 480, ideal: 720, max: 1080 }
    }
  });

  const track = stream.getVideoTracks()[0];
  await dakinisEnhanceCameraTrack(track, { torch: wantTorch });

  videoEl.srcObject = stream;
  videoEl.setAttribute("playsinline", "true");
  videoEl.muted = true;
  await videoEl.play();

  const trackSettings = track?.getSettings?.() || {};

  const config = {
    inputStream: {
      type: "LiveStream",
      target: videoEl,
      constraints: { ...trackSettings },
      // ROI central: menos borde = menos falsos positivos y menos CPU
      area: {
        top: "22%",
        right: "18%",
        left: "18%",
        bottom: "22%"
      },
      singleChannel: true
    },
    locator: {
      patchSize: "large",
      halfSample: true
    },
    decoder: {
      readers: LIVE_BARCODE_READERS,
      multiple: false
    },
    locate: true,
    // ~10–12 análisis/s: suficiente para votos rápidos sin saturar CPU
    frequency: 10,
    numOfWorkers: typeof navigator !== "undefined" && navigator.hardwareConcurrency > 2 ? 2 : 0
  };

  await Quagga.init(config);
  Quagga.start();

  let active = true;
  let lastFrameCode = "";
  let lastFrameAt = 0;
  const handler = (result) => {
    if (!active) return;
    const code = result?.codeResult?.code;
    if (!code) return;
    const norm = dakinisNormalizeScanReading(code);
    const now = Date.now();
    // Dedup mismo frame / rafaga inmediata
    if (norm === lastFrameCode && now - lastFrameAt < 70) return;
    lastFrameCode = norm;
    lastFrameAt = now;
    stable(norm, {
      box: result.box || result.codeResult?.box,
      format: result.codeResult?.format
    });
  };
  Quagga.onDetected(handler);

  return () => {
    active = false;
    try {
      Quagga.offDetected(handler);
    } catch {
      /* ignore */
    }
    try {
      Quagga.stop();
    } catch {
      /* ignore */
    }
    stream.getTracks().forEach((t) => t.stop());
    videoEl.srcObject = null;
  };
}
