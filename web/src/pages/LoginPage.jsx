import { useState } from "react";
import { useLocale } from "../context/LocaleContext.jsx";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisPublicJsonFetch, DakinisApiError } from "../services/api.js";

export default function LoginPage({ navigate }) {
  const { t } = useLocale();
  const { setSession } = useDakinisSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [needsTotp, setNeedsTotp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (needsTotp && !totpCode.trim()) {
        setError(t("login.errors.totpRequired"));
        setLoading(false);
        return;
      }
      const body = { email: email.trim(), password };
      if (needsTotp && totpCode.trim()) {
        body.totpCode = totpCode.trim().replace(/\s+/g, "");
      }
      const json = await dakinisPublicJsonFetch("/api/auth/login", {
        method: "POST",
        body
      });

      const payload = json?.data;
      if (!payload || typeof payload !== "object") {
        throw new Error(t("login.errors.noData"));
      }

      const { token, user, business } = payload;
      if (!token || !business?.type) {
        throw new Error(t("login.errors.incomplete"));
      }
      setSession({
        token,
        user,
        business
      });
      const isPlatformAdmin = user?.role === "platform_admin" || business.type === "platform";
      if (isPlatformAdmin) {
        navigate("/admin");
      } else {
        navigate(`/sistema/${business.type}`);
      }
      setNeedsTotp(false);
      setTotpCode("");
    } catch (err) {
      if (err instanceof DakinisApiError && err.code === "TOTP_REQUIRED") {
        setNeedsTotp(true);
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : t("login.errors.generic"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="modules login-page">
      <div className="container login-page__inner">
        <p className="kicker">{t("login.kicker")}</p>
        <h2 className="login-page__title">{t("login.title")}</h2>
        <p className="lead login-page__lead">
          {t("login.demoPassword")} <code className="config-box">demo123</code>
        </p>
        <details className="login-demo-details card">
          <summary>Cuentas demo</summary>
          <ul className="demo-tenant-list">
          <li>
            <code className="config-box">admin@dakinis-platform.local</code>
            <span className="demo-tenant-label">{t("login.platformAdmin")}</span>
          </li>
          <li>
            <code className="config-box">admin@clinica-demo.local</code>
            <span className="demo-tenant-label">{t("login.tenants.clinic")}</span>
          </li>
          <li>
            <code className="config-box">admin@peluqueria-demo.local</code>
            <span className="demo-tenant-label">{t("login.tenants.barber")}</span>
          </li>
          <li>
            <code className="config-box">admin@restaurante-demo.local</code>
            <span className="demo-tenant-label">{t("login.tenants.restaurant")}</span>
          </li>
          <li>
            <code className="config-box">admin@inmobiliaria-demo.local</code>
            <span className="demo-tenant-label">{t("login.tenants.estate")}</span>
          </li>
          </ul>
        </details>
        <form className="mockup-form card login-form" onSubmit={handleSubmit}>
          <label className="mockup-field">
            <span>{t("login.email")}</span>
            <input
              type="email"
              value={email}
              onChange={(ev) => {
                setEmail(ev.target.value);
                setNeedsTotp(false);
                setTotpCode("");
              }}
              autoComplete="username"
              required
            />
          </label>
          <label className="mockup-field">
            <span>{t("login.password")}</span>
            <input
              type="password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {needsTotp ? (
            <label className="mockup-field">
              <span>{t("login.totpLabel")}</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={12}
                value={totpCode}
                onChange={(ev) => setTotpCode(ev.target.value)}
                placeholder={t("login.totpPlaceholder")}
              />
            </label>
          ) : null}
          {error ? <p className="login-form__error">{error}</p> : null}
          <div className="login-form__actions">
            <button type="submit" className="btn login-form__submit" disabled={loading}>
              {loading ? t("login.submitting") : t("login.submit")}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate("/")}>
              {t("login.back")}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
