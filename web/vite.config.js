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
        "@dakinis/shared-ux": path.resolve(__dirname, "../packages/shared-ux/src"),
        "@dakinis/shared-loading": path.resolve(__dirname, "../packages/shared-loading/src"),
        "@dakinis/shared-illustrations": path.resolve(__dirname, "../packages/shared-illustrations/src"),
        "@dakinis/shared-icons": path.resolve(__dirname, "../packages/shared-icons/src"),
        "@dakinis/design-system": path.resolve(__dirname, "../../../packages/design-system/src"),
        "@dakinis/shared-platform": path.resolve(__dirname, "../../../packages/shared-platform/src"),
        "@modules": path.resolve(__dirname, "src/modules"),
        react: path.resolve(__dirname, "../node_modules/react"),
        "react-dom": path.resolve(__dirname, "../node_modules/react-dom"),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react-dom") || id.includes("/react/")) return "vendor-react";
              if (id.includes("react-router")) return "vendor-router";
              return "vendor";
            }
            if (id.includes("/web/src/modules/crm/") || id.includes("/web/src/app/crm/")) return "mod-crm";
            if (id.includes("/web/src/modules/sales/") || id.includes("/web/src/app/ventas/")) return "mod-sales";
            if (id.includes("/web/src/modules/inventory/") || id.includes("/web/src/app/inventario/")) {
              return "mod-inventory";
            }
            if (id.includes("/web/src/modules/whatsapp/") || id.includes("/web/src/app/whatsapp/")) {
              return "mod-whatsapp";
            }
            if (id.includes("/web/src/modules/reports/") || id.includes("/web/src/app/reportes/")) {
              return "mod-reports";
            }
            if (id.includes("/web/src/modules/settings/") || id.includes("/web/src/app/settings/")) {
              return "mod-settings";
            }
            if (id.includes("/web/src/modules/dashboard/") || id.includes("/web/src/app/dashboard/")) {
              return "mod-dashboard";
            }
            return undefined;
          }
        }
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
