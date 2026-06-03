/** Insumos y recetas demo (caso Manu: pizzas + empanadas). */

export const DAKINIS_RESTAURANT_DEFAULT_ITEMS = [
  { slug: "harina", name: "Harina", unit: "g", minQuantity: 500 },
  { slug: "agua", name: "Agua", unit: "ml", minQuantity: 200 },
  { slug: "sal", name: "Sal", unit: "g", minQuantity: 50 },
  { slug: "levadura", name: "Levadura", unit: "g", minQuantity: 20 },
  { slug: "cebolla", name: "Cebolla", unit: "g", minQuantity: 300 },
  { slug: "morron", name: "Morrón", unit: "g", minQuantity: 200 },
  { slug: "carne", name: "Carne picada", unit: "g", minQuantity: 500 },
  { slug: "tapas", name: "Tapas empanada", unit: "u", minQuantity: 12 },
  { slug: "huevo", name: "Huevo", unit: "u", minQuantity: 6 },
  { slug: "aceitunas", name: "Aceitunas (frasco)", unit: "frasco", minQuantity: 1 }
];

/** Cada batch de empanadas rinde 3 docenas (36 u) con los insumos indicados por Manu. */
export const DAKINIS_RESTAURANT_DEFAULT_RECIPES = [
  {
    slug: "pizza-prepizza",
    name: "Pizza (prepizza)",
    outputLabel: "Prepizzas",
    outputQuantity: 1,
    outputUnit: "u",
    lines: [
      { itemSlug: "harina", quantity: 1000, unit: "g" },
      { itemSlug: "agua", quantity: 600, unit: "ml" },
      { itemSlug: "sal", quantity: 25, unit: "g" },
      { itemSlug: "levadura", quantity: 10, unit: "g" }
    ]
  },
  {
    slug: "empanadas-docena",
    name: "Empanadas (3 docenas)",
    outputLabel: "Empanadas",
    outputQuantity: 36,
    outputUnit: "u",
    lines: [
      { itemSlug: "cebolla", quantity: 1000, unit: "g" },
      { itemSlug: "morron", quantity: 500, unit: "g" },
      { itemSlug: "carne", quantity: 1000, unit: "g" },
      { itemSlug: "tapas", quantity: 36, unit: "u" },
      { itemSlug: "huevo", quantity: 4, unit: "u" },
      { itemSlug: "aceitunas", quantity: 0.25, unit: "frasco" }
    ]
  }
];

/** Pedido de compra de ejemplo → stock inicial aproximado. */
export const DAKINIS_RESTAURANT_DEMO_PURCHASE = [
  { itemSlug: "harina", quantity: 5000 },
  { itemSlug: "cebolla", quantity: 4000 },
  { itemSlug: "morron", quantity: 3000 },
  { itemSlug: "tapas", quantity: 120 },
  { itemSlug: "aceitunas", quantity: 5 },
  { itemSlug: "huevo", quantity: 48 },
  { itemSlug: "sal", quantity: 1000 },
  { itemSlug: "levadura", quantity: 500 },
  { itemSlug: "carne", quantity: 4000 },
  { itemSlug: "agua", quantity: 3000 }
];

/** Producción objetivo aproximada del ejemplo Manu. */
export const DAKINIS_RESTAURANT_DEMO_PRODUCTION = [
  { recipeSlug: "pizza-prepizza", batches: 4 },
  { recipeSlug: "empanadas-docena", batches: 1 }
];

/** Dumpling House — mismos slugs que inventario en seed (kg / L). */
export const DAKINIS_DUMPLING_STOCK_ITEMS = [
  { slug: "harina-trigo", name: "Harina de trigo", unit: "kg", minQuantity: 5 },
  { slug: "arroz", name: "Arroz", unit: "kg", minQuantity: 5 },
  { slug: "cerdo", name: "Cerdo", unit: "kg", minQuantity: 3 },
  { slug: "pollo", name: "Pollo", unit: "kg", minQuantity: 3 },
  { slug: "ternera", name: "Ternera", unit: "kg", minQuantity: 2 },
  { slug: "pato", name: "Pato", unit: "kg", minQuantity: 2 },
  { slug: "langostino", name: "Langostino", unit: "kg", minQuantity: 2 },
  { slug: "verduras", name: "Verduras mix", unit: "kg", minQuantity: 3 },
  { slug: "soja-salsa", name: "Salsa de soja", unit: "L", minQuantity: 1 },
  { slug: "sesamo", name: "Sésamo", unit: "kg", minQuantity: 0.5 }
];

export const DAKINIS_DUMPLING_DEFAULT_RECIPES = [
  {
    slug: "gyozas-pollo",
    name: "Gyozas de pollo (8 uds)",
    outputLabel: "Gyozas",
    outputQuantity: 8,
    outputUnit: "u",
    lines: [
      { itemSlug: "harina-trigo", quantity: 0.25, unit: "kg" },
      { itemSlug: "pollo", quantity: 0.5, unit: "kg" },
      { itemSlug: "verduras", quantity: 0.2, unit: "kg" },
      { itemSlug: "soja-salsa", quantity: 0.1, unit: "L" },
      { itemSlug: "sesamo", quantity: 0.02, unit: "kg" }
    ]
  },
  {
    slug: "gyozas-cerdo",
    name: "Gyozas de cerdo (8 uds)",
    outputLabel: "Gyozas",
    outputQuantity: 8,
    outputUnit: "u",
    lines: [
      { itemSlug: "harina-trigo", quantity: 0.25, unit: "kg" },
      { itemSlug: "cerdo", quantity: 0.5, unit: "kg" },
      { itemSlug: "verduras", quantity: 0.2, unit: "kg" },
      { itemSlug: "soja-salsa", quantity: 0.1, unit: "L" },
      { itemSlug: "sesamo", quantity: 0.02, unit: "kg" }
    ]
  },
  {
    slug: "gyozas-vegetal",
    name: "Gyozas vegetales (8 uds)",
    outputLabel: "Gyozas",
    outputQuantity: 8,
    outputUnit: "u",
    lines: [
      { itemSlug: "harina-trigo", quantity: 0.25, unit: "kg" },
      { itemSlug: "verduras", quantity: 0.35, unit: "kg" },
      { itemSlug: "soja-salsa", quantity: 0.1, unit: "L" },
      { itemSlug: "sesamo", quantity: 0.02, unit: "kg" }
    ]
  },
  {
    slug: "noodles-vegetal",
    name: "Noodles vegetal (ración)",
    outputLabel: "Raciones",
    outputQuantity: 1,
    outputUnit: "u",
    lines: [
      { itemSlug: "harina-trigo", quantity: 0.15, unit: "kg" },
      { itemSlug: "verduras", quantity: 0.3, unit: "kg" },
      { itemSlug: "soja-salsa", quantity: 0.15, unit: "L" },
      { itemSlug: "sesamo", quantity: 0.01, unit: "kg" }
    ]
  },
  {
    slug: "rollitos-vegetal",
    name: "Rollitos vegetales (2 uds)",
    outputLabel: "Rollitos",
    outputQuantity: 2,
    outputUnit: "u",
    lines: [
      { itemSlug: "harina-trigo", quantity: 0.1, unit: "kg" },
      { itemSlug: "verduras", quantity: 0.15, unit: "kg" },
      { itemSlug: "soja-salsa", quantity: 0.05, unit: "L" },
      { itemSlug: "sesamo", quantity: 0.01, unit: "kg" }
    ]
  }
];

/** Pedido de reposición típico Dumpling House. */
export const DAKINIS_DUMPLING_DEMO_PURCHASE = [
  { itemSlug: "harina-trigo", quantity: 10 },
  { itemSlug: "arroz", quantity: 10 },
  { itemSlug: "pollo", quantity: 8 },
  { itemSlug: "cerdo", quantity: 8 },
  { itemSlug: "ternera", quantity: 5 },
  { itemSlug: "verduras", quantity: 6 },
  { itemSlug: "soja-salsa", quantity: 3 },
  { itemSlug: "sesamo", quantity: 1 },
  { itemSlug: "langostino", quantity: 4 },
  { itemSlug: "pato", quantity: 4 }
];

/** Plan demo: ~32 gyozas pollo + ~15 gyozas cerdo + noodles. */
export const DAKINIS_DUMPLING_DEMO_PRODUCTION = [
  { recipeSlug: "gyozas-pollo", batches: 4 },
  { recipeSlug: "gyozas-cerdo", batches: 2 },
  { recipeSlug: "noodles-vegetal", batches: 3 }
];

export const DAKINIS_DUMPLING_HOUSE_SLUG = "dumpling-house";

/** Fermina Food — bites (bolsa → unidades) + choripán. */
export const DAKINIS_FERMINA_STOCK_ITEMS = [
  { slug: "bites-cheddar", name: "Bites cheddar y jalapeños (bolsa)", unit: "u", minQuantity: 90 },
  { slug: "bites-pollo", name: "Chicken bites (bolsa)", unit: "u", minQuantity: 120 },
  { slug: "pan-choripan", name: "Pan de choripán", unit: "u", minQuantity: 10 },
  { slug: "chorizo", name: "Chorizo", unit: "u", minQuantity: 12 },
  { slug: "chimichurri", name: "Chimichurri", unit: "L", minQuantity: 0.5 },
  { slug: "pan-burger", name: "Pan (otros)", unit: "u", minQuantity: 5 }
];

export const DAKINIS_FERMINA_DEFAULT_RECIPES = [
  {
    slug: "porcion-cheddar-bites",
    name: "Porción bites cheddar y jalapeños (9 uds/bolsa ~50)",
    outputLabel: "Porciones",
    outputQuantity: 1,
    outputUnit: "u",
    lines: [{ itemSlug: "bites-cheddar", quantity: 9, unit: "u" }]
  },
  {
    slug: "porcion-chicken-bites",
    name: "Porción chicken bites (11 uds/bolsa ~120)",
    outputLabel: "Porciones",
    outputQuantity: 1,
    outputUnit: "u",
    lines: [{ itemSlug: "bites-pollo", quantity: 11, unit: "u" }]
  },
  {
    slug: "choripan-unidad",
    name: "Choripán",
    outputLabel: "Choripanes",
    outputQuantity: 1,
    outputUnit: "u",
    lines: [
      { itemSlug: "pan-choripan", quantity: 1, unit: "u" },
      { itemSlug: "chorizo", quantity: 1, unit: "u" },
      { itemSlug: "chimichurri", quantity: 0.02, unit: "L" }
    ]
  }
];

export const DAKINIS_FERMINA_DEMO_PURCHASE = [
  { itemSlug: "bites-cheddar", quantity: 100 },
  { itemSlug: "bites-pollo", quantity: 120 },
  { itemSlug: "pan-choripan", quantity: 20 },
  { itemSlug: "chorizo", quantity: 24 },
  { itemSlug: "chimichurri", quantity: 1 }
];

export const DAKINIS_FERMINA_DEMO_PRODUCTION = [
  { recipeSlug: "porcion-cheddar-bites", batches: 8 },
  { recipeSlug: "porcion-chicken-bites", batches: 6 },
  { recipeSlug: "choripan-unidad", batches: 10 }
];

export const DAKINIS_FERMINA_HOUSE_SLUG = "fermina-food";

/** Canales de venta (salón, apps, etc.). */
export const DAKINIS_RESTAURANT_CHANNEL_IDS = ["salon", "takeaway", "delivery", "glovo", "uber"];

/** Formas de cobro al cerrar el pedido. */
export const DAKINIS_RESTAURANT_PAYMENT_IDS = ["efectivo", "tarjeta"];

export function dakinisNormalizeRestaurantChannel(value) {
  const id = String(value || "salon").trim().toLowerCase();
  return DAKINIS_RESTAURANT_CHANNEL_IDS.includes(id) ? id : "salon";
}

export function dakinisNormalizeRestaurantPayment(value) {
  const id = String(value || "tarjeta").trim().toLowerCase();
  return DAKINIS_RESTAURANT_PAYMENT_IDS.includes(id) ? id : "tarjeta";
}

/** Filas de carta para cartel QR (categoría Entrante → rejilla pública). */
export const DAKINIS_FERMINA_DISH_ALLERGEN_ROWS = [
  {
    id: "dish_cheddar_jalapeno_bites",
    name: "Bites cheddar y jalapeños",
    category: "Entrante",
    present: true,
    severity: "alta",
    notes: "Leche, Gluten"
  },
  {
    id: "dish_chicken_bites",
    name: "Chicken bites",
    category: "Entrante",
    present: true,
    severity: "alta",
    notes: "Gluten"
  },
  {
    id: "dish_choripan",
    name: "Choripán",
    category: "Entrante",
    present: true,
    severity: "alta",
    notes: "Gluten"
  }
];

/**
 * Consumo total de insumos para N batches de varias recetas.
 * @param {Array<{ recipeSlug: string, batches: number }>} plan
 * @param {Array} recipes
 */
export function dakinisRestaurantPlanConsumption(plan, recipes) {
  const needed = {};
  for (const row of plan) {
    const recipe = recipes.find((r) => r.slug === row.recipeSlug);
    if (!recipe || row.batches <= 0) continue;
    for (const line of recipe.lines) {
      needed[line.itemSlug] = (needed[line.itemSlug] || 0) + line.quantity * row.batches;
    }
  }
  return needed;
}

/**
 * Salida esperada por plan de producción.
 */
export function dakinisRestaurantPlanOutputs(plan, recipes) {
  const outputs = [];
  for (const row of plan) {
    const recipe = recipes.find((r) => r.slug === row.recipeSlug);
    if (!recipe || row.batches <= 0) continue;
    outputs.push({
      recipeSlug: recipe.slug,
      recipeName: recipe.name,
      batches: row.batches,
      totalOutput: recipe.outputQuantity * row.batches,
      outputLabel: recipe.outputLabel,
      outputUnit: recipe.outputUnit
    });
  }
  return outputs;
}

/**
 * Máximo de batches por receta si se dedicara todo el stock a esa receta.
 */
export function dakinisRestaurantMaxBatchesPerRecipe(stockBySlug, recipes) {
  return recipes.map((recipe) => {
    let maxBatches = Infinity;
    for (const line of recipe.lines) {
      const available = Number(stockBySlug[line.itemSlug] ?? 0);
      const perBatch = Number(line.quantity);
      if (perBatch <= 0) continue;
      maxBatches = Math.min(maxBatches, Math.floor(available / perBatch));
    }
    if (!Number.isFinite(maxBatches) || maxBatches < 0) maxBatches = 0;
    return {
      recipeSlug: recipe.slug,
      recipeName: recipe.name,
      maxBatches,
      outputPerBatch: recipe.outputQuantity,
      outputUnit: recipe.outputUnit,
      outputLabel: recipe.outputLabel
    };
  });
}

export function dakinisRestaurantValidatePlan(plan, recipes, stockBySlug) {
  const needed = dakinisRestaurantPlanConsumption(plan, recipes);
  const shortages = [];
  for (const [slug, qty] of Object.entries(needed)) {
    const have = Number(stockBySlug[slug] ?? 0);
    if (have + 1e-6 < qty) {
      shortages.push({ itemSlug: slug, needed: qty, available: have, missing: qty - have });
    }
  }
  return { ok: shortages.length === 0, needed, shortages };
}
