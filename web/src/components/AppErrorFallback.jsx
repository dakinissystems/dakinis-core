import es from "../locales/es.js";
import en from "../locales/en.js";

function dakinisReadErrorLocale() {
  try {
    const stored = localStorage.getItem("dakinis-locale");
    if (stored === "en") return en;
  } catch {
    /* ignore */
  }
  return es;
}

/** Fallback fuera del LocaleProvider (ErrorBoundary en main.jsx). */
export default function AppErrorFallback() {
  const locale = dakinisReadErrorLocale();
  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui,sans-serif" }}>
      <h1>{locale.common.unexpectedError}</h1>
      <p>{locale.common.unexpectedErrorHint}</p>
    </div>
  );
}
