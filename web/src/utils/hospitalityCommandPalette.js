import { dakinisIsHospitalityBusiness } from "@dakinis/shared/catalog/hospitality.js";
import { dakinisRestaurantTaskPath } from "../utils/restaurantTaskStorage.js";

/**
 * Comandos y hits locales de hostelería para Ctrl+K.
 */
export function dakinisHospitalityCommands(session, t) {
  if (!dakinisIsHospitalityBusiness(session?.business?.type)) return [];
  const v = session.business.type;
  const label = (key, fallback) => {
    try {
      const v2 = t?.(key);
      return v2 && v2 !== key ? v2 : fallback;
    } catch {
      return fallback;
    }
  };
  return [
    {
      id: "rest-sala",
      group: "navigation",
      label: label("restaurant.taskSala", "Sala"),
      keywords: ["mesa", "salon", "floor", "sala", "camarero"],
      path: dakinisRestaurantTaskPath(v, "sala")
    },
    {
      id: "rest-cocina",
      group: "navigation",
      label: label("restaurant.taskCocina", "Cocina"),
      keywords: ["kitchen", "comandas", "cola"],
      path: dakinisRestaurantTaskPath(v, "cocina")
    },
    {
      id: "rest-inventario",
      group: "navigation",
      label: label("restaurant.taskInventario", "Inventario"),
      keywords: ["stock", "escanear", "barcode"],
      path: dakinisRestaurantTaskPath(v, "inventario", { sub: "scan" })
    },
    {
      id: "rest-lotes",
      group: "navigation",
      label: label("restaurant.invTabLots", "Lotes"),
      keywords: ["lote", "caducidad", "lots"],
      path: dakinisRestaurantTaskPath(v, "inventario", { sub: "lots" })
    },
    {
      id: "rest-delivery",
      group: "navigation",
      label: label("restaurant.taskDelivery", "Delivery"),
      keywords: ["glovo", "uber", "justeat", "marketplace"],
      path: dakinisRestaurantTaskPath(v, "delivery")
    },
    {
      id: "rest-caja",
      group: "navigation",
      label: label("restaurant.taskCaja", "Caja"),
      keywords: ["cierre", "factura", "cobro", "cash"],
      path: dakinisRestaurantTaskPath(v, "caja")
    },
    {
      id: "rest-config-carta",
      group: "settings",
      label: label("restaurant.configCarta", "Carta / precios"),
      keywords: ["precio", "menu", "carta", "pizza"],
      path: dakinisRestaurantTaskPath(v, "config", { sub: "carta" })
    },
    {
      id: "rest-config-alerg",
      group: "settings",
      label: label("restaurant.configSeguridad", "Alérgenos"),
      keywords: ["alergeno", "allergens", "seguridad"],
      path: dakinisRestaurantTaskPath(v, "config", { sub: "seguridad" })
    }
  ];
}

/**
 * Hits sintéticos a partir de la query (mesa N, glovo, factura…).
 */
export function dakinisHospitalitySearchHits(session, query, t) {
  if (!dakinisIsHospitalityBusiness(session?.business?.type)) return [];
  const q = String(query || "").trim().toLowerCase();
  if (q.length < 2) return [];
  const v = session.business.type;
  const hits = [];

  const mesa = q.match(/\bmesa\s*(\d+)\b/) || q.match(/^m\s*(\d+)$/);
  if (mesa) {
    hits.push({
      id: `mesa-${mesa[1]}`,
      scope: "restaurant",
      title: `${t?.("restaurant.cmdkOpenTable", "Abrir mesa")} ${mesa[1]}`,
      path: dakinisRestaurantTaskPath(v, "sala")
    });
  }

  if (/glovo|uber|just\s*eat|delivery/.test(q)) {
    hits.push({
      id: "hit-delivery",
      scope: "restaurant",
      title: t?.("restaurant.cmdkOpenDelivery", "Abrir Delivery"),
      path: dakinisRestaurantTaskPath(v, "delivery")
    });
  }

  if (/stock|inventario|escan|barcode|lote/.test(q)) {
    hits.push({
      id: "hit-stock",
      scope: "restaurant",
      title: t?.("restaurant.cmdkOpenStock", "Abrir inventario / escáner"),
      path: dakinisRestaurantTaskPath(v, "inventario", { sub: /lote/.test(q) ? "lots" : "scan" })
    });
  }

  if (/factura|invoice|cierre|caja/.test(q)) {
    hits.push({
      id: "hit-caja",
      scope: "restaurant",
      title: t?.("restaurant.cmdkOpenCaja", "Abrir caja / facturas"),
      path: dakinisRestaurantTaskPath(v, "caja")
    });
  }

  if (/precio|carta|menu|pizza|plato/.test(q)) {
    hits.push({
      id: "hit-carta",
      scope: "restaurant",
      title: t?.("restaurant.cmdkOpenMenu", "Editar carta / precios"),
      path: dakinisRestaurantTaskPath(v, "config", { sub: "carta" })
    });
  }

  if (/cocina|comanda|kitchen/.test(q)) {
    hits.push({
      id: "hit-kitchen",
      scope: "restaurant",
      title: t?.("restaurant.cmdkOpenKitchen", "Abrir cocina"),
      path: dakinisRestaurantTaskPath(v, "cocina")
    });
  }

  return hits;
}
