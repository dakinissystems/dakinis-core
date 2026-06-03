/**
 * Copia packages/shared-brand del monorepo dakinis-systems a platform/core/packages/
 * para que dakinis-core despliegue en Railway sin rutas file: fuera del repo.
 *
 * Uso (desde platform/core): node scripts/sync-shared-brand.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const coreRoot = path.resolve(__dirname, "..");
const systemsRoot = path.resolve(coreRoot, "../..");
const src = path.join(systemsRoot, "packages", "shared-brand");
const dest = path.join(coreRoot, "packages", "shared-brand");

function copyRecursive(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const name of fs.readdirSync(from)) {
    if (name === "node_modules" || name === ".git") continue;
    const a = path.join(from, name);
    const b = path.join(to, name);
    if (fs.statSync(a).isDirectory()) copyRecursive(a, b);
    else fs.copyFileSync(a, b);
  }
}

if (!fs.existsSync(src)) {
  console.error("No se encontró:", src);
  process.exit(1);
}

copyRecursive(src, dest);
console.log("OK:", dest);
