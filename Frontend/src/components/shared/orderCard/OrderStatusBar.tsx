import React from "react";
import {
  Check,
  Clock,
  Truck,
  Package,
  User,
  X,
  PackageCheck,
} from "lucide-react";
import { OrderStatus, StatusDetails } from "@/types/orderTypes";
import { Dialog, DialogContent } from "../../ui/dialog";

interface OrderStatusBarProps {
  currentStatus: OrderStatus;
  statusHistory?: StatusDetails[];
  className?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OrderStatusBar = ({
  open,
  onOpenChange,
  currentStatus,
  statusHistory = [],
  className = "",
}: OrderStatusBarProps) => {
  const statusConfig: Record<
    string,
    {
      icon: React.ElementType;
      label: string;
      color: string;
      bgColor: string;
      description: string;
    }
  > = {
    Pending: {
      icon: Clock,
      label: "Pending",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      description: "Order received",
    },
    Placed: {
      icon: Package,
      label: "Placed",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      description: "Order received",
    },

    Confirmed: {
      icon: Check,
      label: "Confirmed",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Order confirmed",
    },
    Preparing: {
      icon: Package,
      label: "Preparing",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: "Being prepared",
    },
    ReadyForPickup: {
      icon: PackageCheck,
      label: "Ready",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Ready for pickup",
    },
    AcceptedByAgent: {
      icon: User,
      label: "Assigned",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      description: "Assigned to agent",
    },
    OutForDelivery: {
      icon: Truck,
      label: "Out for Delivery",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "On the way",
    },
    Delivered: {
      icon: Check,
      label: "Delivered",
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Order delivered",
    },
    Canceled: {
      icon: X,
      label: "Canceled",
      color: "text-red-600",
      bgColor: "bg-red-100",
      description: "Order canceled",
    },
  };

  const statusOrder = [
    "Pending",
    "Placed",
    "Confirmed",
    "Preparing",
    "ReadyForPickup",
    "AcceptedByAgent",
    "OutForDelivery",
    "Delivered",
  ];

  const getCurrentStatusIndex = () => {
    if (currentStatus === "Canceled") return -1;
    return statusOrder.indexOf(currentStatus);
  };

  const getStatusTime = (status: string) => {
    const statusDetail = statusHistory.find((s) => s.status === status);
    return statusDetail?.time;
  };

  const formatTime = (date: Date) => {
    const corrDate = new Date(date);
    if (!corrDate || isNaN(corrDate.getTime())) return "—";

    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    }).format(corrDate);
  };

  const currentIndex = getCurrentStatusIndex();
  const isCanceled = currentStatus === "Canceled";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-fit">
        <div className={`${className}`}>
          {/* Current Status Header */}
          <div className="flex items-center gap-5 pb-8">
            <div
              className={`p-2 rounded-full ${statusConfig[currentStatus].bgColor}`}
            >
              {React.createElement(statusConfig[currentStatus].icon, {
                className: `w-5 h-5 ${statusConfig[currentStatus].color}`,
              })}
            </div>
            <div className="flex justify-between items-end w-full flex-wrap">
              <div>
                <div className="font-semibold text-gray-900 dark:text-teal-500">
                  {statusConfig[currentStatus].label}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {statusConfig[currentStatus].description}
                </div>
              </div>
              {getStatusTime(currentStatus) && (
                <div className="hidden sm:block sm:ml-auto text-sm text-gray-500 dark:text-gray-300">
                  {formatTime(getStatusTime(currentStatus)!)}
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {!isCanceled && (
            <div className="relative mt-10 lg:mt-12">
              <div className="flex flex-col  lg:flex-row  items-center justify-between pl-20 lg:p-0 overflow-hidden">
                {statusOrder.map((status, index) => {
                  const isCompleted = index <= currentIndex;
                  const isCurrent = index === currentIndex;
                  const config = statusConfig[status];
                  const IconComponent = config.icon;
                  const statusTime = getStatusTime(status);

                  return (
                    <div
                      key={status}
                      className="flex flex-col items-center relative px-3"
                    >
                      {/* Connecting Line */}
                      {index < statusOrder.length - 1 && (
                        <div
                          className={`absolute bottom-0  w-full rotate-90 lg:top-4 lg:left-1/2 lg:rotate-0 h-0.5 ${
                            isCompleted ? "bg-green-500" : "bg-gray-200"
                          }`}
                        />
                      )}

                      {/* Status Icon */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 relative z-10 ${
                          isCompleted
                            ? "bg-green-500 border-green-500 text-white dark:text-black"
                            : isCurrent
                              ? `${config.bgColor} ${config.color} border-current`
                              : "bg-gray-100 border-gray-300 text-gray-400 dark:text-black"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>

                      {/* Status Label */}
                      <div
                        className={`${index < statusOrder.length - 1 ? "relative  right-full -top-10" : "absolute top-0 right-[150%]"} mt-2 lg:mt-5 text-center lg:static min-w-27 min-h-10`}
                      >
                        <div
                          className={`text-xs font-medium ${
                            isCompleted || isCurrent
                              ? "text-gray-900 dark:text-gray-300"
                              : "text-gray-400"
                          }`}
                        >
                          {config.label}
                        </div>
                        {statusTime && (
                          <div className="text-xs text-gray-500 mt-1 text-nowrap">
                            {formatTime(statusTime)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Canceled Status */}
          {isCanceled && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
              <div className="text-red-800 text-sm font-medium">
                Order Canceled
              </div>
              {getStatusTime("Canceled") && (
                <div className="text-red-600 text-xs mt-1">
                  Canceled on {formatTime(getStatusTime("Canceled")!)}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderStatusBar;
