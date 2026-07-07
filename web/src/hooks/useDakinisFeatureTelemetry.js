import { useEffect, useRef } from "react";
import { dakinisPathToTelemetryFeature } from "@dakinis/shared/catalog/telemetry-features.js";
import { dakinisTenantTelemetryFeature } from "../services/tenant-intelligence.js";
import { dakinisIsBusinessDemoSession } from "../utils/businessDemoMode.js";

function dakinisEndTelemetrySession(session, sessionId) {
  if (!session?.token || !sessionId) return;
  dakinisTenantTelemetryFeature(session, {
    event: "end",
    sessionId
  }).catch(() => {});
}

function dakinisStartTelemetrySession(session, pathname) {
  const feature = dakinisPathToTelemetryFeature(pathname);
  if (!session?.token || !feature) return Promise.resolve(null);
  return dakinisTenantTelemetryFeature(session, {
    event: "start",
    feature,
    path: pathname
  })
    .then((json) => json?.data?.telemetry?.sessionId || null)
    .catch(() => null);
}

/**
 * Registra inicio/fin de sesión por pantalla en /app/* (fire-and-forget, no bloquea UI).
 */
export function useDakinisFeatureTelemetry(session, pathname) {
  const activeRef = useRef({ sessionId: null, path: null });
  const sessionRef = useRef(session);
  sessionRef.current = session;

  useEffect(() => {
    const currentSession = sessionRef.current;
    if (!currentSession?.token || !pathname.startsWith("/app/")) return undefined;
    if (dakinisIsBusinessDemoSession(currentSession)) return undefined;

    const prev = activeRef.current;
    if (prev.sessionId && prev.path !== pathname) {
      dakinisEndTelemetrySession(currentSession, prev.sessionId);
      activeRef.current = { sessionId: null, path: null };
    }

    let cancelled = false;
    dakinisStartTelemetrySession(currentSession, pathname).then((sessionId) => {
      if (cancelled || !sessionId) return;
      activeRef.current = { sessionId, path: pathname };
    });

    const onHide = () => {
      const current = activeRef.current;
      if (current.sessionId) {
        dakinisEndTelemetrySession(sessionRef.current, current.sessionId);
        activeRef.current = { sessionId: null, path: null };
      }
    };
    document.addEventListener("visibilitychange", onHide);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onHide);
      const current = activeRef.current;
      if (current.sessionId && current.path === pathname) {
        dakinisEndTelemetrySession(sessionRef.current, current.sessionId);
        activeRef.current = { sessionId: null, path: null };
      }
    };
  }, [session?.token, pathname]);
}
