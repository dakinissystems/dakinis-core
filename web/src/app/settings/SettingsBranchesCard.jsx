export default function SettingsBranchesCard({ branches, onRefresh }) {
  if (!branches.length) return null;

  return (
    <div className="card" style={{ marginTop: "1rem" }}>
      <h3>Sucursales</h3>
      <ul>
        {branches.map((b) => (
          <li key={b.id}>
            {b.name} ({b.slug}){b.isDefault ? " — principal" : ""}
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn-outline" onClick={onRefresh}>
        Actualizar
      </button>
    </div>
  );
}
