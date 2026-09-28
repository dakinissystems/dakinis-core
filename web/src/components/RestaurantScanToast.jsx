import { useEffect, useState } from "react";

/**
 * Feedback inmediato de escaneo (~800 ms).
 */
export default function RestaurantScanToast({ message, tone = "ok" }) {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!message) return undefined;
    setText(message);
    setVisible(true);
    const id = window.setTimeout(() => setVisible(false), 800);
    return () => window.clearTimeout(id);
  }, [message]);

  if (!visible || !text) return null;

  return (
    <div className={`restaurant-scan-toast restaurant-scan-toast--${tone}`} role="status" aria-live="polite">
      <span aria-hidden="true">✔</span> {text}
    </div>
  );
}
