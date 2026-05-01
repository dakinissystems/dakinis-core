import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const dakinisApiProxy = {
  "/api": {
    target: "http://127.0.0.1:8787",
    changeOrigin: true
  }
};

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: dakinisApiProxy
  },
  preview: {
    proxy: dakinisApiProxy
  }
});
