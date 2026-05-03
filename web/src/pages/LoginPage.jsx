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
    <section className="modules">
      <div className="container" style={{ maxWidth: 480 }}>
        <p className="kicker">{t("login.kicker")}</p>
        <h2>{t("login.title")}</h2>
        <p className="lead">
          {t("login.demoPassword")} <code className="config-box">demo123</code>
        </p>
        <ul className="demo-tenant-list">
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
        <form className="mockup-form card" onSubmit={handleSubmit} style={{ gridTemplateColumns: "1fr" }}>
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
          {error ? (
            <p className="lead" style={{ color: "#f97316", gridColumn: "1 / -1" }}>
              {error}
            </p>
          ) : null}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? t("login.submitting") : t("login.submit")}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/")}>
            {t("login.back")}
          </button>
        </form>
      </div>
    </section>
  );
}
