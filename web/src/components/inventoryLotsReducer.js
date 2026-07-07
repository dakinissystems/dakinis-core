export const INVENTORY_LOTS_INITIAL = {
  tab: "summary",
  locations: [],
  lots: [],
  summary: { critical: 0, warning: 0, ok: 0, expired: 0 },
  byLocation: {},
  error: "",
  busy: false,
  lastLabel: null,
  scanResult: null,
  productBarcode: "",
  productName: "",
  supplierLot: "",
  expiryDate: "",
  quantity: "1",
  locationId: "",
  supplier: ""
};

export function inventoryLotsReducer(state, action) {
  switch (action.type) {
    case "setTab":
      return { ...state, tab: action.tab };
    case "setField":
      return { ...state, [action.field]: action.value };
    case "setError":
      return { ...state, error: action.error };
    case "setBusy":
      return { ...state, busy: action.busy };
    case "setLastLabel":
      return { ...state, lastLabel: action.lastLabel };
    case "setScanResult":
      return { ...state, scanResult: action.scanResult };
    case "loadedDemo":
      return {
        ...state,
        locations: action.locations,
        lots: action.lots,
        summary: action.summary,
        byLocation: action.byLocation,
        locationId: action.locationId ?? state.locationId,
        error: ""
      };
    case "loadedApi":
      return {
        ...state,
        locations: action.locations,
        lots: action.lots,
        summary: action.summary,
        byLocation: action.byLocation,
        locationId: action.locationId ?? state.locationId,
        error: ""
      };
    case "prependLot":
      return { ...state, lots: [action.lot, ...state.lots], lastLabel: action.lot };
    case "resetReceiveForm":
      return {
        ...state,
        productBarcode: "",
        supplierLot: "",
        expiryDate: "",
        quantity: "1"
      };
    case "scanProduct":
      return { ...state, productBarcode: action.code, tab: action.tab ?? state.tab };
    default:
      return state;
  }
}
