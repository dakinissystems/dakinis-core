import { useEffect, useMemo, useState } from "react";
import { useLocale } from "../context/LocaleContext.jsx";
import {
  dakinisCashFloatDateKey,
  dakinisReadCashFloat,
  dakinisWriteCashFloat
} from "../utils/restaurantCashFloat.js";

/**
 * Resumen TPV encima de cierre/facturas + dinero inicio de día.
 */
export default function RestaurantCajaTpvSummary({ dayClose, onJumpCierre, businessId }) {
  const { t } = useLocale();
  const dateKey = dakinisCashFloatDateKey();
  const [openingInput, setOpeningInput] = useState("");
  const [openingSaved, setOpeningSaved] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const saved = dakinisReadCashFloat(businessId, dateKey);
    setOpeningSaved(saved);
    setOpeningInput(saved != null ? String(saved) : "");
  }, [businessId, dateKey]);

  const byPayment = Array.isArray(dayClose?.byPayment) ? dayClose.byPayment : [];
  const total = dayClose?.grandTotal ?? dayClose?.cashTotal ?? dayClose?.total ?? null;
  const orderCount = dayClose?.closed?.length ?? dayClose?.orderCount ?? dayClose?.orders ?? "—";

  const cashSales = useMemo(() => {
    const row = byPayment.find((r) => r.id === "efectivo" || /efectivo|cash/i.test(String(r.label || "")));
    return row ? Number(row.total ?? row.amount ?? 0) || 0 : 0;
  }, [byPayment]);

  const expectedCash =
    openingSaved != null ? Math.round((openingSaved + cashSales) * 100) / 100 : null;

  function saveOpening() {
    setNotice("");
    try {
      const n = dakinisWriteCashFloat(businessId, openingInput === "" ? 0 : openingInput, dateKey);
      setOpeningSaved(n);
      setOpeningInput(String(n));
      setNotice(t("restaurant.cajaOpeningSaved", "Fondo de caja guardado"));
    } catch (e) {
      setNotice(e instanceof Error ? e.message : t("restaurant.cajaOpeningError", "No se pudo guardar"));
    }
  }

  if (!dayClose) return null;

  return (
    <article className="card restaurant-caja-tpv" style={{ marginBottom: "0.75rem" }}>
      <h4 style={{ marginTop: 0 }}>{t("restaurant.cajaTpvTitle", "Caja (hoy)")}</h4>
      <ul className="restaurant-caja-tpv__stats">
        <li>
          <span className="restaurant-caja-tpv__value">{orderCount}</span>
          <span className="restaurant-caja-tpv__label">{t("restaurant.cajaTpvOrders", "Cobros")}</span>
        </li>
        <li>
          <span className="restaurant-caja-tpv__value">
            {total != null ? `${Number(total).toFixed(2)} €` : "—"}
          </span>
          <span className="restaurant-caja-tpv__label">{t("restaurant.cajaTpvCash", "Total")}</span>
        </li>
        <li>
          <span className="restaurant-caja-tpv__value">
            {openingSaved != null ? `${openingSaved.toFixed(2)} €` : "—"}
          </span>
          <span className="restaurant-caja-tpv__label">
            {t("restaurant.cajaOpeningLabel", "Inicio de día")}
          </span>
        </li>
        <li>
          <span className="restaurant-caja-tpv__value">
            {expectedCash != null ? `${expectedCash.toFixed(2)} €` : "—"}
          </span>
          <span className="restaurant-caja-tpv__label">
            {t("restaurant.cajaExpectedCash", "Efectivo esperado")}
          </span>
        </li>
      </ul>

      <div
        className="restaurant-caja-tpv__opening"
        style={{
          marginTop: "0.85rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          alignItems: "flex-end"
        }}
      >
        <label className="mockup-field" style={{ margin: 0, minWidth: "10rem" }}>
          <span>{t("restaurant.cajaOpeningInput", "Dinero inicio de día (€)")}</span>
          <input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={openingInput}
            onChange={(e) => setOpeningInput(e.target.value)}
            placeholder="0.00"
          />
        </label>
        <button type="button" className="btn" onClick={saveOpening}>
          {t("restaurant.cajaOpeningSave", "Guardar fondo")}
        </button>
      </div>
      <p className="kpi-label" style={{ margin: "0.35rem 0 0" }}>
        {t(
          "restaurant.cajaOpeningHint",
          "Efectivo esperado = inicio + cobros en efectivo del día."
        )}
      </p>
      {notice ? (
        <p className="kpi-label" style={{ margin: "0.35rem 0 0", color: "#5eead4" }}>
          {notice}
        </p>
      ) : null}

      {byPayment.length > 0 ? (
        <ul className="kpi-label" style={{ margin: "0.5rem 0 0", paddingLeft: "1.1rem" }}>
          {byPayment.map((row) => (
            <li key={row.label || row.method || row.id}>
              {row.label || row.method}: <strong>{Number(row.total ?? row.amount ?? 0).toFixed(2)} €</strong>
              {row.count != null ? ` · ${row.count}` : ""}
            </li>
          ))}
        </ul>
      ) : null}
      {onJumpCierre ? (
        <button type="button" className="btn" style={{ marginTop: "0.75rem" }} onClick={onJumpCierre}>
          {t("restaurant.cajaTpvClose", "Ir a cierre")}
        </button>
      ) : null}
    </article>
  );
}
