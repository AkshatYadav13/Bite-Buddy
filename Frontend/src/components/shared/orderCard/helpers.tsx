import {
  convertToIndianTime,
  getOrderNextStatus,
  toIndianDateFormat,
} from "@/lib/utils";
import {
  Bill,
  OrderStatus,
  OrderType,
  ParcelOtp,
  RatingDetails,
} from "@/types/orderTypes";
import {
  MapPin,
  User,
  Star,
  AlertCircle,
  Mail,
  Truck,
  Clock,
  EyeOff,
  Eye,
  RefreshCw,
  Bike,
  Timer,
  Package,
  IndianRupee,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { StatusBadge } from "../utilityComponents";
import { UserRoleType } from "@/types/userType";
import { CartItem } from "@/types/cartType";
import { DeliveryAgentType } from "@/types/deliveryAgentType";
import OrderStatusBar from "./OrderStatusBar";
import { Label } from "recharts";
import { useUserStore } from "@/store/useUserStore";

// ORDER CARD DETAILS
export const OrderHeaderSection = ({ order }: { order: OrderType }) => {
  const [openStatusBarDialog, setOpenStatusBarDialog] =
    useState<boolean>(false);
  return (
    <>
      <div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          Order #{order?._id.slice(-6).toUpperCase()}
        </h3>
        {order.createdAt && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {toIndianDateFormat(order.createdAt.toString())}
          </p>
        )}
      </div>
      <div
        className="cursor-pointer rounded-full transition-all duration-200 transform hover:scale-105"
        onClick={() => setOpenStatusBarDialog(true)}
      >
        <StatusBadge status={order.currentStatus} />
      </div>
      <OrderStatusBar
        open={openStatusBarDialog}
        onOpenChange={setOpenStatusBarDialog}
        currentStatus={order.currentStatus}
        statusHistory={order.statusDetails}
      />
    </>
  );
};

export const OrderMainSection = ({ order }: { order: OrderType }) => {
  return (
    <div className="mb-4">
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="bg-green-50 dark:bg-green-950/50 rounded-lg p-4 pb-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <User className="text-white" size={16} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                {order?.user?.fullName}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {order.user.contact}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {order.user.email}
            </span>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4 pb-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Package className="text-white" size={16} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                {order.restaurant?.restaurantName}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {order.restaurant.contact}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-green-500"></Clock>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {convertToIndianTime(order.restaurant.openingTime!)} -{" "}
              {convertToIndianTime(order.restaurant.closingTime!)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-purple-50 dark:bg-purple-950/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="text-purple-500" size={16} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Distance
            </span>
          </div>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-300">
            {order.deliveryDetails.distanceKm} km
          </p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-950/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Timer className="text-indigo-500" size={16} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Est. Time
            </span>
          </div>
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-300">
            {order.deliveryDetails.estimatedTimeMin} mins
          </p>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Delivery Details
        </h4>
        <div className="space-y-2 text-xs sm:text-base">
          <div className="flex justify-between gap-3">
            <span className="text-gray-600 dark:text-gray-400">From:</span>
            <span className="text-gray-800 dark:text-gray-100 text-right">
              {order.deliveryDetails.pickup.address}
            </span>
          </div>
          <div className="flex justify-between gap-7">
            <span className="text-gray-600 dark:text-gray-400">To:</span>
            <span className="text-gray-800 dark:text-gray-100 text-right">
              {order.deliveryDetails.drop.address}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const OrderCartSection = ({ cartItems }: { cartItems: CartItem[] }) => {
  return (
    <div className="mb-4">
      <h5 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">
        Order Items
        <span className="text-sm text-green-600 dark:text-green-400">
          {" "}
          ({cartItems.length})
        </span>
      </h5>
      <div className="space-y-2 max-h-70 overflow-y-scroll text-sm sm:text-base  my-scrollbar">
        {cartItems.map((item) => (
          <div
            key={item?.dishId}
            className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg pr-5"
          >
            <img
              src={item?.imageUrl}
              alt={item?.name}
              className="w-12 h-12 sm:w-30 sm:h-18 rounded-lg object-cover"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {item?.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Qty: {item?.quantity}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-800 dark:text-gray-100">
                ₹{item?.sellingPrice * item?.quantity}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const OrderBillSection = ({ bill }: { bill: Bill }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
      <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
        <IndianRupee size={16} />
        Bill Summary
      </h4>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Cart Total:</span>
          <span className="font-medium text-gray-800 dark:text-gray-100">
            ₹{bill.cartTotal}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">
            Shipping Fee:
          </span>
          <span className="font-medium text-gray-800 dark:text-gray-100">
            ₹{bill.shippingFee}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">
            App Fee:
          </span>
          <span className="font-medium text-gray-800 dark:text-gray-100">
            ₹{bill.appFee}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">GST:</span>
          <span className="font-medium text-gray-800 dark:text-gray-100">
            ₹{bill.gstAmount}
          </span>
        </div>
        <hr className="my-2 border-gray-300 dark:border-gray-600" />
        <div className="flex justify-between text-lg font-bold">
          <span className="text-gray-800 dark:text-gray-100">Grand Total:</span>
          <span className="text-green-600 dark:text-green-400">
            ₹{bill.grandTotal}
          </span>
        </div>
      </div>
    </div>
  );
};

export const OrderAgentInfoSection = ({
  deliveryAgent,
}: {
  deliveryAgent: Partial<DeliveryAgentType>;
}) => {
  return (
    <>
      {deliveryAgent && (
        <div className="bg-blue-50 mb-7 dark:bg-blue-950/50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Bike className="w-4 h-4" />
            Delivery Agent
          </h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {deliveryAgent?.user?.fullName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {deliveryAgent.vehicleType} • {deliveryAgent.vehicleNumber}
              </p>
            </div>
            {deliveryAgent.ratingCount! > 0 && (
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {deliveryAgent.avgRating}/5
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ({deliveryAgent.ratingCount})
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export const CancellationDetailsBox = ({
  userType,
  reason,
}: {
  userType: UserRoleType;
  reason: string;
}) => {
  return (
    <div className="bg-red-50 rounded-lg p-4 mb-4 dark:bg-input/90">
      <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2 dark:text-red-500">
        <AlertCircle className="w-4 h-4" />
        Cancellation Details
      </h4>
      <p className="text-sm text-red-700 dark:text-red-500">
        Canceled by {userType}: {reason}
      </p>
    </div>
  );
};

type OTPSectionProps = {
  title: string;
  parcelOtp: ParcelOtp;
};

export const OTPSection = ({ title, parcelOtp }: OTPSectionProps) => {
  const otp = parcelOtp?.code;
  const expiresAt = parcelOtp?.expiresAt;

  const [showOtp, setShowOtp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff > 0) {
        setTimeLeft(Math.floor(diff / 1000));
        setIsExpired(false);
      } else {
        setTimeLeft(0);
        setIsExpired(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
  const displayOtp = showOtp ? otp : "●".repeat(otp?.length);

  return (
    <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {title}
        </h4>
        {!isExpired && otp && (
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <Clock className="w-3 h-3" />
            Expires in {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {isExpired ? (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-3 dark:bg-red-900/20 dark:border-red-800">
            <p className="text-red-700 text-sm font-medium dark:text-red-300">
              ⚠️ Previous OTP has expired
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-4 bg-white rounded-md p-3 border dark:bg-gray-800 dark:border-gray-600">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              OTP:
            </span>
            <div className="flex  justify-between w-full sm:w-32">
              <span className="font-mono text-lg font-bold text-gray-900 dark:text-white tracking-wider">
                {displayOtp}
              </span>
              <button
                onClick={() => setShowOtp(!showOtp)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showOtp ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {title === "Pickup OTP"
              ? "Share this OTP with the delivery agent during order pickup"
              : "Provide this OTP to the delivery agent upon order delivery"}
          </p>
        </div>
      )}
    </div>
  );
};

type DisplayRatingProps = {
  ratingDetails: RatingDetails;
};

export const DisplayRatingDetails = ({ ratingDetails }: DisplayRatingProps) => {
  function getModifiedTitle(title: string) {
    switch (title) {
      case "restaurant":
        return {
          label: "Restaurant",
          icon: <Store className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        };
      case "deliveryAgent":
        return {
          label: "Delivery Agent",
          icon: (
            <Truck className="w-4 h-4 text-green-600 dark:text-green-400" />
          ),
        };
      case "food":
        return {
          label: "Food Quality",
          icon: (
            <UtensilsCrossed className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          ),
        };
      default:
        return { label: "Unknown", icon: "" };
    }
  }
  const { _id, ...filteredDetails } = ratingDetails;

  const { user } = useUserStore();

  return (
    <div>
      <div className="bg-blue-50 my-5 dark:bg-blue-950/50 rounded-lg p-4 border border-blue-100 dark:border-blue-900">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <Star className="w-3 h-3 text-white fill-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {user?.role === "Customer" ? "Customer Ratings" : "Your Ratings"}
          </h3>
        </div>

        <div className="space-y-2 mt-5">
          {Object.entries(filteredDetails).map((data) => {
            const { icon, label } = getModifiedTitle(data[0]);
            const rating = data[1];
            return (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {icon}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{rating}/5</span>
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

type UpdateOrderStatusProps = {
  currentStatus: OrderStatus;
  onClickHandler: (newStatus: OrderStatus) => void;
};

export const UpdateOrderStatusSection = ({
  currentStatus,
  onClickHandler,
}: UpdateOrderStatusProps) => {
  return (
    <div className="w-full md:w-100">
      <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Update Order Status
      </Label>
      {(() => {
        const next = getOrderNextStatus(currentStatus) as OrderStatus;
        return next ? (
          <Button
            onClick={() => onClickHandler(next)}
            className="mt-2 w-full my-gradient-btn"
          >
            Mark as {next}
          </Button>
        ) : (
          <p className="text-sm text-gray-500 mt-2">No further actions.</p>
        );
      })()}
    </div>
  );
};

import { Loader2 } from "lucide-react";
import React, { useRef, useCallback, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import {
  DialogContent,
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TwoStepOtpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendOtp: () => Promise<boolean>;
  onVerifyOtp: (otp: string) => Promise<boolean>;
  generateOtpLoading: boolean;
  verifyOtpLoading: boolean;
  statusType: "OutForDelivery" | "Delivered";
};

export const TwoStepOtpDialog = ({
  open,
  onOpenChange,
  onSendOtp,
  onVerifyOtp,
  generateOtpLoading,
  verifyOtpLoading,
  statusType,
}: TwoStepOtpDialogProps) => {
  const OTP_LENGTH = 6;
  const [step, setStep] = useState<number>(1);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState<string>("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>(
    Array(OTP_LENGTH).fill(null),
  );
  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setStep(1);
      setOtp(Array(OTP_LENGTH).fill(""));
      setError("");
    }
  }, [open, OTP_LENGTH]);

  // Focus first input when moving to step 2
  useEffect(() => {
    if (step === 2 && open) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step, open]);

  const handleSendOtp = async () => {
    const success = await onSendOtp();
    if (success) {
      setStep(2);
    }
  };

  const getRecipient = () => {
    return statusType === "OutForDelivery" ? "Restaurant" : "Customer";
  };

  const getTitle = () => {
    return statusType === "OutForDelivery"
      ? "Confirm Parcel Acceptance"
      : "Confirm Delivery";
  };

  // OTP Input Handlers (from your existing InputOtpDialog)
  const validateInput = useCallback((value: string): boolean => {
    return /^[0-9]$/.test(value) || value === "";
  }, []);

  const inputChangeHandler = useCallback(
    (value: string, idx: number) => {
      setError("");
      const sanitizedValue = value.slice(-1);

      if (!validateInput(sanitizedValue)) {
        return;
      }

      const newOtp = [...otp];
      newOtp[idx] = sanitizedValue;
      setOtp(newOtp);

      if (sanitizedValue && idx < OTP_LENGTH - 1) {
        inputRefs.current[idx + 1]?.focus();
      }
    },
    [otp, validateInput, OTP_LENGTH],
  );

  const keyDownHandler = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
      if (e.key === "Backspace") {
        if (!otp[idx] && idx > 0) {
          inputRefs.current[idx - 1]?.focus();
          const newOtp = [...otp];
          newOtp[idx - 1] = "";
          setOtp(newOtp);
        }
        setError("");
      }

      if (e.key === "ArrowLeft" && idx > 0) {
        e.preventDefault();
        inputRefs.current[idx - 1]?.focus();
      }

      if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) {
        e.preventDefault();
        inputRefs.current[idx + 1]?.focus();
      }

      if (e.key === "Delete") {
        const newOtp = [...otp];
        newOtp[idx] = "";
        setOtp(newOtp);
        setError("");
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const otpValue = otp.join("");
        if (otpValue.length === OTP_LENGTH) {
          submitHandler();
        }
      }
    },
    [otp, OTP_LENGTH],
  );

  const otpPasteHandler = useCallback(
    async (e: React.ClipboardEvent) => {
      e.preventDefault();
      setError("");

      try {
        const textPasted = await navigator.clipboard.readText();
        const numbersOnly = textPasted.replace(/\D/g, "");

        if (numbersOnly.length === OTP_LENGTH) {
          const newOtp = numbersOnly.split("");
          setOtp(newOtp);
          inputRefs.current[OTP_LENGTH - 1]?.focus();
        } else if (numbersOnly.length > 0) {
          const newOtp = [...otp];
          const pasteLength = Math.min(numbersOnly.length, OTP_LENGTH);

          for (let i = 0; i < pasteLength; i++) {
            newOtp[i] = numbersOnly[i];
          }
          setOtp(newOtp);

          const nextEmptyIndex = newOtp.findIndex((digit) => digit === "");
          const focusIndex =
            nextEmptyIndex !== -1 ? nextEmptyIndex : OTP_LENGTH - 1;
          inputRefs.current[focusIndex]?.focus();
        }
      } catch (err) {
        console.warn("Failed to read clipboard:", err);
      }
    },
    [otp, OTP_LENGTH],
  );

  const submitHandler = useCallback(async () => {
    setError("");

    const verificationToken = otp.join("");

    if (verificationToken.length !== OTP_LENGTH) {
      setError(`Please enter all ${OTP_LENGTH} digits`);
      return;
    }

    if (!/^\d+$/.test(verificationToken)) {
      setError("OTP must contain only numbers");
      return;
    }

    const isSuccess = await onVerifyOtp(verificationToken);
    if (isSuccess) {
      onOpenChange(false);
      setStep(1);
      setOtp(Array(OTP_LENGTH).fill(""));
    }
  }, [otp, onVerifyOtp, OTP_LENGTH, onOpenChange]);

  const handleInputFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.select();
    },
    [],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        aria-describedby={error ? "otp-error" : undefined}
      >
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2 pb-4">
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                  step === 1
                    ? "bg-blue-600 text-white"
                    : "bg-green-600 text-white"
                }`}
              >
                1
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  step === 1
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Send OTP
              </span>
            </div>

            <div
              className={`w-12 h-0.5 mx-2 ${
                step === 2 ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
              }`}
            />

            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                  step === 2
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                }`}
              >
                2
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  step === 2
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Verify OTP
              </span>
            </div>
          </div>

          <DialogDescription>
            {step === 1
              ? statusType === "OutForDelivery"
                ? "Send OTP to the Restaurant to verify parcel acceptance."
                : "Send OTP to the Customer to verify successful delivery."
              : statusType === "OutForDelivery"
                ? "Enter the 6-digit code from the Restaurant to confirm that you've accepted the parcel."
                : "Enter the 6-digit code from the Customer to confirm the successful delivery of the parcel."}
          </DialogDescription>
        </DialogHeader>

        <div>
          {/* Step 1: Send OTP */}
          {step === 1 && (
            <div className="space-y-4 py-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                A 6-digit verification code will be sent to the {getRecipient()}
                .
              </div>

              <div className="text-center">
                <Button
                  onClick={handleSendOtp}
                  disabled={generateOtpLoading}
                  className="bg-green-600 hover:bg-green-700 w-full sm:max-w-52"
                >
                  {generateOtpLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating OTP...
                    </>
                  ) : (
                    `Send OTP to ${getRecipient()}`
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-2 dark:text-gray-400">
                  Click to generate OTP for secure handover
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <>
              <div className="flex justify-center items-center gap-2 md:gap-3 my-6">
                {otp.map((digit: string, idx: number) => (
                  <Input
                    key={`otp-${idx}`}
                    className={`sm:w-12 sm:h-12 text-center font-semibold text-lg border-2 transition-colors ${
                      error
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]"
                    value={digit}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      inputChangeHandler(e.target.value, idx)
                    }
                    onKeyDown={(e) => keyDownHandler(e, idx)}
                    onPaste={otpPasteHandler}
                    onFocus={handleInputFocus}
                    maxLength={1}
                    autoComplete="one-time-code"
                    aria-label={`Digit ${idx + 1} of ${OTP_LENGTH}`}
                    aria-invalid={error ? "true" : "false"}
                    disabled={verifyOtpLoading}
                  />
                ))}
              </div>

              {error && (
                <div
                  id="otp-error"
                  className="text-red-500 text-sm text-center mb-4"
                  role="alert"
                  aria-live="polite"
                >
                  {error}
                </div>
              )}

              <div className="space-y-2">
                {verifyOtpLoading ? (
                  <Button
                    className="w-full my-gradient-btn"
                    disabled
                    aria-describedby="loading-text"
                  >
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    <span id="loading-text">Please wait</span>
                  </Button>
                ) : (
                  <Button
                    onClick={submitHandler}
                    className="w-full my-gradient-btn"
                    disabled={otp.join("").length !== OTP_LENGTH}
                  >
                    Verify OTP
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TwoStepOtpDialog;
