import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisPublicJsonFetch } from "../services/api.js";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLocale();
  const mustChange = Boolean(location.state?.mustChange);
  const [email, setEmail] = useState(location.state?.email || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await dakinisPublicJsonFetch("/api/auth/forgot-password", {
        method: "POST",
        body: { email: email.trim().toLowerCase() }
      });
      setSuccess(t("forgotPassword.success"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("forgotPassword.errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="modules login-page">
      <div className="container login-page__inner">
        <p className="kicker">{t("forgotPassword.kicker")}</p>
        <h2 className="login-page__title">{t("forgotPassword.title")}</h2>
        <p className="lead login-page__lead">
          {mustChange ? t("forgotPassword.mustChangeLead") : t("forgotPassword.lead")}
        </p>
        <form className="mockup-form card login-form" onSubmit={handleSubmit}>
          <label className="mockup-field">
            <span>{t("forgotPassword.email")}</span>
            <input
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              autoComplete="username"
              required
            />
          </label>
          {error ? <p className="login-form__error">{error}</p> : null}
          {success ? <p className="lead" style={{ color: "var(--dakinis-accent)" }}>{success}</p> : null}
          <div className="login-form__actions">
            <button type="submit" className="btn login-form__submit" disabled={loading}>
              {loading ? t("forgotPassword.submitting") : t("forgotPassword.submit")}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate("/login")}>
              {t("forgotPassword.back")}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
