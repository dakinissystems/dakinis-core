import { dakinisUserFacingMessage } from "../services/user-facing-error.js";

function dakinisComposeArrivalWindow(date, from, to) {
  const day = String(date || "").trim();
  if (!day) return "";
  const start = String(from || "").trim();
  const end = String(to || "").trim();
  if (start && end) return `${day} ${start}–${end}`;
  if (start || end) return `${day} ${start || end}`;
  return day;
}

function dakinisIsSystemIncident(row) {
  return String(row?.productRef || "").startsWith("system:");
}

const ALERT_RULES = [
  { id: "below", label: "Stock inferior a una cantidad", text: "Avisar si el stock baja del mínimo configurado." },
  { id: "expiring", label: "Producto próximo a caducar", text: "Avisar si caduca en los próximos días." },
  { id: "expired", label: "Producto caducado", text: "Avisar si la fecha de caducidad ya pasó." },
  { id: "delivery", label: "Entrega pendiente", text: "Avisar si hay una entrega sin confirmar." },
  { id: "idle", label: "Producto sin movimiento", text: "Avisar si no hay movimientos en el periodo indicado." }
];

export function SupplyDeliveriesSection({
  canMutate,
  loading,
  loadError,
  actionError,
  deliveries,
  saving,
  deliveryForm,
  setDeliveryForm,
  supplierNames,
  handleAddDelivery,
  handleDeleteDelivery
}) {
  return (
    <>
      <h4 style={{ marginTop: "1.75rem" }}>Cuándo traen la mercadería</h4>
      <p className="lead" style={{ fontSize: "0.95rem", marginBottom: "0.75rem" }}>
        Registra ventanas de reparto o visitas del proveedor.
        {!canMutate ? (
          <>
            {" "}
            <strong>Inicia sesión</strong> en el negocio para añadir o borrar filas.
          </>
        ) : null}
      </p>

      {loading ? <p className="lead">Cargando entregas…</p> : null}
      {loadError ? (
        <article className="card dashboard-load-error">
          <h3 style={{ marginTop: 0 }}>No se pudo cargar el inventario</h3>
          <p>{dakinisUserFacingMessage(loadError)}</p>
          <p className="kpi-label">Último intento: no disponible</p>
        </article>
      ) : null}
      {actionError ? (
        <p className="lead" style={{ color: "var(--dakinis-warning)" }}>
          {actionError}
        </p>
      ) : null}

      <article className="card mockup-table-card" style={{ marginBottom: "1rem" }}>
        <table className="mockup-table" data-stack="responsive">
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Fecha o ventana</th>
              <th>Qué traen</th>
              <th>Estado</th>
              {canMutate ? <th scope="col">Acciones</th> : null}
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
                  <td data-label="Proveedor">{row.supplier}</td>
                  <td data-label="Fecha o ventana">{row.arrivalWindow}</td>
                  <td data-label="Qué traen">{row.contents || "—"}</td>
                  <td data-label="Estado">{row.status}</td>
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

      <form className="mockup-form card" onSubmit={handleAddDelivery}>
        <h5 style={{ gridColumn: "1 / -1", margin: 0 }}>Añadir recepción o reparto</h5>
        <label className="mockup-field">
          <span>Proveedor</span>
          <input
            list="supply-supplier-names"
            value={deliveryForm.supplier}
            onChange={(e) => setDeliveryForm((p) => ({ ...p, supplier: e.target.value }))}
            placeholder="Nombre del proveedor"
            autoComplete="off"
            aria-label="Proveedor"
            disabled={!canMutate || saving}
          />
          <datalist id="supply-supplier-names">
            {supplierNames.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </label>
        <label className="mockup-field">
          <span>Fecha de entrega</span>
          <input
            type="date"
            value={deliveryForm.deliveryDate || ""}
            onChange={(e) => {
              const deliveryDate = e.target.value;
              setDeliveryForm((p) => ({
                ...p,
                deliveryDate,
                arrivalWindow: dakinisComposeArrivalWindow(deliveryDate, p.timeFrom, p.timeTo)
              }));
            }}
            required
            disabled={!canMutate || saving}
          />
        </label>
        <label className="mockup-field">
          <span>Hora desde</span>
          <input
            type="time"
            value={deliveryForm.timeFrom || ""}
            onChange={(e) => {
              const timeFrom = e.target.value;
              setDeliveryForm((p) => ({
                ...p,
                timeFrom,
                arrivalWindow: dakinisComposeArrivalWindow(p.deliveryDate, timeFrom, p.timeTo)
              }));
            }}
            disabled={!canMutate || saving}
          />
        </label>
        <label className="mockup-field">
          <span>Hora hasta</span>
          <input
            type="time"
            value={deliveryForm.timeTo || ""}
            onChange={(e) => {
              const timeTo = e.target.value;
              setDeliveryForm((p) => ({
                ...p,
                timeTo,
                arrivalWindow: dakinisComposeArrivalWindow(p.deliveryDate, p.timeFrom, timeTo)
              }));
            }}
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
            <option value="En ruta">En camino</option>
            <option value="Recibido">Recibido</option>
            <option value="Cancelado">Cancelado</option>
          </select>
          <span className="kpi-label">Recibido no suma stock. La entrada se registra en inventario.</span>
        </label>
        <button
          type="submit"
          className="btn btn-outline"
          style={{ gridColumn: "1 / -1" }}
          disabled={!canMutate || saving || !deliveryForm.arrivalWindow}
        >
          {saving
            ? "Guardando…"
            : deliveryForm.status === "Recibido"
              ? "Registrar recepción"
              : "Registrar entrega prevista"}
        </button>
      </form>
    </>
  );
}

export function SupplyAlertsSection({
  canMutate,
  alerts,
  saving,
  alertForm,
  setAlertForm,
  productRefs,
  handleAddAlert,
  handleDeleteAlert,
  reloadSupply,
  dakinisSeverityStyle,
  dakinisSeverityLabel
}) {
  const businessAlerts = alerts.filter((row) => !dakinisIsSystemIncident(row));
  const incidents = alerts.filter((row) => dakinisIsSystemIncident(row));
  return (
    <>
      <h4 style={{ marginTop: "1.75rem" }}>Alertas de inventario</h4>
      <p className="lead" style={{ fontSize: "0.95rem", marginBottom: "0.75rem" }}>
        Stock bajo, caducidades, mercancía pendiente y productos sin movimiento.
      </p>

      <article className="card mockup-table-card" style={{ marginBottom: "1rem" }}>
        <table className="mockup-table" data-stack="responsive">
          <thead>
            <tr>
              <th>Alerta</th>
              <th>Ref.</th>
              <th>Condición</th>
              <th>Nivel</th>
              {canMutate ? <th scope="col">Acciones</th> : null}
            </tr>
          </thead>
          <tbody>
            {businessAlerts.length === 0 ? (
              <tr>
                <td colSpan={canMutate ? 5 : 4}>
                  <span className="lead">Sin alertas de inventario.</span>
                </td>
              </tr>
            ) : (
              businessAlerts.map((row) => (
                <tr key={row.id}>
                  <td data-label="Alerta">{row.title}</td>
                  <td data-label="Ref.">
                    <code>{row.productRef || "—"}</code>
                  </td>
                  <td data-label="Condición">{dakinisUserFacingMessage(row.condition, "Aviso sin detalle")}</td>
                  <td data-label="Nivel" style={dakinisSeverityStyle(row.severity)}>
                    {dakinisSeverityLabel(row.severity)}
                  </td>
                  {canMutate ? (
                    <td>
                      {!String(row.id).startsWith("fb-") ? (
                        <button
                          type="button"
                          className="btn btn-outline"
                          disabled={saving}
                          onClick={() => handleDeleteAlert(row.id)}
                          title="Quita el aviso de esta lista. No guarda un historial de esa decisión."
                        >
                          Descartar
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

      {incidents.length > 0 ? (
        <article className="card" style={{ marginBottom: "1rem" }}>
          <h4 style={{ marginTop: 0 }}>Incidencias del sistema</h4>
          <p className="kpi-label">
            Un fallo de carga no es una alerta de mercadería. Comprueba si el módulo ya responde antes de quitar el aviso.
          </p>
          <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.1rem" }}>
            {incidents.map((row) => (
              <li key={row.id}>
                <strong>No se pudieron cargar los datos de inventario.</strong>
                <p className="kpi-label">El detalle técnico no se muestra aquí.</p>
                <button type="button" className="btn btn-outline" disabled={saving} onClick={() => reloadSupply?.()}>
                  Reintentar
                </button>
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      <form className="mockup-form card" onSubmit={handleAddAlert}>
        <h5 style={{ gridColumn: "1 / -1", margin: 0 }}>Crear aviso manual</h5>
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
            value={alertForm.productRef}
            onChange={(e) => setAlertForm((p) => ({ ...p, productRef: e.target.value }))}
            placeholder="Código interno"
            aria-label="Referencia producto"
            disabled={!canMutate || saving}
          />
        </label>
        {productRefs.length > 0 ? (
          <p className="kpi-label" style={{ gridColumn: "1 / -1", margin: 0 }}>
            Referencias: {productRefs.join(", ")}
          </p>
        ) : null}
        <label className="mockup-field" style={{ gridColumn: "1 / -1" }}>
          <span>Condición del aviso</span>
          <select
            value={ALERT_RULES.find((rule) => rule.text === alertForm.condition)?.id || ""}
            onChange={(e) => {
              const rule = ALERT_RULES.find((item) => item.id === e.target.value);
              setAlertForm((p) => ({ ...p, condition: rule?.text || "" }));
            }}
            required
            disabled={!canMutate || saving}
          >
            <option value="">Elegir una regla</option>
            {ALERT_RULES.map((rule) => (
              <option key={rule.id} value={rule.id}>
                {rule.label}
              </option>
            ))}
          </select>
          <span className="kpi-label">Se guarda como aviso. No hay un motor que lo evalúe solo.</span>
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
        <button
          type="submit"
          className="btn"
          style={{ gridColumn: "1 / -1" }}
          disabled={!canMutate || saving}
        >
          {saving ? "Guardando…" : "Guardar aviso"}
        </button>
      </form>
    </>
  );
}
