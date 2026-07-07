import { dakinisTenantMarketplaceInstall } from "../../services/tenant-intelligence.js";

const MARKETPLACE_MODULES = ["crm", "whatsapp", "inventario", "analytics", "ia"];

export default function SettingsMarketplaceCard({ session, onInstalled }) {
  return (
    <div className="card" style={{ marginTop: "1rem" }}>
      <h3>Marketplace (1 clic)</h3>
      <div className="pill-grid">
        {MARKETPLACE_MODULES.map((mod) => (
          <button
            key={mod}
            type="button"
            className="btn btn-outline"
            onClick={async () => {
              await dakinisTenantMarketplaceInstall(session, mod);
              onInstalled(`Módulo ${mod} instalado`);
            }}
          >
            Instalar {mod}
          </button>
        ))}
      </div>
    </div>
  );
}
