import { OrderType } from "@/types/orderTypes";
import {
  CancellationDetailsBox,
  DisplayRatingDetails,
  OrderAgentInfoSection,
  OrderBillSection,
  OrderCartSection,
  OrderHeaderSection,
  OrderMainSection,
} from "@/components/shared/orderCard/helpers";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";

type StaticCardProps = {
  order: OrderType;
  isOpen: boolean;
  onToggle: () => void;
};

const StaticOrderCard = ({ order, isOpen, onToggle }: StaticCardProps) => {
  return (
    <div className="bg-white dark:bg-input rounded-xl lg:mx-auto max-w-250 shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4 flex-wrap gap-5 relative pr-10">
        <button
          onClick={onToggle}
          className="ml-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white absolute top-0 right-0"
        >
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        <OrderHeaderSection order={order}></OrderHeaderSection>
      </div>

      <OrderMainSection order={order}></OrderMainSection>

      {!isOpen ? (
        <div className="flex justify-center items-center">
          <Button
            variant="outline"
            onClick={onToggle}
            className="ml-2 flex justify-center items-end gap-1 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
          >
            <ChevronDown size={18} />
            view more
          </Button>
        </div>
      ) : (
        <>
          <OrderCartSection cartItems={order.cartItems}></OrderCartSection>

          <OrderBillSection bill={order.bill}></OrderBillSection>

          {order.deliveryAgent && order.deliveryAgent.user && (
            <OrderAgentInfoSection
              deliveryAgent={order.deliveryAgent}
            ></OrderAgentInfoSection>
          )}
          {order.cancellationDetails && (
            <CancellationDetailsBox
              userType={order.cancellationDetails.userType}
              reason={order.cancellationDetails.reason}
            />
          )}
          {order.ratingDetails && (
            <DisplayRatingDetails
              ratingDetails={order.ratingDetails}
            ></DisplayRatingDetails>
          )}
        </>
      )}
    </div>
  );
};

export default StaticOrderCard;
