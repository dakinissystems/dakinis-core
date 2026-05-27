import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { dakinisPerformClientLogout } from "@dakinis/shared/auth/client-logout.js";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisClearAuthToken } from "../services/auth.js";

/**
 * Unified sign-out: clear session storage, legacy token, redirect to /login.
 */
export function useDakinisLogout() {
  const { logout: clearSession } = useDakinisSession();
  const navigate = useNavigate();

  return useCallback(
    () =>
      dakinisPerformClientLogout({
        clearLocalSession: () => {
          clearSession();
          dakinisClearAuthToken();
        },
        navigate: (to, opts) => navigate(to, opts),
      }),
    [clearSession, navigate]
  );
}
