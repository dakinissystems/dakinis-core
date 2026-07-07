import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";
import { DAKINIS_AUTH_EXPIRED_EVENT } from "../services/auth-events.js";

const DAKINIS_STORAGE_KEY = "dakinis_session_v1";

const SessionContext = createContext(null);

function dakinisReadStoredSession() {
  try {
    const raw = sessionStorage.getItem(DAKINIS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function DakinisSessionProvider({ children }) {
  const [session, setSessionState] = useState(() => dakinisReadStoredSession());

  useEffect(() => {
    const onExpired = () => {
      setSessionState(null);
      sessionStorage.removeItem(DAKINIS_STORAGE_KEY);
    };
    window.addEventListener(DAKINIS_AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(DAKINIS_AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const setSession = useCallback((next) => {
    setSessionState((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      if (!resolved) {
        sessionStorage.removeItem(DAKINIS_STORAGE_KEY);
      } else {
        sessionStorage.setItem(DAKINIS_STORAGE_KEY, JSON.stringify(resolved));
      }
      return resolved;
    });
  }, []);

  /** Clears session only — UI should use `useDakinisLogout()` for redirect. */
  const logout = useCallback(() => {
    setSession(null);
  }, [setSession]);

  const value = useMemo(() => ({ session, setSession, logout }), [session, setSession, logout]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useDakinisSession() {
  const ctx = use(SessionContext);
  if (!ctx) {
    throw new Error("useDakinisSession debe usarse dentro de DakinisSessionProvider");
  }
  return ctx;
}
