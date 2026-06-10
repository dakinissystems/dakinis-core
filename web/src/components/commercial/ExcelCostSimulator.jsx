import { useMemo, useState } from "react";
import { useLocale } from "../../context/LocaleContext.jsx";

const DAKINIS_WEEKLY_HOUR_PRESETS = [5, 10, 20];
const DAKINIS_HOURLY_RATE_EUR = 18;

function dakinisCalcExcelHoursCost(weeklyHours) {
  const hours = Math.max(1, Number(weeklyHours) || 1);
  const hoursPerMonth = hours * 4;
  const moneyPerMonth = Math.round(hoursPerMonth * DAKINIS_HOURLY_RATE_EUR);
  return { hoursPerMonth, moneyPerMonth };
}

export default function ExcelCostSimulator({ id = "excel-simulator", onTryDemo }) {
  const { t } = useLocale();
  const [weeklyHours, setWeeklyHours] = useState(10);

  const result = useMemo(() => dakinisCalcExcelHoursCost(weeklyHours), [weeklyHours]);

  return (
    <section className="commercial-simulator card commercial-simulator--prominent" id={id}>
      <p className="kicker">{t("commercial.simulator.kicker")}</p>
      <h3 className="commercial-simulator__title">{t("commercial.simulator.title")}</h3>
      <p className="lead commercial-simulator__lead">{t("commercial.simulator.lead")}</p>

      <p className="commercial-simulator__label">{t("commercial.simulator.hoursLabel")}</p>
      <div className="commercial-simulator__presets" role="group" aria-label={t("commercial.simulator.hoursLabel")}>
        {DAKINIS_WEEKLY_HOUR_PRESETS.map((hours) => (
          <button
            key={hours}
            type="button"
            className={`btn btn-outline commercial-simulator__preset${weeklyHours === hours ? " is-active" : ""}`}
            onClick={() => setWeeklyHours(hours)}
          >
            {t("commercial.simulator.presetHours", { hours })}
          </button>
        ))}
      </div>

      <div className="commercial-simulator__result">
        <p className="commercial-simulator__result-main">
          {t("commercial.simulator.resultHours", { hours: result.hoursPerMonth })}
        </p>
        <p className="lead commercial-simulator__result-sub">
          {t("commercial.simulator.resultMoney", { amount: result.moneyPerMonth })}
        </p>
        <p className="commercial-simulator__result-automation">{t("commercial.simulator.resultAutomation")}</p>
      </div>

      {onTryDemo ? (
        <button type="button" className="btn commercial-simulator__cta" onClick={onTryDemo}>
          {t("commercial.simulator.calcCta")}
        </button>
      ) : null}
    </section>
  );
}
