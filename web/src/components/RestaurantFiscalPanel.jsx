import { useCallback, useEffect, useState } from "react";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisTenantJsonFetch } from "../services/api.js";

/**
 * Panel de facturación fiscal (base VERI*FACTU).
 * Independiente del ticket de sala — requiere migración 060 + ajustes emisor.
 */
export default function RestaurantFiscalPanel({ apiSession, fetchOpts }) {
  const { t } = useLocale();
  const [settings, setSettings] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState({
    enabled: false,
    mode: "no_verifactu",
    series: "A",
    issuerName: "",
    issuerTaxId: "",
    issuerAddress: "",
    defaultTaxRate: 10
  });

  const reload = useCallback(async () => {
    if (!apiSession?.token) return;
    setError("");
    try {
      const [sRes, iRes] = await Promise.all([
        dakinisTenantJsonFetch("/api/tenant/fiscal/settings", apiSession, fetchOpts),
        dakinisTenantJsonFetch("/api/tenant/fiscal/invoices?limit=40", apiSession, fetchOpts)
      ]);
      const s = sRes?.data?.settings;
      setSettings(s || null);
      if (s) {
        setDraft({
          enabled: Boolean(s.enabled),
          mode: s.mode === "disabled" ? "no_verifactu" : s.mode,
          series: s.series || "A",
          issuerName: s.issuerName || "",
          issuerTaxId: s.issuerTaxId || "",
          issuerAddress: s.issuerAddress || "",
          defaultTaxRate: s.defaultTaxRate ?? 10
        });
      }
      setInvoices(Array.isArray(iRes?.data?.invoices) ? iRes.data.invoices : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("fermina.loadError"));
    }
  }, [apiSession, fetchOpts, t]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function saveSettings() {
    if (!apiSession?.token) return;
    setBusy(true);
    setNotice("");
    setError("");
    try {
      const res = await dakinisTenantJsonFetch("/api/tenant/fiscal/settings", apiSession, {
        ...fetchOpts,
        method: "PATCH",
        body: {
          enabled: draft.enabled,
          mode: draft.enabled ? draft.mode : "disabled",
          series: draft.series,
          issuerName: draft.issuerName,
          issuerTaxId: draft.issuerTaxId,
          issuerAddress: draft.issuerAddress,
          defaultTaxRate: Number(draft.defaultTaxRate) || 0
        }
      });
      setSettings(res?.data?.settings || null);
      setNotice(t("restaurant.fiscalSaved", "Ajustes fiscales guardados"));
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("restaurant.floorSaveError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card" style={{ marginTop: "1rem" }}>
      <h3 style={{ marginTop: 0 }}>{t("restaurant.fiscalTitle", "Facturación fiscal (VERI*FACTU)")}</h3>
      <p className="lead" style={{ fontSize: "0.9rem" }}>
        {t(
          "restaurant.fiscalLead",
          "Módulo independiente: numeración, IVA, huella encadenada, QR y rectificativas. No es certificación AEAT completa; prepara el cumplimiento antes de 2027."
        )}
      </p>

      {error ? <p className="error-text">{error}</p> : null}
      {notice ? <p className="kpi-label">{notice}</p> : null}

      <div className="mockup-grid" style={{ display: "grid", gap: "0.75rem", maxWidth: 520 }}>
        <label className="mockup-field">
          <span>{t("restaurant.fiscalEnabled", "Activar emisión fiscal")}</span>
          <input
            type="checkbox"
            checked={draft.enabled}
            onChange={(e) => setDraft((d) => ({ ...d, enabled: e.target.checked }))}
          />
        </label>
        <label className="mockup-field">
          <span>{t("restaurant.fiscalMode", "Modalidad")}</span>
          <select
            value={draft.mode}
            onChange={(e) => setDraft((d) => ({ ...d, mode: e.target.value }))}
            disabled={!draft.enabled}
          >
            <option value="no_verifactu">NO VERI*FACTU (conservación local)</option>
            <option value="verifactu">VERI*FACTU (remisión — stub local)</option>
          </select>
        </label>
        <label className="mockup-field">
          <span>{t("restaurant.fiscalSeries", "Serie")}</span>
          <input value={draft.series} onChange={(e) => setDraft((d) => ({ ...d, series: e.target.value }))} />
        </label>
        <label className="mockup-field">
          <span>{t("restaurant.fiscalIssuerName", "Razón social / nombre")}</span>
          <input
            value={draft.issuerName}
            onChange={(e) => setDraft((d) => ({ ...d, issuerName: e.target.value }))}
          />
        </label>
        <label className="mockup-field">
          <span>{t("restaurant.fiscalIssuerTaxId", "NIF/CIF emisor")}</span>
          <input
            value={draft.issuerTaxId}
            onChange={(e) => setDraft((d) => ({ ...d, issuerTaxId: e.target.value }))}
          />
        </label>
        <label className="mockup-field">
          <span>{t("restaurant.fiscalIssuerAddress", "Domicilio fiscal")}</span>
          <input
            value={draft.issuerAddress}
            onChange={(e) => setDraft((d) => ({ ...d, issuerAddress: e.target.value }))}
          />
        </label>
        <label className="mockup-field">
          <span>{t("restaurant.fiscalTaxRate", "IVA por defecto %")}</span>
          <input
            type="number"
            step="0.01"
            value={draft.defaultTaxRate}
            onChange={(e) => setDraft((d) => ({ ...d, defaultTaxRate: e.target.value }))}
          />
        </label>
      </div>

      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button type="button" className="btn" disabled={busy} onClick={saveSettings}>
          {t("common.save", "Guardar")}
        </button>
        <button type="button" className="btn btn-outline" disabled={busy} onClick={reload}>
          {t("common.refresh", "Actualizar")}
        </button>
      </div>

      {settings?.mode && settings.mode !== "disabled" ? (
        <p className="kpi-label" style={{ marginTop: "0.75rem" }}>
          {t("restaurant.fiscalModeActive", "Modo activo")}: {settings.mode}
          {settings.declarationRef ? ` · ${settings.declarationRef}` : ""}
        </p>
      ) : null}

      <h4 style={{ marginTop: "1.5rem" }}>{t("restaurant.fiscalInvoices", "Registro fiscal")}</h4>
      {!invoices.length ? (
        <p className="kpi-label">
          {t(
            "restaurant.fiscalEmpty",
            "Sin facturas fiscales aún. Al emitir una factura de sala con el módulo activo, se genera el registro encadenado."
          )}
        </p>
      ) : (
        <ul className="fermina-menu-list" style={{ marginTop: "0.5rem" }}>
          {invoices.map((inv) => (
            <li key={inv.id} className="fermina-menu-item">
              <div>
                <strong>{inv.invoiceNumber}</strong>
                <span className="kpi-label">
                  {" "}
                  · {inv.customerName || "—"} · {Number(inv.totalAmount || 0).toFixed(2)} € · {inv.status}
                </span>
                <div className="kpi-label" style={{ fontSize: "0.75rem", wordBreak: "break-all" }}>
                  hash {String(inv.recordHash || "").slice(0, 24)}…
                  {inv.qrUrl ? (
                    <>
                      {" "}
                      ·{" "}
                      <a href={inv.qrUrl} target="_blank" rel="noreferrer">
                        QR AEAT
                      </a>
                    </>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
