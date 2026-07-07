import { dakinisTenantPatchPortalSettings } from "../../services/tenant-intelligence.js";

export default function SettingsPortalCard({ session, portal, setPortal, onSaved }) {
  if (!portal) return null;

  return (
    <div className="card" style={{ marginTop: "1rem" }}>
      <h3>Portal cliente</h3>
      <label className="mockup-field">
        <span>Subdominio / slug público</span>
        <input
          value={portal.subdomain || session?.business?.slug || ""}
          onChange={(ev) => setPortal((p) => ({ ...p, subdomain: ev.target.value }))}
        />
      </label>
      <p>
        URL:{" "}
        <a href={`/portal/${portal.subdomain || session?.business?.slug}`} target="_blank" rel="noreferrer">
          /portal/{portal.subdomain || session?.business?.slug}
        </a>
      </p>
      <button
        type="button"
        className="btn btn-outline"
        onClick={async () => {
          await dakinisTenantPatchPortalSettings(session, {
            enabled: true,
            subdomain: portal.subdomain || session?.business?.slug,
            features: portal.suggestedFeatures || portal.features
          });
          onSaved("Portal activado");
        }}
      >
        Activar portal
      </button>
    </div>
  );
}
