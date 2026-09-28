import { useEffect, useState } from "react";
import { useLocale } from "../context/LocaleContext.jsx";
import {
  dakinisReadRestaurantModuleContext,
  dakinisWriteRestaurantModuleContext
} from "../utils/restaurantTaskStorage.js";
import RestaurantAdminPanel from "./RestaurantAdminPanel.jsx";

const CONFIG_SECTIONS = [
  { id: "plano", labelKey: "restaurant.configPlano", sections: ["floor"] },
  { id: "carta", labelKey: "restaurant.configCarta", sections: ["menu"] },
  { id: "compras", labelKey: "restaurant.configCompras", sections: ["supply"] },
  { id: "seguridad", labelKey: "restaurant.configSeguridad", sections: ["allergens"] },
  { id: "integraciones", labelKey: "restaurant.configIntegraciones", sections: [] }
];

/**
 * Config por hogares claros (evita el cajón Admin).
 */
export default function RestaurantConfigModule({
  apiSession,
  tenantSlugForVertical,
  activeSystemKey,
  systemPageContent,
  initialSub,
  onOpenDelivery
}) {
  const { t } = useLocale();
  const saved = dakinisReadRestaurantModuleContext().config || {};

  const [sub, setSub] = useState(() => {
    const raw = String(initialSub || saved.sub || "plano").toLowerCase();
    if (raw === "allergens" || raw === "alergenos" || raw === "seguridad") return "seguridad";
    if (raw === "menu" || raw === "carta" || raw === "precios") return "carta";
    if (raw === "floor" || raw === "plano") return "plano";
    if (raw === "supply" || raw === "compras" || raw === "proveedores") return "compras";
    if (raw === "integraciones" || raw === "integrations") return "integraciones";
    return CONFIG_SECTIONS.some((s) => s.id === raw) ? raw : "plano";
  });

  useEffect(() => {
    dakinisWriteRestaurantModuleContext("config", { sub });
  }, [sub]);

  useEffect(() => {
    if (!initialSub) return;
    const raw = String(initialSub).toLowerCase();
    if (raw === "allergens" || raw === "alergenos") setSub("seguridad");
    else if (raw === "menu") setSub("carta");
    else if (["plano", "carta", "compras", "seguridad", "integraciones"].includes(raw)) setSub(raw);
  }, [initialSub]);

  const active = CONFIG_SECTIONS.find((s) => s.id === sub) || CONFIG_SECTIONS[0];

  return (
    <div className="restaurant-module restaurant-module--config">
      <nav className="restaurant-module__subnav" aria-label={t("restaurant.configSubnav")}>
        {CONFIG_SECTIONS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`btn${sub === tab.id ? "" : " btn-outline"}`}
            aria-pressed={sub === tab.id}
            onClick={() => setSub(tab.id)}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </nav>

      {sub === "integraciones" ? (
        <article className="card">
          <h4 style={{ marginTop: 0 }}>{t("restaurant.configIntegraciones")}</h4>
          <p className="kpi-label">{t("restaurant.configIntegracionesLead")}</p>
          <button type="button" className="btn" onClick={() => onOpenDelivery?.()}>
            {t("restaurant.configOpenDelivery")}
          </button>
        </article>
      ) : (
        <RestaurantAdminPanel
          apiSession={apiSession}
          tenantSlugForVertical={tenantSlugForVertical}
          activeSystemKey={activeSystemKey}
          systemPageContent={systemPageContent}
          sections={active.sections}
        />
      )}
    </div>
  );
}
