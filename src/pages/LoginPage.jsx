import { useState } from "react";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisPublicJsonFetch } from "../services/api.js";

export default function LoginPage({ navigate }) {
  const { setSession } = useDakinisSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const json = await dakinisPublicJsonFetch("/api/auth/login", {
        method: "POST",
        body: { email: email.trim(), password }
      });

      const { token, user, business } = json.data;
      setSession({
        token,
        user,
        business
      });
      navigate(`/sistema/${business.type}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="modules">
      <div className="container" style={{ maxWidth: 480 }}>
        <p className="kicker">Acceso SaaS multi-tenant</p>
        <h2>Iniciar sesion</h2>
        <p className="lead">
          Credenciales demo: <code className="config-box">admin@clinica-demo.local</code> /
          {" "}
          <code className="config-box">demo123</code> (y otros tenants seeded).
        </p>
        <form className="mockup-form card" onSubmit={handleSubmit} style={{ gridTemplateColumns: "1fr" }}>
          <label className="mockup-field">
            <span>Email</span>
            <input type="email" value={email} onChange={(ev) => setEmail(ev.target.value)} autoComplete="username" required />
          </label>
          <label className="mockup-field">
            <span>Password</span>
            <input type="password" value={password} onChange={(ev) => setPassword(ev.target.value)} autoComplete="current-password" required />
          </label>
          {error ? <p className="lead" style={{ color: "#f97316", gridColumn: "1 / -1" }}>{error}</p> : null}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/")}>
            Volver
          </button>
        </form>
      </div>
    </section>
  );
}
