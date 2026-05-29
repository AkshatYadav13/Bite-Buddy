import { Button } from "@/components/ui/button";
import { getDistance } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useDeliveryAgentStore } from "@/store/useDeliveryAgentStore";
import { useOrderStore } from "@/store/useOrderStore";
import { Loader2, MapPin } from "lucide-react";
import AgentActiveOrderList from "./ActiveOrderList";
import AcceptOrderPage from "./AcceptOrderPage";

import { useEffect, useState } from "react";
import { getGeoCoords } from "../lib/utils";

const LOC_DISTANCE_KM = 2;
const LOC_TIME_LIMIT_MS = 10 * 60 * 1000; // ten minutes

export const UpdateAgentLocationBtn = () => {
  const { updateAgentLocation, deliveryAgentDetails } = useDeliveryAgentStore();
  const [loading,setLoading] = useState<boolean>(false)

  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    getGeoCoords().then(setCoords);
  }, []);

  if (!coords || !deliveryAgentDetails?.lastLocation) return null;

  const distance = getDistance(
    coords,
    deliveryAgentDetails.lastLocation
  );

  const lastUpdatedAt = new Date(
    deliveryAgentDetails.lastLocationUpdatedAt
  ).getTime();

  const isTimeExceeded =
    Date.now() - lastUpdatedAt > LOC_TIME_LIMIT_MS;

  const shouldShow = (distance !== null && distance > LOC_DISTANCE_KM) ||
    isTimeExceeded;

  if (!shouldShow) return null;

  async function handleUpdateLocation(){
    if(coords?.latitude && coords?.longitude){
      setLoading(true)
      await updateAgentLocation(coords)
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleUpdateLocation}
      className="flex items-center gap-2"
      disabled={loading}
    >
      {
        loading?
          <Loader2 className="w-4 h-4 animate-spin" />
        :
        <>
        <MapPin className="w-4 h-4 text-orange-500" />
        <span>Update Location</span>
        </>
      }
    </Button>
  );
};

const AgentOrderPage = () => {
  const { userLocation } = useAppStore();
  const { deliveryAgentDetails } = useDeliveryAgentStore();
    const {activeOrders} = useOrderStore()

  const isLocationMissing =
    !userLocation || !deliveryAgentDetails?.lastLocation;

  if (isLocationMissing) {
    return (
      <div className="flex flex-col items-center gap-3 p-4 border border-dashed rounded-xl bg-muted/40 text-center">
        <MapPin className="w-6 h-6 text-orange-500" />

        <p className="text-sm font-medium">Location not available</p>

        <p className="text-xs text-muted-foreground">
          Enable location access to inform customers.
        </p>

        <Button className="mt-2">Enable Location</Button>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="flex justify-end sm:block">
        <UpdateAgentLocationBtn></UpdateAgentLocationBtn>
      </div>
        {
         deliveryAgentDetails?.status === "OnDelivery" ||  activeOrders.length > 0 ?(
            <AgentActiveOrderList></AgentActiveOrderList>
         )   
         :
         <AcceptOrderPage></AcceptOrderPage>
        }
    </div>
  );
};

export default AgentOrderPage;
