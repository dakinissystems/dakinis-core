/**
 * Compat shim — handlers de menú/pedidos/facturas viven en modules/hospitality.
 * Las rutas /api/tenant/restaurant/* siguen importando desde aquí.
 */
export {
  dakinisHandleRestaurantMenuGet,
  dakinisHandleRestaurantMenuPatch,
  dakinisHandleRestaurantOrdersList,
  dakinisHandleRestaurantOrdersPost,
  dakinisHandleRestaurantOrdersPatch,
  dakinisHandleRestaurantInvoicesList,
  dakinisHandleRestaurantInvoicesPost,
  dakinisHandleRestaurantFloorGet,
  dakinisHandleRestaurantFloorPatch,
  dakinisHandleRestaurantTableSessionPatch,
  dakinisHospitalityOnly
} from "../modules/hospitality/http.js";
