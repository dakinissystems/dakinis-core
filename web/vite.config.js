import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const apiProxyTarget = env.VITE_DEV_API_PROXY || "http://127.0.0.1:8787";

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true
        }
      }
    },
    preview: {
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true
        }
      }
    }
  };
});
