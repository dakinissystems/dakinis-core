import { useRestaurantePanelComandasMock } from "../hooks/useRestaurantePanelComandasMock.js";
import { RestaurantePanelComandasMockLayout } from "./RestaurantePanelComandasMockViews.jsx";

function PanelComandas(props) {
  const mock = useRestaurantePanelComandasMock(props);
  return <RestaurantePanelComandasMockLayout {...mock} />;
}

export default PanelComandas;
