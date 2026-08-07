import { useCallback, useEffect, useRef, useState } from "react";
import {
  dakinisDecodeBarcodeFromImage,
  dakinisIsPlausibleBarcode,
  dakinisNormalizeScanReading,
  dakinisStartLiveBarcodeScanner
} from "../utils/stockBarcodeDecode.js";
import { dakinisAttachHidBarcodeWedge } from "../utils/hidBarcodeWedge.js";

function dakinisFeedbackScanSuccess() {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(40);
    }
  } catch {
    /* ignore */
  }
}

export function useStockBarcodeScanner({ onScan, t }) {
  const videoRef = useRef(null);
  const wedgeInputRef = useRef(null);
  const wedgeFlushRef = useRef(null);
  const stopRef = useRef(null);
  const confirmedRef = useRef("");
  const activityTimerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [imageSrc, setImageSrc] = useState("");
  const [isSeeking, setIsSeeking] = useState(false);
  const [confirmedCode, setConfirmedCode] = useState("");
  const [decodeError, setDecodeError] = useState("");

  const label = (key, fallback) => (t ? t(key) : fallback);

  const confirmCode = useCallback(
    (code, { fromCamera = false } = {}) => {
      const trimmed = dakinisNormalizeScanReading(code);
      if (!trimmed) return;
      if (trimmed === confirmedRef.current) return;
      confirmedRef.current = trimmed;
      setIsSeeking(false);
      setConfirmedCode(trimmed);
      setDecodeError("");
      dakinisFeedbackScanSuccess();
      onScan?.(trimmed);

      if (!fromCamera) {
        wedgeInputRef.current?.focus?.();
      }
    },
    [onScan]
  );

  const handleActivity = useCallback(() => {
    setIsSeeking(true);
    if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
    activityTimerRef.current = setTimeout(() => {
      setIsSeeking(false);
    }, 900);
  }, []);

  const stopCameraStream = useCallback(() => {
    if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
    if (stopRef.current) {
      stopRef.current();
      stopRef.current = null;
    }
    setIsScanning(false);
    setIsSeeking(false);
  }, []);

  const stopScanning = useCallback(() => {
    stopCameraStream();
    confirmedRef.current = "";
    setConfirmedCode("");
  }, [stopCameraStream]);

  useEffect(() => () => stopCameraStream(), [stopCameraStream]);

  useEffect(() => {
    const detach = dakinisAttachHidBarcodeWedge((code) => confirmCode(code, { fromCamera: false }), {
      minLength: 8
    });
    return detach;
  }, [confirmCode]);

  useEffect(() => {
    const id = window.setTimeout(() => wedgeInputRef.current?.focus?.(), 200);
    return () => window.clearTimeout(id);
  }, []);

  function dakinisFlushWedgeInput(el) {
    const raw = el?.value?.trim();
    if (!raw || !dakinisIsPlausibleBarcode(raw, { requireChecksum: false })) return;
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
      setIsSeeking(false);
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
          onActivity: handleActivity,
          minVotes: 4,
          windowMs: 700,
          cooldownMs: 1000,
          torch: face === "environment"
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
      setIsSeeking(false);
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

  return {
    label,
    videoRef,
    wedgeInputRef,
    isScanning,
    facingMode,
    imageSrc,
    confirmedCode,
    isSeeking,
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
