import es from "../src/locales/systemPages.es.js";
import en from "../src/locales/systemPages.en.js";

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
const onlyEs = Object.keys(fes).filter((k) => !(k in fen)).sort();
const onlyEn = Object.keys(fen).filter((k) => !(k in fes)).sort();
console.log(`systemPages ES: ${Object.keys(fes).length}, EN: ${Object.keys(fen).length}`);
if (onlyEs.length) {
  console.log("\nOnly in ES:");
  onlyEs.forEach((k) => console.log(`  ${k}`));
}
if (onlyEn.length) {
  console.log("\nOnly in EN:");
  onlyEn.forEach((k) => console.log(`  ${k}`));
}
if (!onlyEs.length && !onlyEn.length) console.log("Keys match.");
