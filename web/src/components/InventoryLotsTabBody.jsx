import StockBarcodeScanner from "./StockBarcodeScanner.jsx";

export function InventoryLotsSummaryTab({ summary, t }) {
  return (
    <div className="inventory-lots-summary">
      <div className="inventory-lots-summary__kpis">
        <article className="card inventory-lot-severity--critical">
          <p className="kpi-label">{t("inventoryLots.expire3d")}</p>
          <p className="kpi-value">{summary.critical ?? 0}</p>
        </article>
        <article className="card inventory-lot-severity--warning">
          <p className="kpi-label">{t("inventoryLots.expire7d")}</p>
          <p className="kpi-value">{summary.warning ?? 0}</p>
        </article>
        <article className="card inventory-lot-severity--ok">
          <p className="kpi-label">{t("inventoryLots.stockOk")}</p>
          <p className="kpi-value">{summary.ok ?? 0}</p>
        </article>
      </div>
      <p className="kpi-label">{t("inventoryLots.fifoNote")}</p>
    </div>
  );
}

export function InventoryLotsReceiveTab({
  t,
  busy,
  lastLabel,
  LotLabelCard,
  printLabel,
  handleReceive,
  locations,
  productBarcode,
  setProductBarcode,
  productName,
  setProductName,
  supplierLot,
  setSupplierLot,
  expiryDate,
  setExpiryDate,
  quantity,
  setQuantity,
  locationId,
  setLocationId,
  supplier,
  setSupplier
}) {
  return (
    <form className="inventory-lots-receive" onSubmit={handleReceive}>
      <p className="lead" style={{ fontSize: "0.9rem" }}>
        {t("inventoryLots.receiveLead")}
      </p>
      <div className="inventory-lots-receive__grid">
        <label className="mockup-field">
          <span>{t("inventoryLots.productBarcode")}</span>
          <input value={productBarcode} onChange={(e) => setProductBarcode(e.target.value)} placeholder="8412345678901" />
        </label>
        <label className="mockup-field">
          <span>{t("inventoryLots.productName")}</span>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder={t("inventoryLots.productNamePlaceholder")}
            required
          />
        </label>
        <label className="mockup-field">
          <span>{t("inventoryLots.supplierLot")}</span>
          <input value={supplierLot} onChange={(e) => setSupplierLot(e.target.value)} placeholder="A245" />
        </label>
        <label className="mockup-field">
          <span>{t("inventoryLots.expiryOptional")}</span>
          <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
        </label>
        <label className="mockup-field">
          <span>{t("inventoryLots.quantity")}</span>
          <input type="number" min="0.01" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </label>
        <label className="mockup-field">
          <span>{t("inventoryLots.location")}</span>
          <select value={locationId} onChange={(e) => setLocationId(e.target.value)} required>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </label>
        <label className="mockup-field">
          <span>{t("inventoryLots.supplier")}</span>
          <input value={supplier} onChange={(e) => setSupplier(e.target.value)} />
        </label>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
        <button type="submit" className="btn" disabled={busy}>
          {t("inventoryLots.receiveCta")}
        </button>
      </div>
      {lastLabel ? (
        <div style={{ marginTop: "1rem" }}>
          <LotLabelCard lot={lastLabel} t={t} onPrint={() => printLabel(lastLabel)} />
        </div>
      ) : null}
    </form>
  );
}

export function InventoryLotsFridgesTab({ byLocation, SeverityBadge, t }) {
  return (
    <div className="inventory-fridge-map">
      {Object.entries(byLocation).length === 0 ? (
        <p className="lead">{t("inventoryLots.noLots")}</p>
      ) : (
        Object.entries(byLocation).map(([locName, locLots]) => (
          <article key={locName} className="card inventory-fridge-map__zone">
            <h4 style={{ marginTop: 0 }}>{locName}</h4>
            <ul className="inventory-fridge-map__list">
              {(locLots || []).map((lot) => (
                <li key={lot.id || lot.labelCode}>
                  <strong>{lot.productName}</strong>
                  <span className="kpi-label">
                    {lot.supplierLot ? `${lot.supplierLot} · ` : ""}
                    {t("inventoryLots.expiry")} {lot.expiryDate}
                  </span>
                  <SeverityBadge severity={lot.expirySeverity} t={t} />
                </li>
              ))}
            </ul>
          </article>
        ))
      )}
    </div>
  );
}

export function InventoryLotsTableTab({ lots, SeverityBadge, t }) {
  return (
    <div className="mockup-table-card">
      <table className="mockup-table">
        <thead>
          <tr>
            <th>{t("inventoryLots.colCode")}</th>
            <th>{t("inventoryLots.colProduct")}</th>
            <th>{t("inventoryLots.colLot")}</th>
            <th>{t("inventoryLots.colExpiry")}</th>
            <th>{t("inventoryLots.colQty")}</th>
            <th>{t("inventoryLots.colLocation")}</th>
            <th>{t("inventoryLots.colStatus")}</th>
          </tr>
        </thead>
        <tbody>
          {lots.map((lot) => (
            <tr key={lot.id || lot.labelCode}>
              <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{lot.labelCode}</td>
              <td>{lot.productName}</td>
              <td>{lot.supplierLot || "—"}</td>
              <td>{lot.expiryDate}</td>
              <td>{lot.quantityRemaining}</td>
              <td>{lot.locationName || "—"}</td>
              <td>
                <SeverityBadge severity={lot.expirySeverity} t={t} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function InventoryLotsScanTab({ t, scanResult, SeverityBadge, handleScanCode }) {
  return (
    <div>
      <p className="lead" style={{ fontSize: "0.9rem" }}>
        {t("inventoryLots.scanLead")}
      </p>
      <StockBarcodeScanner onScan={handleScanCode} t={t} hint={t("inventoryLots.scanHint")} />
      {scanResult ? (
        <article className="card" style={{ marginTop: "1rem" }}>
          {scanResult.error ? (
            <p>{scanResult.error}</p>
          ) : (
            <>
              <strong>{scanResult.productName}</strong>
              <p className="kpi-label">{scanResult.labelCode}</p>
              <p>
                {t("inventoryLots.supplierLot")}: {scanResult.supplierLot || "—"} · {t("inventoryLots.expiry")}:{" "}
                {scanResult.expiryDate}
              </p>
              <p>
                {t("inventoryLots.quantity")}: {scanResult.quantityRemaining} · {scanResult.locationName}
              </p>
              {scanResult.daysUntilExpiry != null ? (
                <SeverityBadge severity={scanResult.expirySeverity} t={t} />
              ) : null}
            </>
          )}
        </article>
      ) : null}
    </div>
  );
}

export function InventoryLotsGuideTab({ t }) {
  return (
    <div className="inventory-lots-guide">
      <article className="card">
        <h4 style={{ marginTop: 0 }}>{t("inventoryLots.guideQrTitle")}</h4>
        <p className="lead" style={{ fontSize: "0.9rem" }}>{t("inventoryLots.guideQrLead")}</p>
        <ul>
          {(t("inventoryLots.guideQrBullets") || []).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
      <article className="card">
        <h4 style={{ marginTop: 0 }}>{t("inventoryLots.guideCostTitle")}</h4>
        <p className="lead" style={{ fontSize: "0.9rem" }}>{t("inventoryLots.guideCostLead")}</p>
        <ul>
          {(t("inventoryLots.guideCostBullets") || []).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
      <article className="card">
        <h4 style={{ marginTop: 0 }}>{t("inventoryLots.guideFridgeTitle")}</h4>
        <p className="lead" style={{ fontSize: "0.9rem" }}>{t("inventoryLots.guideFridgeLead")}</p>
      </article>
      <article className="card">
        <h4 style={{ marginTop: 0 }}>{t("inventoryLots.guideFifoTitle")}</h4>
        <p className="lead" style={{ fontSize: "0.9rem" }}>{t("inventoryLots.guideFifoLead")}</p>
      </article>
    </div>
  );
}
