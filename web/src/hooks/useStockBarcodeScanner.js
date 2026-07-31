import { useCallback, useEffect, useRef, useState } from "react";
import {
  dakinisDecodeBarcodeFromImage,
  dakinisIsPlausibleBarcode,
  dakinisNormalizeScanReading,
  dakinisStartLiveBarcodeScanner
} from "../utils/stockBarcodeDecode.js";
import { dakinisAttachHidBarcodeWedge } from "../utils/hidBarcodeWedge.js";

export function useStockBarcodeScanner({ onScan, t }) {
  const videoRef = useRef(null);
  const wedgeInputRef = useRef(null);
  const wedgeFlushRef = useRef(null);
  const stopRef = useRef(null);
  const confirmedRef = useRef("");
  const lastConfirmAtRef = useRef(0);
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
      const now = Date.now();
      // Mismo código: permitir re-escaneo tras cooldown (varios bultos del mismo EAN)
      if (trimmed === confirmedRef.current && now - lastConfirmAtRef.current < 1200) return;
      confirmedRef.current = trimmed;
      lastConfirmAtRef.current = now;
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
          minHits: 2,
          windowMs: 320,
          cooldownMs: 1200
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

  return {
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
  };
}
