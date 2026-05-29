import { useEffect } from "react";
import {  Package } from "lucide-react";
import { useDeliveryAgentStore } from "@/store/useDeliveryAgentStore";
import AgentOrderCard from "./AgentOrderCard";
import { Loading } from "@/components/shared/utilityComponents";
import { cn } from "@/lib/utils";
import { useOrderStore } from "@/store/useOrderStore";
import { useNavigate } from "react-router-dom";

// choose order Page

const AcceptOrderPage = () => {
  const {
    acceptOrder,
    loading,
    pickupOrders,
    getPickupOrdersForAgents,
  } = useDeliveryAgentStore();

  const { newOrderIds, clearNewOrderIds } = useOrderStore();

  const navigate = useNavigate();

  useEffect(() => {
    getPickupOrdersForAgents();

    return () => {
      if (newOrderIds.length > 0) clearNewOrderIds();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50  dark:bg-input/110 ">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="sm:flex justify-between mb-6 items-center">
          <div className="">
            <h1 className="text-3xl font-bold mb-2">Available Orders</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Orders ready for pickup - Accept to start delivery
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {pickupOrders.length} orders available
              </span>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading.pageLoading && <Loading message="Processing Request.."></Loading>}

        {pickupOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-600 mb-2 dark:text-gray-400">
              No orders available
            </h3>
            <p className="text-gray-500">
              Check back later for new delivery opportunities
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pickupOrders.map((order) => (
              <div
                key={order._id}
                className={cn(
                  "transition-all",
                  newOrderIds.includes(order._id) &&
                    "ring-2 ring-orange-400/60 rounded-xl",
                )}
              >
                <AgentOrderCard
                  order={order}
                  onAcceptOrder={(data) => acceptOrder(data, navigate)}
                  isNew={newOrderIds.includes(order._id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptOrderPage;
