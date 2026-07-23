import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisTenantJsonFetch } from "../services/api.js";

/** Redirige a login si no hay sesión JWT en rutas /app/*. Valida token antes de montar hijos. */
export default function AppGuard({ children }) {
  const { session, logout } = useDakinisSession();
  const [checked, setChecked] = useState(false);
  const [valid, setValid] = useState(false);

  const token = session?.token;

  useEffect(() => {
    if (!token) {
      setChecked(true);
      setValid(false);
      return undefined;
    }

    let cancelled = false;
    dakinisTenantJsonFetch("/api/me", { token })
      .then(() => {
        if (cancelled) return;
        setValid(true);
        setChecked(true);
      })
      .catch((err) => {
        if (cancelled) return;
        const code = err?.code;
        if (err?.status === 401 && (code === "UNAUTHORIZED" || code === "INVALID_TOKEN")) {
          try {
            sessionStorage.setItem("dakinis_session_expired", "1");
          } catch {
            /* ignore */
          }
          logout();
        }
        setValid(false);
        setChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  if (!session?.token) {
    return <Navigate to="/login" replace />;
  }

  if (!checked) {
    return null;
  }

  if (!valid) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
