import React from "react";
import { MapPin, Loader2, Mail, Phone } from "lucide-react";
import { convertToIndianTime } from "@/lib/utils";
import { Button } from "../components/ui/button";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { useDeliveryAgentStore } from "@/store/useDeliveryAgentStore";
import { useApplicationStore } from "@/store/useApplicationStore";
import {
  DeliveryApplication,
  RestaurantApplication,
} from "@/types/applicationType";
import { useUserStore } from "@/store/useUserStore";
import {
  getStatusColor,
  getStatusIcon,
} from "../components/shared/utilityComponents";
import { useAppStore } from "@/store/useAppStore";
import { toast } from "sonner";
import { RestaurantType } from "@/types/restaurantType";

interface ApplicationSubmittedProps {
  application: RestaurantApplication | DeliveryApplication;
}

const ApplicationSubmitted: React.FC<ApplicationSubmittedProps> = ({
  application,
}) => {
  const { loading, registerRestaurant } = useRestaurantStore();
  const { loading: deliveryLoading, registerDeliveryAgent } = useDeliveryAgentStore();
  const { makeApplicationDeletable,loading:applicationLoading } = useApplicationStore();
  const { user } = useUserStore();
  const { userLocation } = useAppStore();

  function registerDeliveryAgentHandler() {
    if (!userLocation?.latitude || !userLocation?.longitude) {
      toast.info("Location not available. Please enable location access.");
      return;
    }

    registerDeliveryAgent(application._id, userLocation);
  }

  const renderRestaurantDetails = (app: RestaurantApplication) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        {app.restaurantDetails.imageUrl && (
          <img
            src={app.restaurantDetails.imageUrl}
            alt={app.restaurantDetails.restaurantName}
            className="w-16 h-16 rounded-lg object-cover border"
          />
        )}
        <div>
          <h3 className="text-xl font-semibold ">
            {app.restaurantDetails.restaurantName}
          </h3>
          <div className="flex items-center text-gray-600 mt-2 dark:text-gray-400">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">
              {app.restaurantDetails.location.address}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Cuisines:</span>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {app.restaurantDetails.cuisines.join(", ")}
          </p>
        </div>
        <div>
          <span className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Food Type:</span>
          <p className="text-gray-600 dark:text-gray-400 mt-1 capitalize">
            {app.restaurantDetails.foodType}
          </p>
        </div>
        <div>
          <span className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Serving Hours:</span>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {convertToIndianTime(app.restaurantDetails.openingTime)} -{" "}
            {convertToIndianTime(app.restaurantDetails.closingTime)}
          </p>
        </div>
      </div>
      {user?.applicationId &&
        (loading.registerBtn || applicationLoading.deleteAppBtn ? (
          <Button
            className="my-gradient-btn"
            disabled
          >
            <Loader2 className="mr-2 h-4 w-4 animate-spin"></Loader2>
            <span>Please wait</span>
          </Button>
        ) : application.status === "Approved" ? (
          <Button
            className="my-gradient-btn"
            onClick={() => registerRestaurant(application._id)}
          >
            Register Restaurant
          </Button>
        ) : application.status === "Rejected" ? (
          <Button
          className="my-gradient-btn"
            onClick={() => makeApplicationDeletable(application._id)}
          >
            Delete this application to apply again later.
          </Button>
        ) : null)}
    </div>
  );

  const renderDeliveryDetails = (app: DeliveryApplication) => (
    <div className="space-y-10">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-400">
          {app.user.fullName}
        </h3>
        <div className="flex items-center text-gray-600 dark:text-gray-400 mt-3">
          <Phone className="w-4 h-4 mr-1" />
          <span className="text-sm">{app.user.contact}</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-400 mt-3">
          <Mail className="w-4 h-4 mr-1" />
          <span className="text-sm">{app.user.email}</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-400 mt-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{userLocation?.address}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Phone Number:</span>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {app.user.contact}
          </p>
        </div>
        <div>
          <span className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">License Number:</span>
          <p className="text-gray-600 dark:text-gray-400  mt-1">
            {app.deliveryAgentDetails.licenseNumber}
          </p>
        </div>
        <div>
          <span className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Vehicle Number:</span>
          <p className="text-gray-600 dark:text-gray-400  mt-1">
            {app.deliveryAgentDetails.vehicleNumber}
          </p>
        </div>
        <div>
          <span className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Vehicle Type:</span>
          <p className="text-gray-600 dark:text-gray-400 mt-1 capitalize">
            {app.deliveryAgentDetails.vehicleType}
          </p>
        </div>
        <div className=" col-span-2">
          {
              app.deliveryAgentDetails.preferredRestaurants.length >0 &&
              <AgentPreferredRestaurantList list={app.deliveryAgentDetails.preferredRestaurants}></AgentPreferredRestaurantList>
          }
        </div>

      </div>
      {user?.applicationId &&
        (deliveryLoading.registerDeliveryAgentBtn ? (
          <Button
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg"
            disabled
          >
            <Loader2 className="mr-2 h-4 w-4 animate-spin"></Loader2>
            <span>Please wait</span>
          </Button>
        ) : application.status === "Approved" ? (
          <Button
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg"
            onClick={registerDeliveryAgentHandler}
          >
            Register as delivery agent
          </Button>
        ) : application.status === "Rejected" ? (
          <Button
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg"
            onClick={() => makeApplicationDeletable(application._id)}
          >
            Delete this application to apply again later.
          </Button>
        ) : null)}
    </div>
  );

  const getApplicationTitle = () => {
    return application.applicationType === "Restaurant"
      ? "Restaurant Application"
      : "Delivery Agent Application";
  };

  const getStatusMessage = () => {
    switch (application.status) {
      case "Pending":
        return `Your  application is currently under review. We'll notify you once it's processed.`;
      case "Approved":
        return `Congratulations! Your application has been approved.`;
      case "Rejected":
        return `Unfortunately, your application has been rejected.`;
      default:
        return `Your application status is being updated.`;
    }
  };

  return (
    <div className="max-w-3xl bg-white dark:bg-gray-900 mx-auto p-6 mb-20 rounded-lg shadow-md border dark:text-white">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold  mb-2">{getApplicationTitle()}</h2>
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full border ${getStatusColor(application.status)}`}
        >
          {getStatusIcon(application.status)}
          <span className="ml-2 font-medium capitalize">
            {application.status}
          </span>
        </div>
      </div>

      {/* Status Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-center">{getStatusMessage()}</p>
      </div>

      {/* Application Details */}
      <div className="border-t pt-6">
        <h4 className="text-center text-lg font-semibold mb-4 block text-gray-700 dark:text-gray-300">Application Details</h4>
        {application.applicationType === "Restaurant"
          ? renderRestaurantDetails(application as RestaurantApplication)
          : renderDeliveryDetails(application as DeliveryApplication)}
      </div>

      {/* Rejection Reason */}
      {application.status === "Rejected" && application.reason && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h5 className="font-medium text-red-900 mb-2">
            Reason for Rejection:
          </h5>
          <p className="text-red-800 text-sm">{application.reason}</p>
        </div>
      )}

      {/* Review Date */}
      {application.reviewedAt && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Reviewed on: {new Date(application.reviewedAt).toLocaleDateString()}
        </div>
      )}

      {/* Contact Info */}
      <div className="mt-6 pt-4 border-t text-center text-sm text-gray-600">
        <p>Need help? Contact our support team for assistance.</p>
      </div>
    </div>
  );
};

export default ApplicationSubmitted;

// approved -> user allowed to create
// rejected -> remove application from user(user) , delete form DB(admin) once user delete

// apply -> approved -> register
//          rejected -> allow user to remove application




export const AgentPreferredRestaurantList = ({list}:{
  list:RestaurantType[]
}) => {
  return (
    <div className="mt-4">
      <span className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
        Preferred Restaurants
      </span>

      <div className="space-y-2">
        {list?.map((restaurant:RestaurantType) => (
          <div
            key={restaurant._id}
            className="
            flex flex-col rounded-lg border
            border-gray-200 dark:border-gray-700
            bg-gray-50 dark:bg-gray-800
            px-4 py-2
            hover:bg-gray-100 dark:hover:bg-gray-700
            transition
          "
          >
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {restaurant?.restaurantName}
            </span>

            <span className="text-xs text-gray-600 dark:text-gray-400">
              {restaurant?.location?.address}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
};
