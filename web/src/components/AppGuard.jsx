import { Navigate } from "react-router-dom";
import { useDakinisSession } from "../context/SessionContext.jsx";

/** Redirige a login si no hay sesión JWT en rutas /app/*. */
export default function AppGuard({ children }) {
  const { session } = useDakinisSession();
  if (!session?.token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
