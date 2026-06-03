/** Sub-navegación del flujo comandas (tarifa → pedido → cobro → operación). */
export function FerminaComandasSubnav({ views, activeId, onSelect, badges = {} }) {
  return (
    <nav
      className="fermina-comandas-tabs"
      aria-label="Flujo comandas"
      style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1rem" }}
    >
      {views.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={`btn btn-outline${activeId === id ? " active" : ""}`}
          style={activeId === id ? { borderColor: "var(--brand)", color: "var(--brand)" } : undefined}
          onClick={() => onSelect(id)}
        >
          {label}
          {badges[id] ? (
            <span className="mockup-badge" style={{ marginLeft: "0.35rem" }}>
              {badges[id]}
            </span>
          ) : null}
        </button>
      ))}
    </nav>
  );
}
