import es from "../src/locales/es.js";
import en from "../src/locales/en.js";

function flatten(obj, prefix = "") {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

const fes = flatten(es);
const fen = flatten(en);
const esKeys = new Set(Object.keys(fes));
const enKeys = new Set(Object.keys(fen));
const onlyEs = [...esKeys].filter((k) => !enKeys.has(k)).sort();
const onlyEn = [...enKeys].filter((k) => !esKeys.has(k)).sort();

console.log(`ES keys: ${esKeys.size}, EN keys: ${enKeys.size}`);
if (onlyEs.length) {
  console.log("\nOnly in ES:");
  onlyEs.forEach((k) => console.log(`  ${k}`));
}
if (onlyEn.length) {
  console.log("\nOnly in EN:");
  onlyEn.forEach((k) => console.log(`  ${k}`));
}
if (!onlyEs.length && !onlyEn.length) console.log("\nKeys match between ES and EN.");
