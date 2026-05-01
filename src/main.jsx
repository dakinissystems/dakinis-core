import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { DakinisSessionProvider } from "./context/SessionContext.jsx";
import "../styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <DakinisSessionProvider>
      <App />
    </DakinisSessionProvider>
  </React.StrictMode>
);
