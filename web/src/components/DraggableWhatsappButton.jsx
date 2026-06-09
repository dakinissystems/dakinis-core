import { useCallback, useRef, useState } from "react";
import { dakinisContactWhatsappUrl } from "@dakinis/shared-brand/social-links";
import { useLocale } from "../context/LocaleContext.jsx";
import {
  dakinisReadFloatingPosition,
  dakinisWriteFloatingPosition
} from "../utils/draggableFloatingPosition.js";

const STORAGE_KEY = "dakinis-whatsapp-fab-position";
const DRAG_THRESHOLD_PX = 8;

function WhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" className="whatsapp-fab__icon" aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
      />
    </svg>
  );
}

function dakinisOpenWhatsapp(href) {
  window.open(href, "_blank", "noopener,noreferrer");
}

export default function DraggableWhatsappButton() {
  const { locale, t } = useLocale();
  const href = dakinisContactWhatsappUrl(locale);
  const [pos, setPos] = useState(() => dakinisReadFloatingPosition(STORAGE_KEY));
  const dragStartRef = useRef(null);
  const pointerOriginRef = useRef(null);
  const hasMovedRef = useRef(false);

  const savePosition = useCallback((x, y) => {
    dakinisWriteFloatingPosition(STORAGE_KEY, { x, y });
  }, []);

  const handlePointerDown = (e) => {
    hasMovedRef.current = false;
    pointerOriginRef.current = { x: e.clientX, y: e.clientY };
    dragStartRef.current = { x: e.clientX, y: e.clientY, posX: pos.x, posY: pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragStartRef.current || !pointerOriginRef.current) return;

    const origin = pointerOriginRef.current;
    const moved = Math.hypot(e.clientX - origin.x, e.clientY - origin.y) > DRAG_THRESHOLD_PX;
    if (!moved) return;

    hasMovedRef.current = true;
    e.preventDefault();

    const w = window.innerWidth;
    const h = window.innerHeight;
    const start = dragStartRef.current;
    const dx = ((e.clientX - start.x) / w) * 100;
    const dy = ((e.clientY - start.y) / h) * 100;
    const nx = Math.max(0, Math.min(100, start.posX + dx));
    const ny = Math.max(0, Math.min(100, start.posY + dy));
    setPos({ x: nx, y: ny });
    dragStartRef.current = { x: e.clientX, y: e.clientY, posX: nx, posY: ny };
  };

  const handlePointerUp = (e) => {
    const start = dragStartRef.current;
    const didMove = hasMovedRef.current;

    e.currentTarget.releasePointerCapture(e.pointerId);

    if (didMove && start) {
      setPos({ x: start.posX, y: start.posY });
      savePosition(start.posX, start.posY);
    } else if (!didMove) {
      dakinisOpenWhatsapp(href);
    }

    dragStartRef.current = null;
    pointerOriginRef.current = null;
    hasMovedRef.current = false;
  };

  const handlePointerCancel = (e) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragStartRef.current = null;
    pointerOriginRef.current = null;
    hasMovedRef.current = false;
  };

  const handleClick = (e) => {
    e.preventDefault();
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-fab"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: "translate(-50%, -50%)"
      }}
      aria-label={t("home.pricing.whatsappCta")}
      title={t("home.pricing.whatsappCta")}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <WhatsappIcon />
    </a>
  );
}
