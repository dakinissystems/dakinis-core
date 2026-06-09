import { useCallback, useRef, useState } from "react";
import {
  dakinisReadFloatingPosition,
  dakinisWriteFloatingPosition
} from "../utils/draggableFloatingPosition.js";

const DRAG_THRESHOLD_PX = 5;

/**
 * Arrastre flotante (% viewport) con persistencia local — paridad con StreamAutomator.
 * Toque corto sin superar umbral → onTap(); arrastre → guarda posición.
 */
export function useDraggableFloatingButton({ storageKey, onTap }) {
  const [pos, setPos] = useState(() => dakinisReadFloatingPosition(storageKey));
  const dragStartRef = useRef(null);
  const pointerOriginRef = useRef(null);
  const hasMovedRef = useRef(false);

  const savePosition = useCallback(
    (x, y) => {
      dakinisWriteFloatingPosition(storageKey, { x, y });
    },
    [storageKey]
  );

  const handlePointerDown = useCallback(
    (e) => {
      e.preventDefault();
      hasMovedRef.current = false;
      pointerOriginRef.current = { x: e.clientX, y: e.clientY };
      dragStartRef.current = { x: e.clientX, y: e.clientY, posX: pos.x, posY: pos.y };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [pos.x, pos.y]
  );

  const handlePointerMove = useCallback((e) => {
    if (dragStartRef.current === null) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = e.clientX;
    const cy = e.clientY;
    const origin = pointerOriginRef.current;

    if (origin) {
      const dist = Math.hypot(cx - origin.x, cy - origin.y);
      if (dist > DRAG_THRESHOLD_PX) hasMovedRef.current = true;
    }

    const start = dragStartRef.current;
    const dx = ((cx - start.x) / w) * 100;
    const dy = ((cy - start.y) / h) * 100;
    const nx = Math.max(0, Math.min(100, start.posX + dx));
    const ny = Math.max(0, Math.min(100, start.posY + dy));
    setPos({ x: nx, y: ny });
    dragStartRef.current = { x: cx, y: cy, posX: nx, posY: ny };
  }, []);

  const handlePointerUp = useCallback(
    (e) => {
      e.currentTarget.releasePointerCapture(e.pointerId);
      const start = dragStartRef.current;
      const finalX = start ? start.posX : pos.x;
      const finalY = start ? start.posY : pos.y;

      if (hasMovedRef.current) {
        setPos({ x: finalX, y: finalY });
        savePosition(finalX, finalY);
      } else {
        onTap?.();
      }

      dragStartRef.current = null;
      pointerOriginRef.current = null;
    },
    [onTap, pos.x, pos.y, savePosition]
  );

  const handlePointerCancel = useCallback(
    (e) => {
      e.currentTarget.releasePointerCapture(e.pointerId);
      if (dragStartRef.current && hasMovedRef.current) {
        const start = dragStartRef.current;
        setPos({ x: start.posX, y: start.posY });
        savePosition(start.posX, start.posY);
      }
      dragStartRef.current = null;
      pointerOriginRef.current = null;
    },
    [savePosition]
  );

  const handleClick = useCallback((e) => {
    e.preventDefault();
  }, []);

  return {
    pos,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleClick,
    fabStyle: {
      left: `${pos.x}%`,
      top: `${pos.y}%`,
      transform: "translate(-50%, -50%)"
    }
  };
}
