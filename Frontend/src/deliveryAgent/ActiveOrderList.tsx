import { PackageSearch } from "lucide-react";
import { useDeliveryAgentStore } from "@/store/useDeliveryAgentStore";
import {
  CardSkeleton,
  EmptyState,
} from "@/components/shared/utilityComponents";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { OrderType } from "@/types/orderTypes";
import { useOrderStore } from "@/store/useOrderStore";
import ActiveOrderCard from "@/components/ActiveOrderCard";

const AgentActiveOrderList = () => {
  const { deliveryAgentDetails } =useDeliveryAgentStore();
  const { activeOrders, getActiveOrders, newOrderIds, clearNewOrderIds,loading } =
    useOrderStore();
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const toggleOpenOrder = (orderId: string) => {
    setOpenOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const agentId = deliveryAgentDetails?._id;

  useEffect(() => {
    if (agentId) {
      getActiveOrders("Delivery_Agent", agentId);
    }
    return () => {
      newOrderIds.length > 0 && clearNewOrderIds();
    };
  }, []);

 
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-input/110">
      <div className="mx-auto">
        {/* ===== Header ===== */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">
              Active Orders
            </h1>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Follow steps below to complete deliveries
            </p>

            <div className="flex items-center gap-2 mt-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">
                {activeOrders.length} orders available
              </span>
            </div>
          </div>
        </div>

        {/* ===== Content ===== */}
        {loading.pageLoad && activeOrders.length === 0 ? (
          <CardSkeleton></CardSkeleton>
        ) : activeOrders.length === 0 ? (
          <div className="my-20">
            <EmptyState
              title="No Orders Yet"
              message="You haven't placed any orders. Start shopping now!"
              icon={<PackageSearch size={48} className="text-gray-500" />}
            />
          </div>
        ) : (
          <div className="my-10 grid grid-cols-1 lg:grid-cols-[430px_1fr] gap-6">
            <div className="space-y-3">
              <ActiveOrderSummaryList activeOrders={activeOrders} />
            </div>
            <div className="space-y-3">
              {activeOrders.map((order) => (
                <ActiveOrderCard
                  key={order._id}
                  order={order}
                  isNew={newOrderIds.includes(order._id)}
                  isOpen={openOrderId === order._id}
                  onToggle={() => toggleOpenOrder(order._id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentActiveOrderList;

const OrderQuickCard = ({
  order,
  isOpen,
  onToggle,
}: {
  order: OrderType;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const assignmentTypeMeta: Record<
    string,
    { label: string; className: string; title: string }
  > = {
    Manual: {
      label: "Manual",
      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40",
      title: "You accepted this order manually",
    },
    Fallback: {
      label: "Fallback",
      className: "bg-orange-100 text-orange-700 dark:bg-orange-900/40",
      title: "Assigned to you as restaurant fallback",
    },
  };

  const assignmentMeta =
    assignmentTypeMeta[order.agentAssignmentType] || assignmentTypeMeta.Manual;

  return (
    <div className="w-full rounded-xl border bg-white dark:bg-input shadow-sm transition">
      {/* ===== Header ===== */}
      <div
        className="px-4 py-3 flex items-center justify-between gap-3 cursor-pointer"
        onClick={onToggle}
      >
        {/* Left */}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold truncate">
            {order.restaurant.restaurantName}
          </h3>

          <p className="text-[11px] text-muted-foreground truncate">
            #{order._id.slice(-6)}
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Assignment Type */}
          <span
            title={assignmentMeta.title}
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${assignmentMeta.className}`}
          >
            {assignmentMeta.label}
          </span>

          {/* Status */}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40">
            Active
          </span>

          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* ===== Expanded ===== */}
      {isOpen && (
        <div className="px-4 pb-3 pt-2 border-t space-y-2 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Pickup</span>
            <span className="text-right truncate max-w-[180px]">
              {order.deliveryDetails.pickup.address}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Drop</span>
            <span className="text-right truncate max-w-[180px]">
              {order.deliveryDetails.drop.address}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Customer</span>
            <span className="truncate max-w-[160px]">
              {order.user.fullName}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping Fee</span>
            <span>₹{order.bill.shippingFee}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium">
              {order.currentStatus.replace(/([A-Z])/g, " $1")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const ActiveOrderSummaryList = ({
  activeOrders,
}: {
  activeOrders: OrderType[];
}) => {
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  return (
    <div className="w-full space-y-3">
      {activeOrders.map((order) => (
        <OrderQuickCard
          key={order._id}
          order={order}
          isOpen={openOrderId === order._id}
          onToggle={() =>
            setOpenOrderId((prev) => (prev === order._id ? null : order._id))
          }
        />
      ))}
    </div>
  );
};
