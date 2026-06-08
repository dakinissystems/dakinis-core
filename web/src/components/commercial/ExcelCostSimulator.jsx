import { useMemo, useState } from "react";
import { useLocale } from "../../context/LocaleContext.jsx";

function dakinisCalcExcelCost(employees, salesPerDay) {
  const emp = Math.max(1, Number(employees) || 1);
  const sales = Math.max(1, Number(salesPerDay) || 1);
  const hoursPerMonth = Math.round(emp * 2.5 + sales * 0.08);
  const moneyPerMonth = Math.round(hoursPerMonth * 18);
  return { hoursPerMonth, moneyPerMonth };
}

export default function ExcelCostSimulator({ id = "excel-simulator" }) {
  const { t } = useLocale();
  const [employees, setEmployees] = useState(3);
  const [salesPerDay, setSalesPerDay] = useState(25);

  const result = useMemo(() => dakinisCalcExcelCost(employees, salesPerDay), [employees, salesPerDay]);

  return (
    <section className="commercial-simulator card" id={id}>
      <p className="kicker">{t("commercial.simulator.kicker")}</p>
      <h3 style={{ margin: "0.25rem 0 0.5rem" }}>{t("commercial.simulator.title")}</h3>
      <p className="lead" style={{ fontSize: "0.95rem", marginTop: 0 }}>
        {t("commercial.simulator.lead")}
      </p>

      <div className="commercial-simulator__fields">
        <label className="mockup-field">
          <span>{t("commercial.simulator.employees")}</span>
          <input
            type="number"
            min={1}
            max={50}
            value={employees}
            onChange={(e) => setEmployees(e.target.value)}
          />
        </label>
        <label className="mockup-field">
          <span>{t("commercial.simulator.salesPerDay")}</span>
          <input
            type="number"
            min={1}
            max={500}
            value={salesPerDay}
            onChange={(e) => setSalesPerDay(e.target.value)}
          />
        </label>
      </div>

      <div className="commercial-simulator__result">
        <p className="commercial-simulator__result-main">
          {t("commercial.simulator.resultHours", { hours: result.hoursPerMonth })}
        </p>
        <p className="lead" style={{ margin: "0.5rem 0 0", fontSize: "0.9rem" }}>
          {t("commercial.simulator.resultMoney", { amount: result.moneyPerMonth })}
        </p>
      </div>
    </section>
  );
}
