import { useCallback, useEffect, useState } from "react";
import { dakinisTenantJsonFetch } from "../services/api.js";

function dakinisSeverityStyle(severity) {
  if (severity === "warning") return { color: "#fb923c", fontWeight: 600 };
  if (severity === "critical") return { color: "#f87171", fontWeight: 600 };
  return { color: "#94a3b8" };
}

function dakinisSeverityLabel(severity) {
  if (severity === "warning") return "Atención";
  if (severity === "critical") return "Urgente";
  return "Info";
}

/** Normaliza fila de alerta (API o fallback estático) */
function dakinisNormalizeAlertRow(row) {
  return {
    id: row.id,
    title: row.title,
    productRef: row.productRef ?? row.product_ref ?? "—",
    condition: row.condition ?? row.condition_text ?? "",
    severity: row.severity || "info"
  };
}

/** Normaliza fila de entrega */
function dakinisNormalizeDeliveryRow(row) {
  return {
    id: row.id,
    supplier: row.supplier,
    arrivalWindow: row.arrivalWindow ?? row.arrival_window ?? "",
    contents: row.contents ?? "",
    status: row.status ?? "Programado"
  };
}

export default function SupplyDeliveriesAndAlerts({
  apiSession,
  tenantSlugForVertical,
  activeSystemKey,
  supplierNames = [],
  productRefs = [],
  fallbackDeliveries = [],
  fallbackAlerts = []
}) {
  const canMutate = Boolean(apiSession?.token);

  const [deliveries, setDeliveries] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSupply = useCallback(
    async (signal) => {
      setLoadError("");
      setLoading(true);
      try {
        const [dJson, aJson] = await Promise.all([
          dakinisTenantJsonFetch("/api/tenant/supply/deliveries", apiSession, {
            signal,
            businessId: tenantSlugForVertical,
            businessTypeHeader: activeSystemKey
          }),
          dakinisTenantJsonFetch("/api/tenant/supply/alerts", apiSession, {
            signal,
            businessId: tenantSlugForVertical,
            businessTypeHeader: activeSystemKey
          })
        ]);
        const dlist = dJson?.data?.deliveries;
        const alist = aJson?.data?.alerts;
        setDeliveries(Array.isArray(dlist) ? dlist.map(dakinisNormalizeDeliveryRow) : []);
        setAlerts(Array.isArray(alist) ? alist.map(dakinisNormalizeAlertRow) : []);
      } catch (e) {
        if (e?.name === "AbortError") return;
        setLoadError(e instanceof Error ? e.message : "No se pudo cargar proveedores");
        setDeliveries(
          fallbackDeliveries.map((r, i) =>
            dakinisNormalizeDeliveryRow({ ...r, id: r.id || `fb-d-${i}` })
          )
        );
        setAlerts(
          fallbackAlerts.map((r, i) => dakinisNormalizeAlertRow({ ...r, id: r.id || `fb-a-${i}` }))
        );
      } finally {
        setLoading(false);
      }
    },
    [apiSession, tenantSlugForVertical, activeSystemKey, fallbackDeliveries, fallbackAlerts]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    loadSupply(ctrl.signal);
    return () => ctrl.abort();
  }, [loadSupply]);

  const [deliveryForm, setDeliveryForm] = useState({
    supplier: "",
    arrivalWindow: "",
    contents: "",
    status: "Programado"
  });

  const [alertForm, setAlertForm] = useState({
    title: "",
    productRef: "",
    condition: "",
    severity: "info"
  });

  async function handleAddDelivery(event) {
    event.preventDefault();
    if (!canMutate) return;
    if (!deliveryForm.supplier.trim() || !deliveryForm.arrivalWindow.trim()) return;
    setSaving(true);
    setActionError("");
    try {
      await dakinisTenantJsonFetch("/api/tenant/supply/deliveries", apiSession, {
        method: "POST",
        businessId: tenantSlugForVertical,
        businessTypeHeader: activeSystemKey,
        body: {
          supplier: deliveryForm.supplier.trim(),
          arrivalWindow: deliveryForm.arrivalWindow.trim(),
          contents: deliveryForm.contents.trim(),
          status: deliveryForm.status
        }
      });
      setDeliveryForm({ supplier: "", arrivalWindow: "", contents: "", status: "Programado" });
      await loadSupply();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo guardar la entrega");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteDelivery(id) {
    if (!canMutate || !id || String(id).startsWith("fb-")) return;
    setSaving(true);
    setActionError("");
    try {
      await dakinisTenantJsonFetch(`/api/tenant/supply/deliveries/${encodeURIComponent(id)}`, apiSession, {
        method: "DELETE",
        businessId: tenantSlugForVertical,
        businessTypeHeader: activeSystemKey
      });
      await loadSupply();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo eliminar");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddAlert(event) {
    event.preventDefault();
    if (!canMutate) return;
    if (!alertForm.title.trim() || !alertForm.condition.trim()) return;
    setSaving(true);
    setActionError("");
    try {
      await dakinisTenantJsonFetch("/api/tenant/supply/alerts", apiSession, {
        method: "POST",
        businessId: tenantSlugForVertical,
        businessTypeHeader: activeSystemKey,
        body: {
          title: alertForm.title.trim(),
          productRef: alertForm.productRef.trim(),
          condition: alertForm.condition.trim(),
          severity: alertForm.severity
        }
      });
      setAlertForm({ title: "", productRef: "", condition: "", severity: "info" });
      await loadSupply();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo crear la alerta");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAlert(id) {
    if (!canMutate || !id || String(id).startsWith("fb-")) return;
    setSaving(true);
    setActionError("");
    try {
      await dakinisTenantJsonFetch(`/api/tenant/supply/alerts/${encodeURIComponent(id)}`, apiSession, {
        method: "DELETE",
        businessId: tenantSlugForVertical,
        businessTypeHeader: activeSystemKey
      });
      await loadSupply();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No se pudo eliminar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <h4 style={{ marginTop: "1.75rem" }}>Cuándo traen la mercadería</h4>
      <p className="lead" style={{ fontSize: "0.95rem", marginBottom: "0.75rem" }}>
        Registra ventanas de reparto o visitas del proveedor. Los datos se guardan en tu espacio (SQLite por tenant).
        {!canMutate ? (
          <>
            {" "}
            <strong>Inicia sesión</strong> en el negocio para añadir o borrar filas.
          </>
        ) : null}
      </p>

      {loading ? <p className="lead">Cargando entregas…</p> : null}
      {loadError ? (
        <p className="lead" style={{ color: "#fdba74" }}>
          {loadError} (mostrando vista offline si hay datos locales de ejemplo).
        </p>
      ) : null}
      {actionError ? (
        <p className="lead" style={{ color: "#f97316" }}>
          {actionError}
        </p>
      ) : null}

      <article className="card" style={{ overflow: "auto", marginBottom: "1rem" }}>
        <table className="mockup-table">
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Fecha o ventana</th>
              <th>Qué traen</th>
              <th>Estado</th>
              {canMutate ? <th /> : null}
            </tr>
          </thead>
          <tbody>
            {deliveries.length === 0 ? (
              <tr>
                <td colSpan={canMutate ? 5 : 4}>
                  <span className="lead">Sin entregas registradas.</span>
                </td>
              </tr>
            ) : (
              deliveries.map((row) => (
                <tr key={row.id}>
                  <td>{row.supplier}</td>
                  <td>{row.arrivalWindow}</td>
                  <td>{row.contents || "—"}</td>
                  <td>{row.status}</td>
                  {canMutate ? (
                    <td>
                      {!String(row.id).startsWith("fb-") ? (
                        <button
                          type="button"
                          className="btn btn-outline"
                          disabled={saving}
                          onClick={() => handleDeleteDelivery(row.id)}
                        >
                          Eliminar
                        </button>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </article>

      <form className="mockup-form card" onSubmit={handleAddDelivery} style={{ gridTemplateColumns: "1fr 1fr" }}>
        <h5 style={{ gridColumn: "1 / -1", margin: 0 }}>Añadir recepción o reparto</h5>
        <label className="mockup-field">
          <span>Proveedor</span>
          <input
            list="supply-supplier-options"
            value={deliveryForm.supplier}
            onChange={(e) => setDeliveryForm((p) => ({ ...p, supplier: e.target.value }))}
            placeholder="Nombre o elige de la lista"
            autoComplete="off"
            disabled={!canMutate || saving}
          />
        </label>
        <datalist id="supply-supplier-options">
          {supplierNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <label className="mockup-field">
          <span>Fecha / franja</span>
          <input
            value={deliveryForm.arrivalWindow}
            onChange={(e) => setDeliveryForm((p) => ({ ...p, arrivalWindow: e.target.value }))}
            placeholder="Ej. Lun 12 may — 08:00–10:00"
            required
            disabled={!canMutate || saving}
          />
        </label>
        <label className="mockup-field">
          <span>Contenido del pedido</span>
          <input
            value={deliveryForm.contents}
            onChange={(e) => setDeliveryForm((p) => ({ ...p, contents: e.target.value }))}
            placeholder="Productos o referencia del pedido"
            disabled={!canMutate || saving}
          />
        </label>
        <label className="mockup-field">
          <span>Estado</span>
          <select
            value={deliveryForm.status}
            onChange={(e) => setDeliveryForm((p) => ({ ...p, status: e.target.value }))}
            disabled={!canMutate || saving}
          >
            <option value="Programado">Programado</option>
            <option value="Confirmado">Confirmado</option>
            <option value="En ruta">En ruta</option>
            <option value="Recibido">Recibido</option>
          </select>
        </label>
        <button
          type="submit"
          className="btn btn-outline"
          style={{ gridColumn: "1 / -1" }}
          disabled={!canMutate || saving}
        >
          {saving ? "Guardando…" : "Guardar entrega"}
        </button>
      </form>

      <h4 style={{ marginTop: "1.75rem" }}>Alertas de mercadería</h4>
      <p className="lead" style={{ fontSize: "0.95rem", marginBottom: "0.75rem" }}>
        Avisos persistentes por stock, caducidad o pedidos pendientes.
      </p>

      <article className="card" style={{ overflow: "auto", marginBottom: "1rem" }}>
        <table className="mockup-table">
          <thead>
            <tr>
              <th>Alerta</th>
              <th>Ref.</th>
              <th>Condición</th>
              <th>Nivel</th>
              {canMutate ? <th /> : null}
            </tr>
          </thead>
          <tbody>
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={canMutate ? 5 : 4}>
                  <span className="lead">Sin alertas.</span>
                </td>
              </tr>
            ) : (
              alerts.map((row) => (
                <tr key={row.id}>
                  <td>{row.title}</td>
                  <td>
                    <code>{row.productRef || "—"}</code>
                  </td>
                  <td>{row.condition}</td>
                  <td style={dakinisSeverityStyle(row.severity)}>{dakinisSeverityLabel(row.severity)}</td>
                  {canMutate ? (
                    <td>
                      {!String(row.id).startsWith("fb-") ? (
                        <button
                          type="button"
                          className="btn btn-outline"
                          disabled={saving}
                          onClick={() => handleDeleteAlert(row.id)}
                        >
                          Eliminar
                        </button>
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </article>

      <form className="mockup-form card" onSubmit={handleAddAlert} style={{ gridTemplateColumns: "1fr 1fr" }}>
        <h5 style={{ gridColumn: "1 / -1", margin: 0 }}>Nueva alerta</h5>
        <label className="mockup-field">
          <span>Nombre de la alerta</span>
          <input
            value={alertForm.title}
            onChange={(e) => setAlertForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Ej. Stock mínimo café"
            required
            disabled={!canMutate || saving}
          />
        </label>
        <label className="mockup-field">
          <span>Referencia producto (opcional)</span>
          <input
            list="supply-ref-options"
            value={alertForm.productRef}
            onChange={(e) => setAlertForm((p) => ({ ...p, productRef: e.target.value }))}
            placeholder="Código interno"
            disabled={!canMutate || saving}
          />
        </label>
        <datalist id="supply-ref-options">
          {productRefs.map((ref) => (
            <option key={ref} value={ref} />
          ))}
        </datalist>
        <label className="mockup-field" style={{ gridColumn: "1 / -1" }}>
          <span>Condición (cuándo avisar)</span>
          <input
            value={alertForm.condition}
            onChange={(e) => setAlertForm((p) => ({ ...p, condition: e.target.value }))}
            placeholder="Ej. Si quedan menos de 5 kg"
            required
            disabled={!canMutate || saving}
          />
        </label>
        <label className="mockup-field">
          <span>Prioridad</span>
          <select
            value={alertForm.severity}
            onChange={(e) => setAlertForm((p) => ({ ...p, severity: e.target.value }))}
            disabled={!canMutate || saving}
          >
            <option value="info">Informativa</option>
            <option value="warning">Atención</option>
            <option value="critical">Urgente</option>
          </select>
        </label>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button type="submit" className="btn" disabled={!canMutate || saving}>
            {saving ? "Guardando…" : "Crear alerta"}
          </button>
        </div>
      </form>
    </>
  );
}
