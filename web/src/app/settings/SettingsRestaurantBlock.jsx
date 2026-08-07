export default function SettingsRestaurantBlock({ t, navigate, allergiesUrl }) {
  return (
    <div className="card" style={{ marginTop: "1rem" }}>
      <h3>{t("app.settings.restaurantBlock")}</h3>
      <p className="lead">
        {t("app.settings.restaurantLead")}{" "}
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => navigate("/sistema/restaurante?task=sala")}
        >
          {t("app.settings.restaurantLink")}
        </button>
        .
      </p>
      {allergiesUrl ? (
        <p>
          <strong>{t("app.settings.publicAllergies")}</strong>{" "}
          <a href={allergiesUrl} target="_blank" rel="noreferrer">
            {allergiesUrl}
          </a>
          {" · "}
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate("/sistema/restaurante?task=config&sub=allergens")}
          >
            {t("app.settings.allergensConfig")}
          </button>
        </p>
      ) : null}
    </div>
  );
}
