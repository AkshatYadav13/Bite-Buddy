
import { useState, useEffect } from "react";
import {
  Clock,
} from "lucide-react";
import { OrderType } from "@/types/orderTypes";
import { OrderBillSection, OrderCartSection, OrderMainSection } from "@/components/shared/orderCard/helpers";
import { NewBadge } from "@/components/shared/utilityComponents";


const AgentOrderCard = ({
  order,
  onAcceptOrder,
  isNew
}: {
    order: OrderType;
    onAcceptOrder: (orderId: string) => void;
    isNew:boolean
}) => {

  const [showMore, setShowMore] = useState(false);
  
  const readyTime = order.statusDetails.find(
    (s) => s.status === "ReadyForPickup" || s.status === "Confirmed"
  )?.time;

  return (
    <div className="bg-white relative dark:bg-input rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              Order #{order._id.slice(-6).toUpperCase()}
            </h3>
            <div className="bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 py-1 rounded-full px-3 text-sm font-semibold flex items-center gap-1">
              ₹{order.bill.shippingFee}
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ready for pickup • Earn full shipping fee
          </p>
        </div>
        <TimeCounter readyTime={readyTime!} />
      </div>

    {
        isNew && 
        <NewBadge classes="top-[-14px] right-8 " ></NewBadge>
    }

      <OrderMainSection  
        order={order}
      ></OrderMainSection>


      {/* Toggle View More */}
      <div className="mb-4">
        <button
          onClick={() => setShowMore(!showMore)}
          className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-2 px-4 rounded-lg border border-blue-200 dark:border-blue-600 hover:border-blue-300 dark:hover:border-blue-400 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <span>{showMore ? "View Less" : "View More Details"}</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              showMore ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Expanded Details */}
      {showMore && (
        <div className="space-y-4 mb-4">
          {/* Order Items */}
          <OrderCartSection
            cartItems={order.cartItems}
          ></OrderCartSection>

          <OrderBillSection
            bill={order.bill}
          ></OrderBillSection>
        </div>
      )}

      {/* Accept Button */}
      <div>
        <button
          onClick={() => onAcceptOrder(order._id)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Accept Order
        </button>
      </div>
    </div>
  );
};

export default AgentOrderCard


const TimeCounter = ({ readyTime }: { readyTime: Date }) => {
  const [timeElapsed, setTimeElapsed] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now: any = new Date();
      const ready: any = new Date(readyTime);
      const diffInMinutes = Math.floor((now - ready) / (1000 * 60));

      if (diffInMinutes < 60) {
        if(diffInMinutes === 0){
          setTimeElapsed(`Just now`);
        }else{
          setTimeElapsed(`${diffInMinutes}m ago`);
        }
      } else {
        const hours = Math.floor(diffInMinutes / 60);
        const minutes = diffInMinutes % 60;
        setTimeElapsed(`${hours}h ${minutes}m ago`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [readyTime]);

  return (
    <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-full text-sm font-medium">
      <Clock size={14} />
      <span>{timeElapsed}</span>
    </div>
  );
};
