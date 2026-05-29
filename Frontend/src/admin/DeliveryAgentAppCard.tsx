import { User, Calendar, Edit3, Truck, Mail, Phone, Bike } from "lucide-react";
import { toIndianDateFormat } from "@/lib/utils";
import { ActionButtons } from "./ApplicationCard";
import { DeliveryApplication } from "@/types/applicationType";
import { StatusBadge } from "@/components/shared/utilityComponents";
import { AgentPreferredRestaurantList } from "@/applicant/ApplicationSubmitted";

type DeliveryAgentAppType = {
  agent: DeliveryApplication;
  onStatusUpdate?: (
    id: string,
    status: "Approved" | "Rejected",
    reason?: string,
  ) => void;
  showActions?: boolean;
};

const DeliveryAgentAppCard = ({
  agent,
  onStatusUpdate,
  showActions = true,
}: DeliveryAgentAppType) => {
  return (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 p-2 sm:px-6 sm:py-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {agent.user?.fullName || "Delivery Agent"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Delivery Agent Application
              </p>
            </div>
            {
              agent.isDeletable && (
                <StatusBadge status={"Active"} />
              )
            }
          </div>
          <div className="flex items-center gap-x-3 w-full justify-end sm:w-fit">
            <StatusBadge status={agent.status} />
            {showActions && (
              <ActionButtons
                applicationId={agent._id}
                currentStatus={agent.status}
                onStatusUpdate={onStatusUpdate}
              />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Name:
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {agent.user?.fullName || "N/A"}
            </span>
          </div>

          {agent.user?.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email:
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {agent.user.email}
              </span>
            </div>
          )}

          {agent.user?.contact && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Contact:
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {agent.user.contact}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Applied:
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {toIndianDateFormat(agent.createdAt!)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              License Number:{" "}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {agent.deliveryAgentDetails.licenseNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Vehicle Number:{" "}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {agent.deliveryAgentDetails.vehicleNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Bike className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Vehicle:
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {agent.deliveryAgentDetails.vehicleType}
            </span>
          </div>
        </div>
         <div className="max-w-3xl">
          {
            agent.deliveryAgentDetails.preferredRestaurants.length >0 &&
            <AgentPreferredRestaurantList list={agent.deliveryAgentDetails.preferredRestaurants}></AgentPreferredRestaurantList>
          }
         </div>

        {/* Rejection Reason */}
        {agent.status === "Rejected" && agent.reason && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Rejection Reason:
            </p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {agent.reason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryAgentAppCard;
