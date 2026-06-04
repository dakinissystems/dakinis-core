import { useCallback, useEffect, useRef, useState } from "react";
import {
  dakinisDecodeBarcodeFromImage,
  dakinisNormalizeScanReading,
  dakinisStartLiveBarcodeScanner
} from "../utils/stockBarcodeDecode.js";

/**
 * Escáner QR / barras (Quagga live + imagen + ZXing).
 * En vivo: solo confirma tras lecturas estables repetidas (evita parpadeo de códigos).
 */
export default function StockBarcodeScanner({ onScan, t, hint }) {
  const videoRef = useRef(null);
  const stopRef = useRef(null);
  const confirmedRef = useRef("");
  const previewTimerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [previewCode, setPreviewCode] = useState("");
  const [confirmedCode, setConfirmedCode] = useState("");
  const [decodeError, setDecodeError] = useState("");

  const label = (key, fallback) => (t ? t(key) : fallback);

  const confirmCode = useCallback(
    (code) => {
      const trimmed = dakinisNormalizeScanReading(code);
      if (!trimmed) return;
      if (trimmed === confirmedRef.current) return;
      confirmedRef.current = trimmed;
      setPreviewCode("");
      setConfirmedCode(trimmed);
      setDecodeError("");
      onScan?.(trimmed);
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

  const stopScanning = useCallback(() => {
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    if (stopRef.current) {
      stopRef.current();
      stopRef.current = null;
    }
    setIsScanning(false);
    setPreviewCode("");
  }, []);

  useEffect(() => () => stopScanning(), [stopScanning]);

  async function startScanning() {
    setDecodeError("");
    setPreviewCode("");
    confirmedRef.current = "";
    if (!videoRef.current) return;
    try {
      const stop = await dakinisStartLiveBarcodeScanner(videoRef.current, confirmCode, {
        onPreview: handlePreview,
        minHits: 4,
        windowMs: 500,
        cooldownMs: 3500
      });
      stopRef.current = stop;
      setIsScanning(true);
      setImageSrc("");
    } catch (e) {
      setDecodeError(
        e instanceof Error ? e.message : label("kitchen.scanCameraError", "No se pudo usar la cámara")
      );
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
        if (code) confirmCode(code);
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
        {hint || label("kitchen.scanLead", "Escanea QR o código de barras del insumo (cámara o foto).")}
      </p>

      <div className="stock-scanner__controls">
        <button
          type="button"
          className={`btn stock-scanner__btn${isScanning ? " stock-scanner__btn--stop" : ""}`}
          onClick={isScanning ? stopScanning : startScanning}
        >
          {isScanning
            ? label("kitchen.scanStop", "Detener escáner")
            : label("kitchen.scanStart", "Iniciar escáner")}
        </button>
        <label className="btn btn-outline stock-scanner__file">
          {label("kitchen.scanImage", "Cargar imagen")}
          <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} hidden />
        </label>
      </div>

      <div className={`stock-scanner__viewport${isScanning ? " is-live" : ""}`}>
        <video ref={videoRef} className="stock-scanner__video" playsInline muted />
        {!isScanning && imageSrc ? (
          <img src={imageSrc} alt="" className="stock-scanner__preview" />
        ) : null}
        {!isScanning && !imageSrc ? (
          <p className="stock-scanner__placeholder">{label("kitchen.scanPlaceholder", "Vista previa")}</p>
        ) : null}
      </div>

      <label className="mockup-field stock-scanner__code-field">
        <span>{label("kitchen.scanCode", "Código leído")}</span>
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
