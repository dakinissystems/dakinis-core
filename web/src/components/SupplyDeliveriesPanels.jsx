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
        <p className="lead" style={{ color: "var(--dakinis-warning)" }}>
          {loadError} (mostrando vista offline si hay datos locales de ejemplo).
        </p>
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
            value={deliveryForm.supplier}
            onChange={(e) => setDeliveryForm((p) => ({ ...p, supplier: e.target.value }))}
            placeholder="Nombre o elige de la lista"
            autoComplete="off"
            aria-label="Proveedor"
            disabled={!canMutate || saving}
          />
        </label>
        {supplierNames.length > 0 ? (
          <p className="kpi-label" style={{ gridColumn: "1 / -1", margin: 0 }}>
            Sugeridos: {supplierNames.join(", ")}
          </p>
        ) : null}
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
  dakinisSeverityStyle,
  dakinisSeverityLabel
}) {
  return (
    <>
      <h4 style={{ marginTop: "1.75rem" }}>Alertas de mercadería</h4>
      <p className="lead" style={{ fontSize: "0.95rem", marginBottom: "0.75rem" }}>
        Avisos persistentes por stock, caducidad o pedidos pendientes.
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
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={canMutate ? 5 : 4}>
                  <span className="lead">Sin alertas.</span>
                </td>
              </tr>
            ) : (
              alerts.map((row) => (
                <tr key={row.id}>
                  <td data-label="Alerta">{row.title}</td>
                  <td data-label="Ref.">
                    <code>{row.productRef || "—"}</code>
                  </td>
                  <td data-label="Condición">{row.condition}</td>
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

      <form className="mockup-form card" onSubmit={handleAddAlert}>
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
        <button
          type="submit"
          className="btn"
          style={{ gridColumn: "1 / -1" }}
          disabled={!canMutate || saving}
        >
          {saving ? "Guardando…" : "Crear alerta"}
        </button>
      </form>
    </>
  );
}
