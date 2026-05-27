import AppRouter from "./router/AppRouter.jsx";
import DevSentryErrorButton from "./components/DevSentryErrorButton.jsx";

/** SPA Core — React Router (fase 1: login, admin, /app/*). Verticales en LegacyPathRoutes. */
export default function App() {
  return (
    <>
      <AppRouter />
      <DevSentryErrorButton />
    </>
  );
}
