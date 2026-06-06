import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import AppErrorFallback from "./components/AppErrorFallback.jsx";
import { DakinisSessionProvider } from "./context/SessionContext.jsx";
import { LocaleProvider } from "./context/LocaleContext.jsx";
import { dakinisInitSentryBrowser, Sentry } from "./lib/sentry.js";
import { dakinisInitAnalytics } from "@dakinis/shared-brand/analytics";
import "../styles.css";

dakinisInitSentryBrowser();
dakinisInitAnalytics();

createRoot(document.getElementById("root")).render(
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
