import { dakinisStockDemoBarcode } from "@dakinis/shared/catalog/stock-barcodes.js";
import RestaurantAllergenPanel from "./RestaurantAllergenPanel.jsx";
import StockBarcodeScanner from "./StockBarcodeScanner.jsx";
import { dakinisFormatQty } from "../hooks/useRestaurantStockSection.js";

export function RestaurantStockScanPanel({
  t,
  dakinisApplyStockScan,
  scanQty,
  setScanQty,
  scanDirection,
  setScanDirection,
  scanMessage,
  unknownBarcode,
  newProductName,
  setNewProductName,
  newProductUnit,
  setNewProductUnit,
  newProductMin,
  setNewProductMin,
  newProductExpiry,
  setNewProductExpiry,
  busy,
  dakinisCreateProductFromScan,
  setScanMessage,
  autoFocus = false
}) {
  return (
    <article className="card stock-panel__scan" style={{ marginBottom: "1rem" }}>
      <h4 style={{ marginTop: 0 }}>{t("kitchen.scanTitle")}</h4>
      <StockBarcodeScanner onScan={dakinisApplyStockScan} t={t} autoFocus={autoFocus} />
      <div className="stock-scan-actions">
        <label className="mockup-field">
          <span>{t("kitchen.scanQtyLabel")}</span>
          <input
            type="number"
            min="0.01"
            step="any"
            inputMode="decimal"
            value={scanQty}
            onChange={(e) => setScanQty(e.target.value)}
          />
        </label>
        <div className="stock-scan-actions__dir" role="group" aria-label={t("kitchen.scanDirection")}>
          <button
            type="button"
            className={scanDirection === "in" ? "btn" : "btn btn-outline"}
            onClick={() => setScanDirection("in")}
          >
            {t("kitchen.scanIn")}
          </button>
          <button
            type="button"
            className={scanDirection === "out" ? "btn" : "btn btn-outline"}
            onClick={() => setScanDirection("out")}
          >
            {t("kitchen.scanOut")}
          </button>
        </div>
      </div>
      {scanMessage ? (
        <p
          className="lead"
          style={{
            fontSize: "0.9rem",
            margin: "0.5rem 0 0",
            color: unknownBarcode ? "#fdba74" : "#86efac"
          }}
        >
          {scanMessage}
        </p>
      ) : null}

      {unknownBarcode ? (
        <form className="mockup-form card" style={{ marginTop: "1rem" }} onSubmit={dakinisCreateProductFromScan}>
          <p className="kpi-label">{t("kitchen.scanAddProductLead")}</p>
          <p className="kpi-label">
            {t("kitchen.scanCode")}: <strong>{unknownBarcode}</strong>
          </p>
          <label className="mockup-field">
            <span>{t("kitchen.scanProductName")}</span>
            <input
              value={newProductName}
              onChange={(ev) => setNewProductName(ev.target.value)}
              required
              placeholder={t("kitchen.scanProductNamePlaceholder")}
            />
          </label>
          <label className="mockup-field">
            <span>{t("kitchen.scanProductUnit")}</span>
            <select value={newProductUnit} onChange={(ev) => setNewProductUnit(ev.target.value)}>
              <option value="u">u</option>
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="kg">kg</option>
              <option value="L">L</option>
            </select>
          </label>
          <label className="mockup-field">
            <span>{t("kitchen.minimum")}</span>
            <input
              type="number"
              min="0"
              step="any"
              value={newProductMin}
              onChange={(ev) => setNewProductMin(ev.target.value)}
            />
          </label>
          <label className="mockup-field">
            <span>{t("kitchen.scanProductExpiry")}</span>
            <input
              type="date"
              value={newProductExpiry}
              onChange={(ev) => setNewProductExpiry(ev.target.value)}
            />
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <button type="submit" className="btn" disabled={busy || !newProductName.trim()}>
              {t("kitchen.scanAddProduct")}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              disabled={busy}
              onClick={() => {
                setNewProductName("");
                setNewProductUnit("u");
                setNewProductMin("0");
                setNewProductExpiry("");
                setScanMessage(t("kitchen.scanUnknownPrompt"));
              }}
            >
              {t("kitchen.scanAddProductCancel")}
            </button>
          </div>
        </form>
      ) : null}

      <p className="kpi-label" style={{ marginTop: "0.75rem" }}>
        {t("kitchen.scanCodesHint")}
      </p>
    </article>
  );
}

export function RestaurantStockInventoryGrid({
  t,
  kitchen,
  busy,
  dakinisApplyDemoPurchase,
  plan,
  itemNames,
  dakinisUpdatePlanBatch,
  dakinisRunSimulate,
  apiSession,
  dakinisApplyProduction,
  simulation
}) {
  return (
    <div className="module-grid tenant-panel-grid">
      <article className="card">
        <h4>{t("kitchen.inventory")}</h4>
        <div className="mockup-table-wrap tenant-table-scroll">
          <table className="mockup-table tenant-stock-table">
            <thead>
              <tr>
                <th>{t("kitchen.ingredient")}</th>
                <th>{t("kitchen.scanCodeCol")}</th>
                <th>{t("kitchen.stock")}</th>
                <th>{t("kitchen.minimum")}</th>
              </tr>
            </thead>
            <tbody>
              {kitchen.items.map((item) => (
                <tr key={item.id}>
                  <td data-label={t("kitchen.ingredient")}>{item.name}</td>
                  <td data-label={t("kitchen.scanCodeCol")} className="kpi-label">
                    {item.barcode || dakinisStockDemoBarcode(item.slug)}
                  </td>
                  <td
                    data-label={t("kitchen.stock")}
                    style={item.quantity < item.minQuantity ? { color: "#fdba74" } : undefined}
                  >
                    {dakinisFormatQty(item.quantity, item.unit)}
                  </td>
                  <td data-label={t("kitchen.minimum")}>{dakinisFormatQty(item.minQuantity, item.unit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="btn btn-outline tenant-touch-btn" disabled={busy} onClick={dakinisApplyDemoPurchase}>
          {t("kitchen.demoPurchase")}
        </button>
      </article>

      <article className="card">
        <h4>{t("kitchen.recipes")}</h4>
        {kitchen.recipes.map((recipe) => (
          <div key={recipe.id} style={{ marginBottom: "1rem" }}>
            <p>
              <strong>{recipe.name}</strong> → {recipe.outputQuantity} {recipe.outputUnit} ({recipe.outputLabel})
            </p>
            <ul>
              {recipe.lines.map((line) => (
                <li key={`${recipe.id}-${line.itemSlug}`}>
                  {line.quantity} {line.unit} — {itemNames[line.itemSlug] || line.itemSlug}
                </li>
              ))}
            </ul>
            <p className="kpi-label">
              {t("kitchen.maxBatches", {
                count: kitchen.maxPerRecipe.find((m) => m.recipeSlug === recipe.slug)?.maxBatches ?? 0
              })}
            </p>
            <label className="mockup-field">
              <span>{t("kitchen.batches")}</span>
              <input
                type="number"
                min="0"
                step="1"
                value={plan.find((p) => p.recipeSlug === recipe.slug)?.batches ?? 0}
                onChange={(e) => dakinisUpdatePlanBatch(recipe.slug, e.target.value)}
              />
            </label>
          </div>
        ))}
        <div className="tenant-action-row">
          <button type="button" className="btn btn-outline tenant-touch-btn" disabled={busy} onClick={dakinisRunSimulate}>
            {t("kitchen.simulate")}
          </button>
          <button
            type="button"
            className="btn tenant-touch-btn"
            disabled={busy || !apiSession?.token}
            onClick={dakinisApplyProduction}
          >
            {t("kitchen.registerProduction")}
          </button>
        </div>
        {simulation ? (
          <div style={{ marginTop: "0.75rem" }}>
            {simulation.validation?.ok ? (
              <p className="lead" style={{ color: "#86efac" }}>
                {t("kitchen.planOk")}{" "}
                {simulation.outputs?.map((o) => `${o.totalOutput} ${o.outputLabel}`).join(" · ")}
              </p>
            ) : (
              <ul>
                {simulation.validation?.shortages?.map((s) => (
                  <li key={s.itemSlug} style={{ color: "#fdba74" }}>
                    {t("kitchen.shortage", {
                      item: itemNames[s.itemSlug] || s.itemSlug,
                      needed: s.needed,
                      available: s.available
                    })}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </article>
    </div>
  );
}

export function RestaurantStockProductionHistory({ t, kitchen, dateLocale }) {
  if (!kitchen.productionHistory?.length) return null;

  return (
    <article className="card" style={{ marginTop: "1rem" }}>
      <h4>{t("kitchen.lastProductions")}</h4>
      <ul>
        {kitchen.productionHistory.map((b) => (
          <li key={b.id}>
            <strong>{b.label}</strong> — {new Date(b.createdAt).toLocaleString(dateLocale)}
            {b.outputs?.map((o) => (
              <span key={o.recipeSlug}>
                {" "}
                · {o.totalOutput} {o.outputLabel}
              </span>
            ))}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function RestaurantStockAllergenSection({ apiSession, fetchOpts, kitchen, reload, busy, setBusy, setError }) {
  return (
    <RestaurantAllergenPanel
      apiSession={apiSession}
      fetchOpts={fetchOpts}
      profile={kitchen.profile}
      onSaved={reload}
      busy={busy}
      setBusy={setBusy}
      setError={setError}
    />
  );
}
