import { useEffect, useMemo, useState } from "react";
import {
  dakinisFormatOrderSentTime,
  dakinisKitchenElapsedMinutes,
  dakinisKitchenElapsedTone
} from "../utils/restaurantOrderTime.js";

const TICK_MS = 30_000;

/** Hora de envío y tiempo en cocina (se actualiza cada 30 s). */
export default function FerminaKitchenOrderTime({ createdAt, t, locale = "es" }) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const sentLabel = useMemo(() => dakinisFormatOrderSentTime(createdAt, locale), [createdAt, locale]);
  const elapsedMin = useMemo(
    () => dakinisKitchenElapsedMinutes(createdAt, nowMs),
    [createdAt, nowMs]
  );
  const tone = dakinisKitchenElapsedTone(elapsedMin);

  return (
    <div className="fermina-kitchen-time" aria-live="polite">
      <span className="fermina-kitchen-time__sent">
        {t("fermina.kitchenSentAt", { time: sentLabel })}
      </span>
      <span className={`fermina-kitchen-time__elapsed fermina-kitchen-time__elapsed--${tone}`}>
        {t("fermina.kitchenElapsed", { minutes: elapsedMin })}
      </span>
    </div>
  );
}
