import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisTenantJsonFetch } from "../services/api.js";

/** Redirige a login si no hay sesión JWT en rutas /app/*. Valida token antes de montar hijos. */
export default function AppGuard({ children }) {
  const { session, logout } = useDakinisSession();
  const [checked, setChecked] = useState(false);
  const [valid, setValid] = useState(false);

  const token = session?.token;
  const sessionRef = useRef(session);
  sessionRef.current = session;

  useEffect(() => {
    if (!token) {
      setChecked(true);
      setValid(false);
      return undefined;
    }

    let cancelled = false;
    const sess = sessionRef.current;

    dakinisTenantJsonFetch("/api/me", sess)
      .then(() => {
        if (cancelled) return;
        setValid(true);
        setChecked(true);
      })
      .catch((err) => {
        if (cancelled) return;
        const code = err?.code;
        const isAuthFailure =
          err?.status === 401 && (code === "UNAUTHORIZED" || code === "INVALID_TOKEN");

        if (isAuthFailure) {
          try {
            sessionStorage.setItem("dakinis_session_expired", "1");
          } catch {
            /* ignore */
          }
          logout();
          setValid(false);
          setChecked(true);
          return;
        }

        // 429 / red / MISSING_TENANT transitorio: no expulsar si hay JWT local.
        setValid(true);
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
