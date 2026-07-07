import { useStockBarcodeScanner } from "../hooks/useStockBarcodeScanner.js";

export default function StockBarcodeScanner({ onScan, t, hint }) {
  const {
    label,
    videoRef,
    wedgeInputRef,
    isScanning,
    facingMode,
    imageSrc,
    displayCode,
    isStabilizing,
    decodeError,
    dakinisHandleWedgeInputKeyDown,
    dakinisHandleWedgeInputChange,
    dakinisHandleWedgePaste,
    startScanning,
    stopScanning,
    flipCamera,
    handleImageChange
  } = useStockBarcodeScanner({ onScan, t });

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
        <video
          ref={videoRef}
          className="stock-scanner__video"
          playsInline
          muted
          aria-label={label("kitchen.scanVideoAria", "Vista de cámara para escanear código de barras")}
        />
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
