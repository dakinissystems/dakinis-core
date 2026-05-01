import { createContext, useCallback, useContext, useMemo, useState } from "react";

const DAKINIS_STORAGE_KEY = "dakinis_session_v1";

const SessionContext = createContext(null);

function dakinisReadStoredSession() {
  try {
    const raw = sessionStorage.getItem(DAKINIS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function DakinisSessionProvider({ children }) {
  const [session, setSessionState] = useState(() => dakinisReadStoredSession());

  const setSession = useCallback((next) => {
    setSessionState(next);
    if (!next) {
      sessionStorage.removeItem(DAKINIS_STORAGE_KEY);
    } else {
      sessionStorage.setItem(DAKINIS_STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  const logout = useCallback(() => {
    setSession(null);
  }, [setSession]);

  const value = useMemo(() => ({ session, setSession, logout }), [session, setSession, logout]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useDakinisSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useDakinisSession debe usarse dentro de DakinisSessionProvider");
  }
  return ctx;
}
