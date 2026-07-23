import { Navigate } from "react-router-dom";
import { useLocale } from "../../context/LocaleContext.jsx";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import { dakinisIsBusinessDemoSession } from "../../utils/businessDemoMode.js";
import BusinessNavHero from "../../components/business/BusinessNavHero.jsx";
import InventoryBusinessDemo from "../../components/business/InventoryBusinessDemo.jsx";

export default function InventarioPage({ navigate }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const isDemo = dakinisIsBusinessDemoSession(session);

  // Restaurante: inventario operativo vive en el vertical (stock + lotes).
  if (session?.token && !isDemo && session.business?.type === "restaurante") {
    return <Navigate to={`/sistema/${encodeURIComponent(session.business.type)}`} replace />;
  }

  if (!session?.token) {
    return (
      <section className="modules">
        <div className="container">
          <h2>{t("businessDemo.inventory.title")}</h2>
          <p className="lead">{t("app.loginRequired")}</p>
          <button className="btn" type="button" onClick={() => navigate("/login")}>
            {t("app.goLogin")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="modules business-app-page">
      <div className="container">
        {isDemo ? <BusinessNavHero navigate={navigate} compact /> : null}
        <p className="kicker">{t("businessDemo.inventory.kicker")}</p>
        <h2>{t("businessDemo.inventory.title")}</h2>
        <p className="lead">{t("businessDemo.inventory.lead")}</p>
        {isDemo ? (
          <InventoryBusinessDemo />
        ) : (
          <p className="lead">{t("businessDemo.inventory.realHint")}</p>
        )}
      </div>
    </section>
  );
}
