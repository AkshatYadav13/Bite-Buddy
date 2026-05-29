import { OrderStatus, OrderType } from "@/types/orderTypes";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";
import { useMemo, useState } from "react";
import { useOrderStore } from "@/store/useOrderStore";
import ConfirmBox from "./shared/ConfirmBox";
import { Link } from "react-router-dom";
import CancelOrderDialog from "./shared/orderCard/CancelOrderDialog";
import OrderRatingDialog from "./shared/orderCard/OrderRatingDialog";
import TwoStepOtpDialog, {
  CancellationDetailsBox,
  DisplayRatingDetails,
  OrderAgentInfoSection,
  OrderBillSection,
  OrderCartSection,
  OrderHeaderSection,
  OrderMainSection,
  OTPSection,
  UpdateOrderStatusSection,
} from "./shared/orderCard/helpers";
import { NewBadge } from "./shared/utilityComponents";
import { useUserStore } from "@/store/useUserStore";
import { LiveTrackingMap } from "./shared/orderCard/LiveTrackingMap";
import L from "leaflet";
import scooter_img from "@/assets/scooter.png";
import home_img from "@/assets/home.png";
import shop_img from "@/assets/shop.png";
import { getDistance } from "@/lib/utils";
import { OTP_RADIUS_KM } from "@/lib/constants";
import { GeoCoordsType } from "@/types/deliveryAgentType";

const customerCancelationReasons = [
  "Ordered by mistake",
  "Found a better price elsewhere",
  "Item won’t arrive on time",
  "Need to change shipping address",
  "Need to change payment method",
  "Item is no longer needed",
  "Expected a different product",
  "Too expensive",
  "Placing a new order with changes",
  "Other (please specify)",
];

const ownerCancellationReasons = [
  "Item(s) not available",
  "Restaurant is too busy to fulfill the order",
  "Incorrect order received",
  "Technical issue with order system",
  "Order placed after closing hours",
  "Unable to contact customer",
  "Delivery not possible to the selected address",
  "Suspected fraudulent order",
  "Customer requested cancellation",
  "Ingredients out of stock",
  "Unexpected power outage or kitchen issue",
  "Staff shortage",
  "Duplicate order detected",
];

const deliveryAgentIcon = new L.Icon({
  iconUrl: scooter_img,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const customerIcon = new L.Icon({
  iconUrl: home_img,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const restaurantIcon = new L.Icon({
  iconUrl: shop_img,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

type ActiveCardProps = {
  order: OrderType;
  isOpen: boolean;
  onToggle: () => void;
  isNew?: boolean;
};

const needsOtpVerification = (status: OrderStatus) => {
  return status === "OutForDelivery" || status === "Delivered";
};

const ActiveOrderCard = ({
  order,
  isOpen,
  onToggle,
  isNew = false,
}: ActiveCardProps) => {
  const { user } = useUserStore();

  const { deletePendingOrder, updateOrderStatus, loading, generateOrderOtp } =
    useOrderStore();

  const [openOrderCancelDialog, setOpenOrderCancelDialog] =
    useState<boolean>(false);
  const [openOrderRatingDialog, setOpenOrderRatingDialog] =
    useState<boolean>(false);
  const [openDeleteOrderConfirmBox, setOpenDeleteOrderConfirmBox] =
    useState(false);

  const [openOtpDialog, setOpenOtpDialog] = useState(false);

  function confirmDeleteOrderHandler() {
    deletePendingOrder(order._id);
    setOpenDeleteOrderConfirmBox(false);
  }

  // restaurant owner
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(
    null,
  );
  const [openStatusConfirmBox, setOpenStatusConfirmBox] = useState(false);

  function handleStatusChange(selectedStatus: OrderStatus) {
    if (needsOtpVerification(selectedStatus)) {
      setOpenOtpDialog(true);
    } else {
      setOpenStatusConfirmBox(true);
    }
    setSelectedStatus(selectedStatus);
  }

  function confirmStatusChangeHandler() {
    if (selectedStatus) {
      updateOrderStatus(order._id, selectedStatus);
      setOpenStatusConfirmBox(false);
    }
  }

  async function handleSendOtp() {
    if (selectedStatus) {
      return await generateOrderOtp(order._id, selectedStatus);
    }
    return false;
  }

  async function handleVerifyOtp(otp: string) {
    if (selectedStatus) {
      return await updateOrderStatus(order._id, selectedStatus, otp);
    }
    return false;
  }

  // Live tracking

  function canSendOtp(
    agentLocation: GeoCoordsType,
    targetLocation: GeoCoordsType,
    status: OrderStatus,
  ): boolean {
    const distanceKm = getDistance(agentLocation, targetLocation);

    if (distanceKm === null) return false;

    if (status === "AcceptedByAgent" || status === "OutForDelivery") {
      return distanceKm <= OTP_RADIUS_KM;
    }
    return false;
  }

  function getDestinationByStatus(order: OrderType) {
    if (order.currentStatus === "AcceptedByAgent") {
      return {
        lat: order.deliveryDetails.pickup.latitude,
        lng: order.deliveryDetails.pickup.longitude,
        icon: restaurantIcon,
        label: "Restaurant",
      };
    }

    if (order.currentStatus === "OutForDelivery") {
      return {
        lat: order.deliveryDetails.drop.latitude,
        lng: order.deliveryDetails.drop.longitude,
        icon: customerIcon,
        label: "Customer",
      };
    }

    return null;
  }

  const destinationData = useMemo(
    () => getDestinationByStatus(order),
    [order.currentStatus],
  );

  const agentData = {
    lat: order.deliveryAgent?.lastLocation?.latitude!,
    lng: order.deliveryAgent?.lastLocation?.longitude!,
    label: "Delivery Agent",
    icon: deliveryAgentIcon,
  };

  const isAgentReached =
    destinationData &&
    canSendOtp(
      { latitude: agentData.lat, longitude: agentData.lng },
      { latitude: destinationData.lat, longitude: destinationData.lng },
      order.currentStatus,
    );

  if (!user) return;


  return (
    <div className="relative bg-white mb-6 dark:bg-input rounded-xl lg:mx-auto max-w-250 shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200">
      {isNew && <NewBadge classes="top-[-14px] right-20 "></NewBadge>}
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

      {!isOpen && (
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
      )}

      {isOpen && (
        <>
          <OrderCartSection cartItems={order.cartItems}></OrderCartSection>

          <OrderBillSection bill={order.bill}></OrderBillSection>

          {order.deliveryAgent && (
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

          {user?.role === "Customer" && order.currentStatus === "Pending" && (
            <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600 gap-5 flex flex-col md:flex-row justify-end">
              <Button
                onClick={() => setOpenDeleteOrderConfirmBox(true)}
                variant="outline"
                className="md:max-w-40 w-full"
              >
                Delete Order
              </Button>
              <Link
                className="md:max-w-50 w-full"
                to={`/customer/order/shipping?orderId=${order._id}&retry=true`}
              >
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Continue Payment
                </Button>
              </Link>
            </div>
          )}
          <div className="mt-4 gap-5 flex flex-col md:flex-row justify-between items-end">
            {["Placed", "Confirmed", "Preparing"].includes(
              order.currentStatus,
            ) &&
              user.role === "Restaurant_Owner" && (
                <UpdateOrderStatusSection
                  currentStatus={order.currentStatus}
                  onClickHandler={handleStatusChange}
                ></UpdateOrderStatusSection>
              )}

            {user.role === "Delivery_Agent" && (
              <>
                {isAgentReached ? (
                  <UpdateOrderStatusSection
                    currentStatus={order.currentStatus}
                    onClickHandler={handleStatusChange}
                  />
                ) : (
                  <p className="w-full text-sm text-orange-600 dark:text-orange-400 mt-2">
                    📍 Reach the{" "}
                    {order.currentStatus === "AcceptedByAgent"
                      ? "restaurant"
                      : "customer"}{" "}
                    location to update the order status.
                  </p>
                )}
              </>
            )}

            {order.currentStatus === "Placed" &&
              ["Restaurant_Owner", "Customer"].includes(user?.role) && (
                <Button
                  onClick={() => setOpenOrderCancelDialog(true)}
                  variant="destructive"
                  className="w-full md:max-w-40"
                >
                  Cancel Order
                </Button>
              )}
          </div>

          {order.currentStatus === "Delivered" &&
            (!order.ratingDetails ? (
              user.role === "Customer" && (
                <div className="mt-4 py-4 flex justify-end">
                  <Button
                    onClick={() => setOpenOrderRatingDialog(true)}
                    className="my-gradient-btn w-full md:max-w-40"
                  >
                    Rate your order
                  </Button>
                </div>
              )
            ) : (
              <DisplayRatingDetails
                ratingDetails={order.ratingDetails}
              ></DisplayRatingDetails>
            ))}

          {user?.role === "Restaurant_Owner" &&
            order.currentStatus === "AcceptedByAgent" &&
            order.deliveryDetails.parcelAcceptedOtp && (
              <OTPSection
                title="Pickup OTP"
                parcelOtp={order.deliveryDetails.parcelAcceptedOtp}
              />
            )}
          {user?.role === "Customer" &&
            order.currentStatus === "OutForDelivery" &&
            order.deliveryDetails.parcelDeliveredOtp && (
              <OTPSection
                title="Delivery OTP"
                parcelOtp={order.deliveryDetails.parcelDeliveredOtp}
              />
            )}

          {/* PAYMENT INFO */}
          {order.paymentId && user?.role === "Admin" && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-5 pt-2 border-t border-gray-300 dark:border-gray-600">
              <p>Payment ID: {order.paymentId}</p>
              {order.razorpayOrderId && (
                <p>Razorpay Order ID: {order.razorpayOrderId}</p>
              )}
            </div>
          )}
          {agentData.lat &&
            agentData.lng &&
            destinationData?.lat &&
            destinationData.lng && (
              <LiveTrackingMap
                agentData={agentData}
                destinationData={destinationData}
              ></LiveTrackingMap>
            )}
        </>
      )}

      {/* Dialogs */}

      {order.deliveryAgent && user.role === "Customer" && (
        <OrderRatingDialog
          open={openOrderRatingDialog}
          onOpenChange={() => setOpenOrderRatingDialog(false)}
          orderId={order._id}
          restaurant={{
            id: order.restaurant._id!,
            name: order.restaurant.restaurantName!,
          }}
          deliveryAgent={{
            id: order.deliveryAgent.user?._id
              ? order?.deliveryAgent.user?._id
              : "",
            name: order.deliveryAgent.user?.fullName
              ? order.deliveryAgent.user.fullName
              : "delivery agent",
          }}
          dishes={order.cartItems.map((item) => ({
            id: item.dishId,
            name: item.name,
          }))}
        />
      )}

      <CancelOrderDialog
        cancelationReasons={
          user.role === "Customer"
            ? customerCancelationReasons
            : ownerCancellationReasons
        }
        orderId={order._id}
        open={openOrderCancelDialog}
        onOpenChange={() => setOpenOrderCancelDialog(false)}
      />

      <ConfirmBox
        open={openStatusConfirmBox}
        onOpenChange={setOpenStatusConfirmBox}
        title="Change Order Status"
        message={`Are you sure you want to update the order status to "${selectedStatus}"?`}
        onConfirm={confirmStatusChangeHandler}
      />

      <ConfirmBox
        open={openDeleteOrderConfirmBox}
        onOpenChange={setOpenDeleteOrderConfirmBox}
        title="Delete Pending Order"
        message={`Are you sure you want to permanently delete this order?`}
        onConfirm={confirmDeleteOrderHandler}
      />

      {user.role === "Delivery_Agent" &&
        selectedStatus &&
        isAgentReached &&
        needsOtpVerification(selectedStatus) && (
          <TwoStepOtpDialog
            open={openOtpDialog}
            onOpenChange={setOpenOtpDialog}
            onSendOtp={handleSendOtp}
            onVerifyOtp={handleVerifyOtp}
            generateOtpLoading={loading.generateOrderOtpBtn}
            verifyOtpLoading={loading.updateOrderStatusBtn}
            statusType={selectedStatus as "OutForDelivery" | "Delivered"}
          />
        )}
    </div>
  );
};

export default ActiveOrderCard;
