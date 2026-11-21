import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function pkgSrc(name) {
  const fromNm = path.join(root, "node_modules", "@dakinissystems", name, "src");
  if (fs.existsSync(fromNm)) return fromNm;
  const local = path.join(root, "packages", name, "src");
  if (fs.existsSync(local)) return local;
  throw new Error(`Missing package ${name} — npm install @dakinissystems/${name}`);
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const apiProxyTarget = env.VITE_DEV_API_PROXY || "http://127.0.0.1:8787";

  return {
    plugins: [react()],
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: {
        "@dakinis/shared": path.resolve(__dirname, "../shared"),
        // Registry via node_modules — foundation/theme stay local (not published).
        "@dakinis/shared-foundation": path.resolve(__dirname, "../packages/shared-foundation/src"),
        "@dakinis/shared-theme": path.resolve(__dirname, "../packages/shared-theme/src"),
        "@dakinis/shared-layouts": pkgSrc("shared-layouts"),
        "@dakinis/shared-ux": pkgSrc("shared-ux"),
        "@dakinis/shared-loading": pkgSrc("shared-loading"),
        "@dakinis/shared-illustrations": pkgSrc("shared-illustrations"),
        "@dakinis/shared-icons": pkgSrc("shared-icons"),
        "@modules": path.resolve(__dirname, "src/modules"),
        react: path.resolve(__dirname, "../node_modules/react"),
        "react-dom": path.resolve(__dirname, "../node_modules/react-dom"),
      }
    },
    build: {
      rollupOptions: {
        output: {
          // Only split node_modules. React.lazy already creates route chunks;
          // forcing /app/* into manualChunks caused cross-chunk TDZ errors
          // (e.g. ReferenceError: DesAppShell is not defined in prod).
          manualChunks(id) {
            if (!id.includes("node_modules")) return undefined;
            if (id.includes("react-dom") || /node_modules[/\\]react[/\\]/.test(id)) {
              return "vendor-react";
            }
            if (id.includes("react-router")) return "vendor-router";
            return "vendor";
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
