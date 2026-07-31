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
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: {
        "@dakinis/shared": path.resolve(__dirname, "../shared"),
        "@dakinis/shared-brand": path.resolve(__dirname, "../packages/shared-brand/src"),
        "@dakinis/shared-foundation": path.resolve(__dirname, "../packages/shared-foundation/src"),
        "@dakinis/shared-theme": path.resolve(__dirname, "../packages/shared-theme/src"),
        "@dakinis/shared-layouts": path.resolve(__dirname, "../packages/shared-layouts/src"),
        "@dakinis/shared-ux": path.resolve(__dirname, "../packages/shared-ux/src"),
        "@dakinis/shared-loading": path.resolve(__dirname, "../packages/shared-loading/src"),
        "@dakinis/shared-illustrations": path.resolve(__dirname, "../packages/shared-illustrations/src"),
        "@dakinis/shared-icons": path.resolve(__dirname, "../packages/shared-icons/src"),
        react: path.resolve(__dirname, "../node_modules/react"),
        "react-dom": path.resolve(__dirname, "../node_modules/react-dom"),
      }
    },
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
