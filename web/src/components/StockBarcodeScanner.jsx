import { useCallback, useEffect, useRef, useState } from "react";
import { dakinisDecodeBarcodeFromImage, dakinisStartLiveBarcodeScanner } from "../utils/stockBarcodeDecode.js";

/**
 * Escáner QR / barras (patrón proyecto-stock: Quagga live + imagen + ZXing).
 * @param {object} props
 * @param {function} props.onScan — (code: string) => void
 * @param {function} props.t
 * @param {string} [props.hint]
 */
export default function StockBarcodeScanner({ onScan, t, hint }) {
  const videoRef = useRef(null);
  const stopRef = useRef(null);
  const lastCodeRef = useRef("");
  const [isScanning, setIsScanning] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [scannedCode, setScannedCode] = useState("");
  const [decodeError, setDecodeError] = useState("");

  const label = (key, fallback) => (t ? t(key) : fallback);

  const emitCode = useCallback(
    (code) => {
      const trimmed = String(code || "").trim();
      if (!trimmed || trimmed === lastCodeRef.current) return;
      lastCodeRef.current = trimmed;
      setScannedCode(trimmed);
      setDecodeError("");
      onScan?.(trimmed);
      setTimeout(() => {
        lastCodeRef.current = "";
      }, 1200);
    },
    [onScan]
  );

  const stopScanning = useCallback(() => {
    if (stopRef.current) {
      stopRef.current();
      stopRef.current = null;
    }
    setIsScanning(false);
  }, []);

  useEffect(() => () => stopScanning(), [stopScanning]);

  async function startScanning() {
    setDecodeError("");
    if (!videoRef.current) return;
    try {
      const stop = await dakinisStartLiveBarcodeScanner(videoRef.current, emitCode);
      stopRef.current = stop;
      setIsScanning(true);
      setImageSrc("");
    } catch (e) {
      setDecodeError(e instanceof Error ? e.message : label("kitchen.scanCameraError", "No se pudo usar la cámara"));
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
      try {
        const code = await dakinisDecodeBarcodeFromImage(dataUrl);
        if (code) emitCode(code);
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
          value={scannedCode}
          placeholder={label("kitchen.scanCodePlaceholder", "—")}
          className="stock-scanner__code-input"
        />
      </label>

      {decodeError ? (
        <p className="lead" style={{ color: "#fdba74", fontSize: "0.9rem", margin: "0.5rem 0 0" }}>
          {decodeError}
        </p>
      ) : null}
    </div>
  );
}
