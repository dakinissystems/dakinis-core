import { useSupplyDeliveriesAndAlerts } from "../hooks/useSupplyDeliveriesAndAlerts.js";
import { SupplyAlertsSection, SupplyDeliveriesSection } from "./SupplyDeliveriesPanels.jsx";

const EMPTY_STRING_LIST = [];

export default function SupplyDeliveriesAndAlerts({
  apiSession,
  tenantSlugForVertical,
  activeSystemKey,
  supplierNames = EMPTY_STRING_LIST,
  productRefs = EMPTY_STRING_LIST,
  fallbackDeliveries = EMPTY_STRING_LIST,
  fallbackAlerts = EMPTY_STRING_LIST
}) {
  const supply = useSupplyDeliveriesAndAlerts({
    apiSession,
    tenantSlugForVertical,
    activeSystemKey,
    supplierNames,
    productRefs,
    fallbackDeliveries,
    fallbackAlerts
  });

  return (
    <>
      <SupplyDeliveriesSection {...supply} />
      <SupplyAlertsSection {...supply} />
    </>
  );
}
