import { PackageSearch } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CardSkeleton,
  EmptyState,
  MyUnderLine,
} from "@/components/shared/utilityComponents";
import StatusCountBox from "@/components/shared/StatusCountBox";
import { getStatusCountMap, getTargetId } from "@/lib/utils";
import { useOrderStore } from "@/store/useOrderStore";
import { useUserStore } from "@/store/useUserStore";
import ActiveOrderCard from "@/components/ActiveOrderCard";

const emptyStateMsgMap: Record<string, { title: string; message: string }> = {
  Restaurant_Owner: {
    title: "No Active Orders",
    message:
      "You haven’t received any active orders yet. Once customers place orders, they’ll appear here. 🍽️",
  },
  Customer: {
    title: "No Active Orders",
    message:
      "You don’t have any active orders right now. Place an order and track it here!",
  },
  Delivery_Agent: {
    title: "No Active Deliveries",
    message:
      "You don’t have any active deliveries at the moment. Stay available to receive new orders 🚴‍♂️",
  },
  Admin: {
    title: "No Active Orders",
    message:
      "There are currently no active orders in the system. New orders will appear here as they are created.",
  },
};


const ActiveOrderList = () => {
  const {
    activeOrders,
    getActiveOrders,
    loading,
    newOrderIds,
    clearNewOrderIds,
  } = useOrderStore();
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const { user } = useUserStore();

  const toggleOpenOrder = (orderId: string) => {
    setOpenOrderId((prev) => (prev === orderId ? null : orderId));
  };

  if (!user) return null;

  const targetId = getTargetId();

  useEffect(() => {
    if (targetId) {
      getActiveOrders(user?.role, targetId);
    }
    return () => {
      newOrderIds.length > 0 && clearNewOrderIds();
    };
  }, []);

  const statusCountMap = getStatusCountMap(activeOrders);

  return (
    <div className="p-6 sm:max-w-5xl  mx-auto min-h-screen bg-gray-50 dark:bg-input/110">
      <div className="pb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Active Orders
        </h1>
        <MyUnderLine></MyUnderLine>
      </div>

      {loading.pageLoad && activeOrders.length === 0 ? (
        <CardSkeleton />
      ) : activeOrders.length === 0 ? (
        <div className="my-20">
          <EmptyState
            icon={<PackageSearch size={48} className="text-gray-500" />}
            title={emptyStateMsgMap[user.role]?.title}
            message={emptyStateMsgMap[user.role]?.message}
          />
        </div>
      ) : (
        <div>
          <StatusCountBox statusMap={statusCountMap} />
          {activeOrders.map((order) => (
            <ActiveOrderCard
              key={order._id}
              order={order}
              isOpen={openOrderId === order._id}
              onToggle={() => toggleOpenOrder(order._id)}
              isNew={newOrderIds.includes(order._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveOrderList;
