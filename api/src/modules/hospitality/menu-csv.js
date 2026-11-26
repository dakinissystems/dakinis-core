/**
 * B10 — Parse CSV de carta.
 * Cabecera: name,category,priceEur,description
 * Separador: coma o punto y coma. Precio con . o ,
 */

function dakinisDetectCsvDelimiter(headerLine) {
  let commas = 0;
  let semis = 0;
  let inQuotes = false;
  for (let i = 0; i < headerLine.length; i += 1) {
    const ch = headerLine[i];
    if (ch === '"') {
      if (inQuotes && headerLine[i + 1] === '"') {
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (inQuotes) continue;
    if (ch === ",") commas += 1;
    if (ch === ";") semis += 1;
  }
  return semis > commas ? ";" : ",";
}

function dakinisSplitCsvLine(line, delimiter = ",") {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && ch === delimiter) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function dakinisParsePrice(raw) {
  const text = String(raw || "")
    .trim()
    .replace(/\s/g, "")
    .replace("€", "")
    .replace(",", ".");
  if (!text) return 0;
  const n = Number(text);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

/**
 * @param {string} text
 * @returns {{ create: object[]; errors: string[]; skipped: number }}
 */
export function dakinisParseMenuCsv(text) {
  const raw = String(text || "").replace(/^\uFEFF/, "");
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) {
    return { create: [], errors: ["CSV vacío"], skipped: 0 };
  }

  const delimiter = dakinisDetectCsvDelimiter(lines[0]);
  const headerCells = dakinisSplitCsvLine(lines[0], delimiter).map((h) => h.toLowerCase());
  const looksHeader =
    headerCells.includes("name") ||
    headerCells.includes("nombre") ||
    headerCells.includes("namees") ||
    headerCells.includes("priceeur") ||
    headerCells.includes("precio");

  let start = 0;
  /** @type {Record<string, number>} */
  let idx = { name: 0, category: 1, price: 2, description: 3 };
  if (looksHeader) {
    start = 1;
    idx = {
      name: Math.max(
        0,
        headerCells.findIndex((h) => ["name", "nombre", "namees", "plato", "producto"].includes(h))
      ),
      category: headerCells.findIndex((h) => ["category", "categoria", "categoría", "cat"].includes(h)),
      price: headerCells.findIndex((h) =>
        ["priceeur", "price", "precio", "precioeur", "pvp"].includes(h)
      ),
      description: headerCells.findIndex((h) =>
        ["description", "descripcion", "descripción", "desc"].includes(h)
      ),
    };
    if (idx.category < 0) idx.category = 1;
    if (idx.price < 0) idx.price = 2;
    if (idx.description < 0) idx.description = 3;
  }

  const create = [];
  const errors = [];
  let skipped = 0;

  for (let row = start; row < lines.length; row += 1) {
    const cells = dakinisSplitCsvLine(lines[row], delimiter);
    const nameEs = String(cells[idx.name] || "").trim();
    if (!nameEs) {
      skipped += 1;
      continue;
    }
    const price = dakinisParsePrice(cells[idx.price]);
    if (price === null) {
      errors.push(`Fila ${row + 1}: precio inválido para «${nameEs}»`);
      continue;
    }
    const category = String(cells[idx.category] || "").trim() || "Otros";
    const description = String(cells[idx.description] || "").trim();
    const item = { nameEs, name: nameEs, category, priceEur: price };
    if (description) item.description = description;
    create.push(item);
  }

  if (!create.length && !errors.length) {
    errors.push("No hay filas de producto válidas");
  }

  return { create, errors, skipped };
}

export const DAKINIS_MENU_CSV_TEMPLATE = `name,category,priceEur,description
Pizza margarita,Pizzas,9.50,Tomate y mozzarella
Ensalada mixtas,Entrantes,6.00,
Café solo,Bebidas,1.40,
`;
