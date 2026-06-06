import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisPublicJsonFetch } from "../services/api.js";
import PasswordInput from "../components/PasswordInput.jsx";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLocale();
  const tokenFromUrl = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!tokenFromUrl) {
      setError(t("resetPassword.errors.noToken"));
      return;
    }
    if (password.length < 8) {
      setError(t("resetPassword.errors.short"));
      return;
    }
    if (password !== password2) {
      setError(t("resetPassword.errors.mismatch"));
      return;
    }
    setLoading(true);
    try {
      await dakinisPublicJsonFetch("/api/auth/reset-password", {
        method: "POST",
        body: { token: tokenFromUrl, password }
      });
      setSuccess(t("resetPassword.success"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("resetPassword.errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="modules login-page">
      <div className="container login-page__inner">
        <p className="kicker">{t("resetPassword.kicker")}</p>
        <h2 className="login-page__title">{t("resetPassword.title")}</h2>
        <p className="lead login-page__lead">{t("resetPassword.lead")}</p>
        <form className="mockup-form card login-form" onSubmit={handleSubmit}>
          {!tokenFromUrl ? (
            <p className="login-form__error">{t("resetPassword.errors.noToken")}</p>
          ) : null}
          <label className="mockup-field">
            <span>{t("resetPassword.newPassword")}</span>
            <PasswordInput
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
            />
          </label>
          <label className="mockup-field">
            <span>{t("resetPassword.confirmPassword")}</span>
            <PasswordInput
              value={password2}
              onChange={(ev) => setPassword2(ev.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
            />
          </label>
          {error ? <p className="login-form__error">{error}</p> : null}
          {success ? <p className="lead" style={{ color: "#5eead4" }}>{success}</p> : null}
          <div className="login-form__actions">
            <button type="submit" className="btn login-form__submit" disabled={loading || !tokenFromUrl}>
              {loading ? t("resetPassword.submitting") : t("resetPassword.submit")}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate("/login")}>
              {t("resetPassword.goLogin")}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
