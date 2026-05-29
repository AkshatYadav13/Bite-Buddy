import React, { ChangeEvent, useEffect, useState } from "react";
import {
  Truck,
  CheckCircle,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  Package,
  Loader2,
  Clock,
  User,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useCartStore } from "@/store/useCartStore";
import { OrderDetails, OrderType } from "@/types/orderTypes";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Link, useSearchParams } from "react-router-dom";
import {
  EmptyState,
  InvalidAccess,
  Loading,
} from "../components/shared/utilityComponents";
import AddressSelector from "../components/shared/AddressSelector";
import { ILocation, IUserAddress } from "@/types/userType";
import { Button } from "../components/ui/button";
import AcceptAddress from "@/components/shared/AcceptAddress";

const steps: StepConfig[] = [
  {
    id: 1,
    title: "Contact Details",
    subtitle: "Enter your name and contact information",
    icon: <User className="w-6 h-6" />,
  },
  {
    id: 2,
    title: "Shipping Details",
    subtitle: "Enter your delivery information",
    icon: <Truck className="w-6 h-6" />,
  },
  {
    id: 3,
    title: "Confirm Order",
    subtitle: "Review your order details",
    icon: <CheckCircle className="w-6 h-6" />,
  },
  {
    id: 4,
    title: "Payment",
    subtitle: "Complete your purchase",
    icon: <CreditCard className="w-6 h-6" />,
  },
];

interface StepConfig {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

interface ShippingDetails {
  fullName: string;
  email: string;
  contact: string;
  location: ILocation | null;
}

const ShippingSteps: React.FC = () => {
  const { loading, placeOrder, createCheckOutSession, activeOrders } =
    useOrderStore();

  const [searchParams] = useSearchParams();
  const retry = searchParams.get("retry") === "true";

  const [currentStep, setCurrentStep] = useState(retry ? 4 : 1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const { user } = useUserStore();
  const { cartRestaurantId, cart } = useCartStore();
  const [placedOrder, setPlacedOrder] = useState<OrderType | null>(null);

  const defaultAddress = user?.addresses.find((addr) => addr.isDefault);

  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    fullName: user?.fullName || "",
    email: user?.email || "",
    contact: user?.contact || "",

    location: defaultAddress
      ? {
          address: defaultAddress.address,
          latitude: defaultAddress.latitude,
          longitude: defaultAddress.longitude,
        }
      : null,
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCompletedSteps((prev) => [...prev, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setCompletedSteps((prev) =>
        prev.filter((step) => step !== currentStep - 1),
      );
    }
  };

  const handleStepClick = (stepId: number) => {
    if (retry && stepId === 1) return;
    if (stepId <= currentStep || completedSteps.includes(stepId)) {
      setCurrentStep(stepId);
    }
  };

  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);
  const isStepActive = (stepId: number) => currentStep === stepId;
  const isStepAccessible = (stepId: number) =>
    stepId <= currentStep || completedSteps.includes(stepId);

  const getStepStatus = (stepId: number) => {
    if (isStepCompleted(stepId)) return "completed";
    if (isStepActive(stepId)) return "active";
    if (isStepAccessible(stepId)) return "accessible";
    return "disabled";
  };

  // step 1
  function inputChangeHandler(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setShippingDetails((prev) => ({ ...prev, [name]: value }));
  }

  function handleAddressSelect(loc: IUserAddress) {
    setShippingDetails({
      ...shippingDetails,
      location: {
        address: loc.address,
        latitude: loc.latitude,
        longitude: loc.longitude,
      },
    });
  }

  async function placeOrderHandler() {
    if (!cart.length || !shippingDetails.location) return;

    const orderDetails: OrderDetails = {
      cart: cart.map((item) => ({
        dishId: item.dishId!,
        name: item.name,
        imageUrl: item.imageUrl,
        sellingPrice: item.sellingPrice,
        costPrice: item.costPrice,
        quantity: item.quantity,
      })),
      deliveryDetails: {
        drop: {
          ...shippingDetails.location!,
        },
      },
      restaurantId: cartRestaurantId!,
    };
    const { order } = await placeOrder(orderDetails);

    if (order) {
      setPlacedOrder(order);
      handleNext();
    }
  }

  // Step 3
  const orderId = searchParams.get("orderId");
  const [showEmptyState, setShowEmptyState] = useState<boolean>(false);

  useEffect(() => {
    function setPlacedOrderOnRetry() {
      if (!orderId) return;
      const order = activeOrders.find(
        (order) => order._id === orderId && order.currentStatus === "Pending",
      );
      if (order) {
        setPlacedOrder(order);
      } else {
        setShowEmptyState(true);
      }
    }

    setPlacedOrderOnRetry();
  }, [orderId]);

  if (!cartRestaurantId || !cart.length) {
    return (
      <InvalidAccess
        title="Access Denied"
        message="This page is only accessible during the checkout process. Please initiate an order to proceed."
        redirectLabel="Start Order"
        redirectPath="/"
      ></InvalidAccess>
    );
  }

  if (showEmptyState) {
    return (
      <div className="h-screen flex">
        <EmptyState
          title="Payment Time Expired"
          message="This order is no longer available for payment. Please place a new order and delete this order"
          icon={<Clock size={48} className="text-red-500" />}
          actionLabel="Delete this Order"
          actionLink="/customer/order/status"
        />
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 pb-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="">
                    <Label>Fullname</Label>
                    <Input
                      type="text"
                      name="fullName"
                      value={shippingDetails.fullName}
                      onChange={inputChangeHandler}
                      disabled
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      name="email"
                      value={shippingDetails.email}
                      onChange={inputChangeHandler}
                      disabled
                    />
                  </div>
                  <div className="">
                    <Label>Contact</Label>
                    <Input
                      type="tel"
                      name="contact"
                      placeholder="1234567890"
                      pattern="[0-9]{10}"
                      value={shippingDetails.contact}
                      onChange={inputChangeHandler}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 pb-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col gap-6">
                {user && user?.addresses.length === 0 ? (
                  <>
                    <div className="flex flex-col items-center gap-2 text-center">
                      <h3 className="text-lg font-semibold">
                        No delivery address found
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Add a delivery address to continue with your checkout.
                      </p>
                    </div>

                    <Button
                      asChild
                      className="my-gradient-btn max-w-52 mx-auto"
                    >
                      <Link to="/profile">Add Delivery Address</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    {/* -------- Saved Addresses -------- */}
                    <div className="space-y-4">
                      <h3 className="text-base font-semibold">
                        Select a saved address
                      </h3>

                      <AddressSelector
                        addresses={user?.addresses || []}
                        onSelectAddress={handleAddressSelect}
                      />
                    </div>

                    {/* -------- OR Divider -------- */}
                    <div className="relative flex items-center my-2">
                      <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
                      <span className="mx-4 text-xs uppercase tracking-wider text-muted-foreground bg-white dark:bg-gray-900 px-2">
                        or
                      </span>
                      <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
                    </div>

                    {/* -------- Manual Address -------- */}
                    <div className="space-y-4">
                      <h3 className="text-base font-semibold">
                        Enter a new delivery address
                      </h3>

                      <AcceptAddress
                        address={shippingDetails.location?.address || ""}
                        latitude={shippingDetails.location?.latitude || 0}
                        longitude={shippingDetails.location?.longitude || 0}
                        onChange={({ address, latitude, longitude }) => {
                          setShippingDetails((p) => ({
                            ...p,
                            location: {
                              address,
                              latitude,
                              longitude,
                            },
                          }));
                        }}
                      />
                    </div>

                    {/* -------- Action -------- */}
                    {shippingDetails.location ? (
                      <div className="flex justify-center pt-4">
                        {loading.placeOrderBtn ? (
                          <button
                            disabled
                            className="w-full sm:max-w-56 flex items-center justify-center gap-2 px-8 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg"
                          >
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Please wait
                          </button>
                        ) : (
                          <button
                            onClick={placeOrderHandler}
                            className="w-full sm:max-w-56 px-8 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            Place Order
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="pl-2 text-sm text-muted-foreground">
                        Please select or enter a delivery address to continue.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="bg-white space-y-8  dark:bg-gray-900 rounded-2xl p-8 pb-4 shadow-sm border border-gray-100 dark:border-gray-700">
            {/* User Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                User Details
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Name:
                    </span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {shippingDetails.fullName}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Email:
                    </span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {shippingDetails.email}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Phone:
                    </span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {shippingDetails.contact}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Shipping Details
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Restaurant Name:
                    </span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {placedOrder?.restaurant?.restaurantName}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Source:
                    </span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {placedOrder?.deliveryDetails.pickup.address}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Destination:
                    </span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {placedOrder?.deliveryDetails.drop.address}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Distance:
                    </span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {placedOrder?.deliveryDetails.distanceKm} km
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Estimated Time:
                    </span>
                    <p className="text-gray-600 dark:text-gray-400">
                      {placedOrder?.deliveryDetails.estimatedTimeMin} minutes
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Cart Items
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                      <th className="pb-3 font-semibold text-gray-700 dark:text-gray-300">
                        Image
                      </th>
                      <th className="pb-3 font-semibold text-gray-700 dark:text-gray-300">
                        Product Name
                      </th>
                      <th className="pb-3 font-semibold text-gray-700 dark:text-gray-300">
                        Price
                      </th>
                      <th className="pb-3 font-semibold text-gray-700 dark:text-gray-300">
                        Quantity
                      </th>
                      <th className="pb-3 font-semibold text-gray-700 dark:text-gray-300">
                        Total Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {placedOrder?.cartItems.map((item) => (
                      <tr
                        key={item._id}
                        className="border-b border-gray-100 dark:border-gray-800"
                      >
                        <td className="py-4">
                          <img
                            src={item.imageUrl}
                            className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center text-2xl"
                          />
                        </td>
                        <td className="py-4 font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </td>
                        <td className="py-4 text-gray-600 dark:text-gray-400">
                          ₹{item.sellingPrice}/-
                        </td>
                        <td className="py-4 text-gray-600 dark:text-gray-400">
                          {item.quantity}
                        </td>
                        <td className="py-4 font-semibold text-gray-900 dark:text-white">
                          ₹{item.sellingPrice * item.quantity}/-
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 space-y-3">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal:</span>
                  <span>₹{placedOrder?.bill.cartTotal}/-</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping Fee:</span>
                  <span>₹{placedOrder?.bill.shippingFee}/-</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>App Fee:</span>
                  <span>₹{placedOrder?.bill.appFee}/-</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>GST (18%):</span>
                  <span>₹{placedOrder?.bill.gstAmount}/-</span>
                </div>
                <div className="border-t dark:border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                    <span>Total:</span>
                    <span>₹{placedOrder?.bill.grandTotal}/-</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
              “Cancellation is not allowed once the order is confirmed by the
              restaurant.”{" "}
            </p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            {loading.pageLoad ? (
              <Loading message="Processing Request.." />
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 pb-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-emerald-600" />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 dark:text-gray-300">
                      Ready to Complete Your Order
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Total Amount: ₹{placedOrder?.bill?.grandTotal}/-
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                    <button
                      disabled={loading.pageLoad}
                      onClick={handlePrevious}
                      className={`flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200  `}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Go Back
                    </button>

                    {loading.pageLoad ? (
                      <button
                        disabled
                        className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"></Loader2>
                        <span>Please wait</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => createCheckOutSession(placedOrder?._id!)}
                        className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Pay ₹{placedOrder?.bill?.grandTotal}/-
                        <CreditCard className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mt-4">
                    <p>
                      🔒 Secure payment powered by industry-standard encryption
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50 dark:bg-input/110">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-10">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* Step Indicators */}
            <div className="relative flex justify-between">
              {steps.map((step) => {
                const status = getStepStatus(step.id);
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <button
                      onClick={() => handleStepClick(step.id)}
                      disabled={
                        status === "disabled" || (retry && step.id === 1)
                      }
                      className={`
                        relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110
                        ${
                          status === "completed"
                            ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg"
                            : status === "active"
                              ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg ring-4 ring-blue-200"
                              : status === "accessible"
                                ? "bg-white border-2 border-gray-300 text-gray-500 hover:border-gray-400"
                                : "bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed"
                        }
                      `}
                    >
                      {status === "completed" ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        step.icon
                      )}
                    </button>

                    <div className="mt-3 text-center max-w-32">
                      <div
                        className={`
                        text-sm font-semibold transition-colors duration-200
                        ${
                          status === "active" || status === "completed"
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-500 dark:text-gray-600"
                        }
                      `}
                      >
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 hidden sm:block">
                        {step.subtitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        {
          <div className="flex justify-between items-center mb-10">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1 || currentStep === 3 || (retry && currentStep === 2)}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200
                ${
                  currentStep === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow"
                }
              `}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {currentStep !== 2 && currentStep < steps.length && (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white  hover:from-blue-600 hover:to-purple-700  shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        }

        {/* Step Content */}
        <div className="mb-8">{renderStepContent()}</div>

        {/* Step Counter */}
        <div className="text-center mt-8">
          <span className="text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ShippingSteps;
