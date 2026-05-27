import * as Sentry from "@sentry/react";

/**
 * Sentry browser — solo activo si VITE_SENTRY_DSN está definido (build Vite).
 */
export function dakinisInitSentryBrowser() {
  const dsn = String(import.meta.env.VITE_SENTRY_DSN || "").trim();
  if (!dsn) return false;

  const tracesSampleRate = Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0.1);
  const replaysSessionSampleRate = Number(
    import.meta.env.VITE_SENTRY_REPLAY_SESSION_SAMPLE_RATE ?? 0.05
  );
  const replaysOnErrorSampleRate = Number(
    import.meta.env.VITE_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE ?? 1
  );

  Sentry.init({
    dsn,
    environment:
      import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE || "development",
    release: import.meta.env.VITE_SENTRY_RELEASE || undefined,
    sendDefaultPii: false,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    tracesSampleRate: Number.isFinite(tracesSampleRate) ? tracesSampleRate : 0.1,
    replaysSessionSampleRate: Number.isFinite(replaysSessionSampleRate)
      ? replaysSessionSampleRate
      : 0.05,
    replaysOnErrorSampleRate: Number.isFinite(replaysOnErrorSampleRate)
      ? replaysOnErrorSampleRate
      : 1
  });

  return true;
}

export { Sentry };
