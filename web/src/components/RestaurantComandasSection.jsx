import RestaurantComandasPanels from "./RestaurantComandasPanels.jsx";
import { useRestaurantComandasSection } from "../hooks/useRestaurantComandasSection.js";

export default function RestaurantComandasSection(props) {
  const { shouldRender, panelsCtx } = useRestaurantComandasSection(props);

  if (!shouldRender) return null;

  return <RestaurantComandasPanels ctx={panelsCtx} />;
}
