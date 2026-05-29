import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MyUnderLine } from "@/components/shared/utilityComponents";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApplicationStore } from "@/store/useApplicationStore";
import { useUserStore } from "@/store/useUserStore";
import {
  Check,
  ChevronRight,
  ArrowLeft,
  Loader2,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useDeliveryAgentStore } from "@/store/useDeliveryAgentStore";
import { VehicleType, vehicleTypeOptions } from "@/types/deliveryAgentType";
import {
  AgentFormErrors,
  AgentInputState,
  agentSchema,
} from "@/schema/agentSchema";

const stepFieldMap: Record<number, (keyof AgentInputState)[]> = {
  2: ["licenseNumber", "vehicleNumber", "vehicleType"],
  3: ["preferredRestaurants"],
};

export const DeliveryAgentForm = ({
  clearSelectedRole,
}: {
  clearSelectedRole: () => void;
}) => {
  const { user } = useUserStore();
  const { loading, submitDeliveryAgentApplication } = useApplicationStore();
  const { userLocation } = useAppStore();

  const [currentStep, setCurrentStep] = useState(1);

  const {
    optimalRestaurants,
    getOptimalRestaurantsForAgent,
    loading: resListLoading,
  } = useDeliveryAgentStore();

  const [agentDetails, setAgentDetails] = useState<AgentInputState>({
    licenseNumber: "",
    vehicleNumber: "",
    vehicleType: "Scooter",
    preferredRestaurants: [],
  });

  const [errors, setErrors] = useState<AgentFormErrors>({});

  /* ---------------- FETCH RESTAURANTS ---------------- */

  useEffect(() => {
    if (!userLocation?.latitude || !userLocation?.longitude) return;

    getOptimalRestaurantsForAgent(
      userLocation.latitude.toString(),
      userLocation.longitude.toString(),
    );
  }, [userLocation]);

  /* ---------------- VALIDATION ---------------- */

  const validateAgentDetails = () => {
    const result = agentSchema.safeParse(agentDetails);
    if (result.success) {
      setErrors({});
      return true;
    }

    const fieldErrors = result.error.formErrors.fieldErrors;
    const allowedFields = stepFieldMap[currentStep] ?? [];
    const formattedErrors: AgentFormErrors = {};

    (Object.keys(fieldErrors) as (keyof AgentInputState)[]).forEach((key) => {
      if (allowedFields.includes(key)) {
        formattedErrors[key] = fieldErrors[key]?.[0];
      }
    });

    setErrors(formattedErrors);
    return Object.keys(formattedErrors).length === 0;
  };

  const validateRestaurantSelection = () => {
    const newErrors: AgentFormErrors = {};
    if (
      optimalRestaurants?.length > 5 &&
      agentDetails.preferredRestaurants?.length !== 5
    ) {
      newErrors.preferredRestaurants = "You must select exactly 5 restaurants";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- NAVIGATION ---------------- */

  const handleNextStep = () => {
    if (currentStep === 2 && !validateAgentDetails()) return;
    if (currentStep === 3 && !validateRestaurantSelection()) return;
    setCurrentStep((p) => p + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep((p) => p - 1);
  };

  /* ---------------- RESTAURANT SELECTION ---------------- */

  const toggleRestaurantSelection = (restaurantId: string) => {
    setAgentDetails((prev) => {
      const isSelected = prev.preferredRestaurants.includes(restaurantId);

      if (isSelected) {
        return {
          ...prev,
          preferredRestaurants: prev.preferredRestaurants.filter(
            (id: string) => id !== restaurantId,
          ),
        };
      }

      if (prev.preferredRestaurants.length >= 5) return prev;

      return {
        ...prev,
        preferredRestaurants: [...prev.preferredRestaurants, restaurantId],
      };
    });
  };

  /* ---------------- SUBMIT ---------------- */

  const submitHandler = async () => {
    await submitDeliveryAgentApplication(agentDetails);
  };

  /* ---------------- EARLY UI GUARD ---------------- */

  if (!userLocation?.latitude || !userLocation?.longitude) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          Please enable location access to continue
        </p>
      </div>
    );
  }
  /* ---------------- BUTTON DISABLE LOGIC ---------------- */

  const isRestaurantSelectionInvalid =
    currentStep === 3 &&
    ((optimalRestaurants.length < 5 &&
      agentDetails.preferredRestaurants.length !== optimalRestaurants.length) ||
      (optimalRestaurants.length >= 5 &&
        agentDetails.preferredRestaurants.length < 5));

  /* ---------------- STEP INDICATOR ---------------- */

  const renderStepIndicator = () => {
    const steps = [
      "Personal Details",
      "Agent Details",
      "Restaurants",
      "Review",
    ];

    return (
      <div className="flex items-center justify-center mb-8 overflow-x-auto my-scrollbar py-2 pl-20">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-200
                  ${
                    currentStep > index + 1
                      ? "bg-green-500 text-white dark:bg-green-600"
                      : currentStep === index + 1
                        ? "bg-orange-500 text-white dark:bg-orange-500 shadow-md dark:shadow-orange-900/40"
                        : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300"
                  }`}
              >
                {currentStep > index + 1 ? (
                  <Check className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>

              <span
                className={`text-xs mt-1 whitespace-nowrap transition-colors duration-200
                  ${
                    currentStep === index + 1
                      ? "text-orange-600 dark:text-orange-400 font-medium"
                      : currentStep > index + 1
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-600 dark:text-gray-400"
                  }`}
              >
                {step}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`w-12 h-1 mx-2 rounded transition-colors duration-200
                  ${
                    currentStep > index + 1
                      ? "bg-green-500 dark:bg-green-600"
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  /* ---------------- STEP 1 ---------------- */

  const renderPersonalDetails = () => (
    <div className="grid sm:grid-cols-2 gap-5">
      <div>
        <Label>Full Name</Label>
        <Input value={user?.fullName || ""} readOnly />
      </div>

      <div>
        <Label>Email</Label>
        <Input value={user?.email || ""} readOnly />
      </div>

      <div>
        <Label>Contact</Label>
        <Input value={user?.contact || ""} readOnly />
      </div>
    </div>
  );

  /* ---------------- STEP 2 ---------------- */

  const renderAgentDetails = () => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div>
        <Label>License Number *</Label>
        <Input
          value={agentDetails.licenseNumber}
          onChange={(e) =>
            setAgentDetails((p) => ({
              ...p,
              licenseNumber: e.target.value,
            }))
          }
          placeholder="UP32 202400123456"
        />
        {errors.licenseNumber && (
          <p className="text-xs text-red-500">{errors.licenseNumber}</p>
        )}
      </div>

      <div>
        <Label>Vehicle Number *</Label>
        <Input
          value={agentDetails.vehicleNumber}
          onChange={(e) =>
            setAgentDetails((p) => ({
              ...p,
              vehicleNumber: e.target.value,
            }))
          }
          placeholder="UP32 AB 1234"
        />
        {errors.vehicleNumber && (
          <p className="text-xs text-red-500">{errors.vehicleNumber}</p>
        )}
      </div>

      <div>
        <Label>Vehicle Type *</Label>
        <Select
          value={agentDetails.vehicleType}
          onValueChange={(value: VehicleType) =>
            setAgentDetails((p) => ({ ...p, vehicleType: value }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select vehicle type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {vehicleTypeOptions.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.vehicleType && (
          <p className="text-xs text-red-500">{errors.vehicleType}</p>
        )}
      </div>
    </div>
  );

  /* ---------------- STEP 3 ---------------- */

  const renderRestaurantSelection = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-blue-900">
              Fallback Agent Program
            </p>
            <p className="text-blue-800">
              As a fallback agent, you'll receive orders from selected
              restaurants when regular agents are unavailable. You must select
              exactly <strong>5 restaurants</strong>. Showing restaurants near
              your location.
            </p>
            <p className="text-blue-700 text-xs">
              ℹ️ Please select restaurants that currently have fewer fallback
              agents.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">
          Select Restaurants ({agentDetails.preferredRestaurants.length}/5)
        </h3>
        {errors.preferredRestaurants && (
          <p className="text-sm text-red-500">{errors.preferredRestaurants}</p>
        )}
      </div>

      {resListLoading.pageLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : optimalRestaurants?.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">
            No restaurants found within 5km radius
          </p>
          <p className="text-sm text-gray-500 mt-2">
            You can procced to next step
          </p>
        </div>
      ) : (
        <div className="grid gap-4 max-h-96 overflow-y-auto pr-2 my-scrollbar">
          {optimalRestaurants?.map((restaurant) => {
            const isSelected = agentDetails.preferredRestaurants.includes(
              restaurant._id,
            );
            const isDisabled =
              !isSelected && agentDetails.preferredRestaurants.length >= 5;

            return (
              <div
                key={restaurant._id}
                onClick={() =>
                  !isDisabled && toggleRestaurantSelection(restaurant._id)
                }
                className={`border rounded-lg p-4 transition-all cursor-pointer
    ${
      isSelected
        ? "border-orange-500 bg-orange-50 dark:border-orange-500 dark:bg-orange-900/20"
        : isDisabled
          ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800"
          : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 dark:border-gray-700 dark:hover:border-orange-500 dark:hover:bg-orange-900/20"
    }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {restaurant.restaurantName}
                      </h4>

                      {restaurant.avgRating && (
                        <span
                          className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded
                           dark:bg-green-900/30 dark:text-green-400"
                        >
                          ★ {restaurant.avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{restaurant.location.address}</span>
                    </div>

                    <div className="ml-5 text-xs">
                      <p className="text-gray-500 mt-2 dark:text-gray-400">
                        Current fallback agents:{" "}
                        {restaurant.fallbackAgents.length}/10
                      </p>

                      <p className="text-gray-500 mt-2 dark:text-gray-400">
                        Food Type: {restaurant.foodType}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
        ${
          isSelected
            ? "border-orange-500 bg-orange-500 dark:border-orange-500 dark:bg-orange-500"
            : "border-gray-300 dark:border-gray-600"
        }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  /* ---------------- STEP 4 ---------------- */
  const renderReview = () => {
    const selectedRestaurants = optimalRestaurants.filter((r) =>
      agentDetails.preferredRestaurants.includes(r._id),
    );

    return (
      <div className="space-y-6">
        {/* Personal Details */}
        <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg transition-colors">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Personal Details
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            Name: {user?.fullName}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Email: {user?.email}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Contact: {user?.contact}
          </p>
        </div>

        {/* Agent Details */}
        <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg transition-colors">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Agent Details
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            License: {agentDetails.licenseNumber}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Vehicle No: {agentDetails.vehicleNumber}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Vehicle Type: {agentDetails.vehicleType}
          </p>
        </div>

        {/* Selected Restaurants */}
        <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg transition-colors">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Selected Restaurants ({selectedRestaurants.length})
          </h3>

          <div className="space-y-3">
            {selectedRestaurants.map((restaurant, index) => (
              <div key={restaurant._id} className="flex items-start gap-2">
                <span className="font-semibold text-orange-500 dark:text-orange-400">
                  {index + 1}.
                </span>

                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {restaurant.restaurantName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {restaurant.location.address}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  /* ---------------- RENDER ---------------- */

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto p-8 rounded-2xl shadow-lg bg-white dark:bg-gray-900">
        <div className="flex items-center mb-8">
          <Button
            onClick={() => {
              if (currentStep === 1) {
                clearSelectedRole();
              } else {
                handlePrevStep();
              }
            }}
            variant="outline"
            className="mr-4 flex items-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div>
            <h1 className="text-lg lg:text-2xl font-bold">
              Delivery Partner Application
            </h1>
            <MyUnderLine />
          </div>
        </div>

        {renderStepIndicator()}

        <form>
          {currentStep === 1 && renderPersonalDetails()}
          {currentStep === 2 && renderAgentDetails()}
          {currentStep === 3 && renderRestaurantSelection()}
          {currentStep === 4 && renderReview()}

          <div className="flex justify-between mt-8">
            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                className="ml-auto"
                disabled={isRestaurantSelectionInvalid}
              >
                Next <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={loading.submitAppBtn}
                onClick={submitHandler}
                className="ml-auto"
              >
                {loading.submitAppBtn ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" /> Submitting
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
