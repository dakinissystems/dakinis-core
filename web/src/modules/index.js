/**
 * Core product modules — lazy entrypoints.
 * Physical pages remain under `web/src/app/*` during the modularization migration;
 * import via these barrels so Vite can split by capability.
 */
export { default as MODULES, resolveModule } from "./registry.js";
