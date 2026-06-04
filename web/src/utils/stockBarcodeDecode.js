const BARCODE_READERS = [
  "ean_reader",
  "ean_8_reader",
  "code_128_reader",
  "code_39_reader",
  "upc_reader",
  "upc_e_reader",
  "codabar_reader",
  "i2of5_reader"
];

/** Normaliza lectura cruda del escáner (sin espacios, mayúsculas). */
export function dakinisNormalizeScanReading(code) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

/** Descarta fragmentos demasiado cortos o ruido típico de Quagga en vivo. */
export function dakinisIsPlausibleBarcode(code) {
  const s = dakinisNormalizeScanReading(code);
  if (s.length < 4) return false;
  if (/^\d+$/.test(s)) {
    return s.length === 8 || s.length === 12 || s.length === 13 || s.length >= 6;
  }
  return s.length >= 4 && s.length <= 64;
}

/**
 * Emisor estable: exige el mismo código N veces en una ventana antes de confirmar.
 * @param {(code: string) => void} onConfirmed
 * @param {{ onPreview?: (code: string) => void, minHits?: number, windowMs?: number, cooldownMs?: number }} [opts]
 */
export function dakinisCreateStableBarcodeEmitter(onConfirmed, opts = {}) {
  const minHits = opts.minHits ?? 4;
  const windowMs = opts.windowMs ?? 500;
  const cooldownMs = opts.cooldownMs ?? 3000;
  const onPreview = opts.onPreview;

  /** @type {{ code: string, t: number }[]} */
  let recent = [];
  let lastEmitAt = 0;
  let lastEmitted = "";

  return function dakinisStableBarcodeHit(rawCode) {
    const code = dakinisNormalizeScanReading(rawCode);
    if (!dakinisIsPlausibleBarcode(code)) return;

    const now = Date.now();
    if (code === lastEmitted && now - lastEmitAt < cooldownMs) return;

    recent = recent.filter((h) => now - h.t <= windowMs);
    recent.push({ code, t: now });

    const hits = recent.filter((h) => h.code === code).length;
    onPreview?.(code);

    if (hits < minHits) return;

    if (now - lastEmitAt < cooldownMs && code !== lastEmitted) return;

    lastEmitAt = now;
    lastEmitted = code;
    recent = [];
    onConfirmed(code);
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

async function dakinisQuaggaDecodeSingle(src) {
  const Quagga = (await import("@ericblade/quagga2")).default;
  const configs = [
    { size: 1200, patchSize: "large", halfSample: false, singleChannel: false },
    { size: 1200, patchSize: "medium", halfSample: false, singleChannel: true },
    { size: 800, patchSize: "large", halfSample: true, singleChannel: false },
    { size: 1600, patchSize: "large", halfSample: false, singleChannel: false },
    { size: 800, patchSize: "medium", halfSample: false, singleChannel: false },
    { size: 600, patchSize: "medium", halfSample: true, singleChannel: true }
  ];

  for (const { size, patchSize, halfSample, singleChannel } of configs) {
    try {
      const result = await Quagga.decodeSingle({
        decoder: { readers: BARCODE_READERS, multiple: false },
        locate: true,
        src,
        numOfWorkers: 0,
        inputStream: { size, singleChannel: !!singleChannel },
        locator: { patchSize: patchSize || "medium", halfSample: !!halfSample }
      });
      if (result?.codeResult?.code) return result.codeResult.code;
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
  if (code) return code;
  code = await dakinisTryDecodeWithZXing(scaled1200 || dataUrl);
  if (code) return code;
  return dakinisTryDecodeWithZXing(scaled800 || dataUrl);
}

/**
 * Inicia escáner en vivo (1D). onCode(code) en cada detección.
 * Devuelve función stop().
 */
export async function dakinisStartLiveBarcodeScanner(videoEl, onCode, opts = {}) {
  const Quagga = (await import("@ericblade/quagga2")).default;
  const stable = dakinisCreateStableBarcodeEmitter(onCode, {
    onPreview: opts.onPreview,
    minHits: opts.minHits ?? 4,
    windowMs: opts.windowMs ?? 500,
    cooldownMs: opts.cooldownMs ?? 3000
  });

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: "environment",
      width: { min: 640, ideal: 1280, max: 1920 },
      height: { min: 480, ideal: 720, max: 1080 }
    }
  });

  videoEl.srcObject = stream;
  videoEl.setAttribute("playsinline", "true");
  videoEl.muted = true;
  await videoEl.play();

  const trackSettings = stream.getVideoTracks()[0]?.getSettings?.() || {};

  const config = {
    inputStream: {
      type: "LiveStream",
      target: videoEl,
      constraints: { ...trackSettings },
      area: {
        top: "12%",
        right: "12%",
        left: "12%",
        bottom: "12%"
      },
      singleChannel: true
    },
    locator: {
      patchSize: "medium",
      halfSample: true
    },
    decoder: {
      readers: BARCODE_READERS,
      multiple: false
    },
    locate: true,
    frequency: 4,
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
    if (norm === lastFrameCode && now - lastFrameAt < 80) return;
    lastFrameCode = norm;
    lastFrameAt = now;
    stable(norm);
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
