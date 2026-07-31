import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import AppErrorFallback from "./components/AppErrorFallback.jsx";
import { DakinisSessionProvider } from "./context/SessionContext.jsx";
import { LocaleProvider } from "./context/LocaleContext.jsx";
import { dakinisInitSentryBrowser, Sentry } from "./lib/sentry.js";
import { dakinisInitAnalytics } from "@dakinis/shared-brand/analytics";
import { bootstrapDesAppearance } from "@dakinis/shared-theme";
import "@dakinis/shared-brand/tokens.css";
import "../styles.css";

const coreTheme = bootstrapDesAppearance({
  product: "core",
  namespace: "core",
  defaultMode: "system",
});

dakinisInitSentryBrowser();
dakinisInitAnalytics();

function Root() {
  useEffect(() => () => coreTheme.unsubscribe?.(), []);
  return (
    <React.StrictMode>
      <Sentry.ErrorBoundary fallback={<AppErrorFallback />}>
        <LocaleProvider>
          <DakinisSessionProvider>
            <App />
          </DakinisSessionProvider>
        </LocaleProvider>
      </Sentry.ErrorBoundary>
    </React.StrictMode>
  );
}

createRoot(document.getElementById("root")).render(<Root />);
