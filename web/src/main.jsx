import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { DakinisSessionProvider } from "./context/SessionContext.jsx";
import { LocaleProvider } from "./context/LocaleContext.jsx";
import { dakinisInitSentryBrowser, Sentry } from "./lib/sentry.js";
import "../styles.css";

dakinisInitSentryBrowser();

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary
      fallback={
        <div style={{ padding: "2rem", fontFamily: "system-ui,sans-serif" }}>
          <h1>Error inesperado</h1>
          <p>Recarga la página. Si persiste, contacta soporte.</p>
        </div>
      }
    >
      <LocaleProvider>
        <DakinisSessionProvider>
          <App />
        </DakinisSessionProvider>
      </LocaleProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
