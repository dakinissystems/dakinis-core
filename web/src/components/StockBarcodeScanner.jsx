import { useCallback, useEffect, useRef, useState } from "react";
import {
  dakinisDecodeBarcodeFromImage,
  dakinisIsPlausibleBarcode,
  dakinisNormalizeScanReading,
  dakinisStartLiveBarcodeScanner
} from "../utils/stockBarcodeDecode.js";
import { dakinisAttachHidBarcodeWedge } from "../utils/hidBarcodeWedge.js";

/**
 * Escáner de stock:
 * - Lectores USB/Bluetooth (modo teclado + Enter) — uso habitual en almacén
 * - Cámara Quagga (opcional)
 * - Foto / ZXing
 */
export default function StockBarcodeScanner({ onScan, t, hint }) {
  const videoRef = useRef(null);
  const wedgeInputRef = useRef(null);
  const wedgeFlushRef = useRef(null);
  const stopRef = useRef(null);
  const confirmedRef = useRef("");
  const previewTimerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [imageSrc, setImageSrc] = useState("");
  const [previewCode, setPreviewCode] = useState("");
  const [confirmedCode, setConfirmedCode] = useState("");
  const [decodeError, setDecodeError] = useState("");

  const label = (key, fallback) => (t ? t(key) : fallback);

  const confirmCode = useCallback(
    (code, { fromCamera = false } = {}) => {
      const trimmed = dakinisNormalizeScanReading(code);
      if (!trimmed) return;
      if (trimmed === confirmedRef.current) return;
      confirmedRef.current = trimmed;
      setPreviewCode("");
      setConfirmedCode(trimmed);
      setDecodeError("");
      onScan?.(trimmed);

      if (!fromCamera) {
        wedgeInputRef.current?.focus?.();
      }
    },
    [onScan]
  );

  const handlePreview = useCallback((code) => {
    const trimmed = dakinisNormalizeScanReading(code);
    if (!trimmed || trimmed === confirmedRef.current) return;
    setPreviewCode(trimmed);
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(() => {
      setPreviewCode((current) => (current === trimmed ? "" : current));
    }, 700);
  }, []);

  const stopCameraStream = useCallback(() => {
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    if (stopRef.current) {
      stopRef.current();
      stopRef.current = null;
    }
    setIsScanning(false);
    setPreviewCode("");
  }, []);

  const stopScanning = useCallback(() => {
    stopCameraStream();
    confirmedRef.current = "";
    setConfirmedCode("");
  }, [stopCameraStream]);

  useEffect(() => () => stopCameraStream(), [stopCameraStream]);

  useEffect(() => {
    const detach = dakinisAttachHidBarcodeWedge((code) => confirmCode(code, { fromCamera: false }));
    return detach;
  }, [confirmCode]);

  useEffect(() => {
    const id = window.setTimeout(() => wedgeInputRef.current?.focus?.(), 200);
    return () => window.clearTimeout(id);
  }, []);

  function dakinisFlushWedgeInput(el) {
    const raw = el?.value?.trim();
    if (!raw || !dakinisIsPlausibleBarcode(raw)) return;
    confirmCode(raw, { fromCamera: false });
    el.value = "";
  }

  function dakinisHandleWedgeInputKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (wedgeFlushRef.current) clearTimeout(wedgeFlushRef.current);
      dakinisFlushWedgeInput(e.currentTarget);
    }
  }

  function dakinisHandleWedgeInputChange(e) {
    const el = e.currentTarget;
    if (wedgeFlushRef.current) clearTimeout(wedgeFlushRef.current);
    wedgeFlushRef.current = setTimeout(() => dakinisFlushWedgeInput(el), 220);
  }

  function dakinisHandleWedgePaste(e) {
    const text = e.clipboardData?.getData("text")?.trim();
    if (!text) return;
    e.preventDefault();
    confirmCode(text, { fromCamera: false });
    if (wedgeInputRef.current) wedgeInputRef.current.value = "";
  }

  async function beginCamera(face, { resetReading = true } = {}) {
    setDecodeError("");
    if (resetReading) {
      setPreviewCode("");
      confirmedRef.current = "";
      setConfirmedCode("");
    }
    stopCameraStream();
    if (!videoRef.current) return;
    try {
      const stop = await dakinisStartLiveBarcodeScanner(
        videoRef.current,
        (code) => confirmCode(code, { fromCamera: true }),
        {
          facingMode: face,
          onPreview: handlePreview,
          minHits: 4,
          windowMs: 500,
          cooldownMs: 3500
        }
      );
      stopRef.current = stop;
      setFacingMode(face);
      setIsScanning(true);
      setImageSrc("");
    } catch (e) {
      setDecodeError(
        e instanceof Error ? e.message : label("kitchen.scanCameraError", "No se pudo usar la cámara")
      );
    }
  }

  async function startScanning() {
    await beginCamera(facingMode, { resetReading: true });
  }

  async function flipCamera() {
    const next = facingMode === "environment" ? "user" : "environment";
    if (isScanning) {
      await beginCamera(next, { resetReading: false });
    } else {
      setFacingMode(next);
    }
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    stopScanning();

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result;
      if (typeof dataUrl !== "string") return;
      setImageSrc(dataUrl);
      setDecodeError("");
      setPreviewCode("");
      try {
        const code = await dakinisDecodeBarcodeFromImage(dataUrl);
        if (code) confirmCode(code, { fromCamera: false });
        else {
          setDecodeError(
            label(
              "kitchen.scanImageFail",
              "No se detectó código. Usa buena luz, enfoque y contraste; también puedes probar con el código impreso del insumo."
            )
          );
        }
      } catch (err) {
        setDecodeError(err instanceof Error ? err.message : label("kitchen.scanError", "Error al leer imagen"));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  const displayCode = confirmedCode || previewCode;
  const isStabilizing = isScanning && previewCode && previewCode !== confirmedCode;

  return (
    <div className="stock-scanner">
      <p className="kpi-label stock-scanner__intro">
        {hint ||
          label(
            "kitchen.scanLead",
            "Lector USB/Bluetooth (como teclado), cámara o foto del código del insumo."
          )}
      </p>

      <div className="stock-scanner__wedge card">
        <p className="kpi-label" style={{ margin: "0 0 0.5rem" }}>
          {label("kitchen.scanWedgeTitle", "Lector de código de barras (USB / pistola)")}
        </p>
        <p className="kpi-label stock-scanner__wedge-hint">
          {label(
            "kitchen.scanWedgeHint",
            "Conecta el lector, haz clic en el campo y escanea. Envía Enter al final (la mayoría lo hace solos). EAN-13, UPC, Code 128, etc."
          )}
        </p>
        <label className="mockup-field stock-scanner__wedge-field">
          <span className="sr-only">{label("kitchen.scanWedgeInput", "Entrada lector código de barras")}</span>
          <input
            ref={wedgeInputRef}
            type="text"
            data-dakinis-barcode-wedge="1"
            className="stock-scanner__wedge-input"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            inputMode="numeric"
            placeholder={label("kitchen.scanWedgePlaceholder", "Clic aquí y escanea con el lector…")}
            onKeyDown={dakinisHandleWedgeInputKeyDown}
            onChange={dakinisHandleWedgeInputChange}
            onPaste={dakinisHandleWedgePaste}
          />
        </label>
        <button
          type="button"
          className="btn btn-outline"
          style={{ marginTop: "0.5rem" }}
          onClick={() => wedgeInputRef.current?.focus?.()}
        >
          {label("kitchen.scanWedgeFocus", "Activar campo para lector")}
        </button>
      </div>

      <p className="kpi-label stock-scanner__or">{label("kitchen.scanOrCamera", "O usa la cámara del dispositivo")}</p>

      <div className="stock-scanner__controls">
        <button
          type="button"
          className={`btn stock-scanner__btn${isScanning ? " stock-scanner__btn--stop" : ""}`}
          onClick={isScanning ? stopScanning : startScanning}
        >
          {isScanning
            ? label("kitchen.scanStop", "Detener escáner")
            : label("kitchen.scanStart", "Iniciar cámara")}
        </button>
        <button
          type="button"
          className="btn btn-outline stock-scanner__flip"
          onClick={() => flipCamera()}
          title={
            facingMode === "environment"
              ? label("kitchen.scanCameraRear", "Cámara trasera")
              : label("kitchen.scanCameraFront", "Cámara frontal")
          }
        >
          {label("kitchen.scanFlipCamera", "Cambiar cámara")}
          <span className="stock-scanner__flip-label">
            {facingMode === "environment"
              ? label("kitchen.scanCameraRear", "Trasera")
              : label("kitchen.scanCameraFront", "Frontal")}
          </span>
        </button>
        <label className="btn btn-outline stock-scanner__file">
          {label("kitchen.scanImage", "Cargar imagen")}
          <input
            type="file"
            accept="image/*"
            capture={facingMode === "user" ? "user" : "environment"}
            onChange={handleImageChange}
            hidden
          />
        </label>
      </div>

      <div className={`stock-scanner__viewport${isScanning ? " is-live" : ""}`}>
        <video ref={videoRef} className="stock-scanner__video" playsInline muted />
        {!isScanning && imageSrc ? (
          <img src={imageSrc} alt="" className="stock-scanner__preview" />
        ) : null}
        {!isScanning && !imageSrc ? (
          <p className="stock-scanner__placeholder">{label("kitchen.scanPlaceholder", "Vista previa cámara")}</p>
        ) : null}
      </div>

      <label className="mockup-field stock-scanner__code-field">
        <span>{label("kitchen.scanCode", "Último código")}</span>
        <input
          type="text"
          readOnly
          value={displayCode}
          placeholder={label("kitchen.scanCodePlaceholder", "—")}
          className={`stock-scanner__code-input${isStabilizing ? " stock-scanner__code-input--preview" : ""}`}
        />
      </label>

      {isStabilizing ? (
        <p className="kpi-label" style={{ marginTop: "0.35rem" }}>
          {label("kitchen.scanStabilizing", "Enfocando código… mantén el móvil quieto un instante.")}
        </p>
      ) : null}

      {decodeError ? (
        <p className="lead" style={{ color: "#fdba74", fontSize: "0.9rem", margin: "0.5rem 0 0" }}>
          {decodeError}
        </p>
      ) : null}
    </div>
  );
}
