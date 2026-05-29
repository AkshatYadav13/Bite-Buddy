import {
  ImagePreviewBox,
  MyUnderLine,
} from "@/components/shared/utilityComponents";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  foodTypeOptions,
  RestaurantFormErrors,
  RestaurantInputState,
  restaurantSchema,
} from "@/schema/restaurantSchema";
import { useApplicationStore } from "@/store/useApplicationStore";
import { useUserStore } from "@/store/useUserStore";
import { ArrowLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { FoodType } from "@/types/restaurantType";
import { convertToIndianTime } from "@/lib/utils";
import AcceptAddress from "@/components/shared/AcceptAddress";

/* ===================================================== */

const RestaurantForm = ({
  clearSelectedRole,
}: {
  clearSelectedRole: () => void;
}) => {
  const { user } = useUserStore();
  const { loading, submitRestaurantApplication } = useApplicationStore();

  const [currentStep, setCurrentStep] = useState(1);

  /* ================== PERSONAL ================== */
  const personalDetails = {
    fullName: user?.fullName || "",
    email: user?.email || "",
    contact: user?.contact || "",
  };

  /* ================== RESTAURANT ================== */
  const [restaurantDetails, setRestaurantDetails] =
    useState<RestaurantInputState>({
      restaurantName: "",
      contact: "",
      cuisines: "",
      openingTime: "",
      closingTime: "",
      foodType: "",
      address: "",
      latitude: 0,
      longitude: 0,
      imageUrl: undefined,
    });

  const [errors, setErrors] = useState<RestaurantFormErrors>({});

  const imageRef = useRef<HTMLInputElement | null>(null);
  const checkboxRef = useRef<HTMLInputElement | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const isPersonalDetailsValid = () => {
    return (
      personalDetails.fullName &&
      personalDetails.email &&
      /^\d{10}$/.test(personalDetails.contact)
    );
  };

  const validateRestaurantStep = () => {
    const result = restaurantSchema.safeParse(restaurantDetails);

    if (!result.success) {
      const fieldErrors = result.error.formErrors.fieldErrors;

      const formattedErrors: RestaurantFormErrors = {};

      (Object.keys(fieldErrors) as (keyof RestaurantInputState)[]).forEach(
        (key) => {
          formattedErrors[key] = fieldErrors[key]?.[0];
        },
      );

      setErrors(formattedErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !isPersonalDetailsValid()) return;

    if (currentStep === 2 && !validateRestaurantStep()) return;

    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleRestaurantDetailsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (name === "contact" && checkboxRef.current) {
      checkboxRef.current.checked = false;
    }

    setRestaurantDetails((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const checkboxChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = e.target;
    setRestaurantDetails((prev) => ({
      ...prev,
      contact: checked ? value : "",
    }));
  };

  const fileChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestaurantDetails((prev) => ({ ...prev, imageUrl: file }));
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* ================== SUBMIT ================== */

  const submitHandler = async () => {
    if (!validateRestaurantStep()) return;

    // Create FormData matching controller expectations
    const formData = new FormData();

    // Basic fields
    formData.append("restaurantName", restaurantDetails.restaurantName);
    formData.append("contact", restaurantDetails.contact);
    formData.append("cuisines", restaurantDetails.cuisines); // Controller splits by comma
    formData.append("openingTime", restaurantDetails.openingTime);
    formData.append("closingTime", restaurantDetails.closingTime);
    formData.append("foodType", restaurantDetails.foodType);
    formData.append("address", restaurantDetails.address);
    formData.append("latitude", restaurantDetails.latitude.toString());
    formData.append("longitude", restaurantDetails.longitude.toString());

    // Image
    if (
      restaurantDetails.imageUrl &&
      restaurantDetails.imageUrl instanceof File
    ) {
      formData.append("image", restaurantDetails.imageUrl);
    }

    await submitRestaurantApplication(formData);
  };

  const renderStepIndicator = () => {
  const steps = ["Personal", "Restaurant", "Review"];

  return (
    <div className="flex justify-center mb-8">
      {steps.map((_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors duration-200
              ${
                currentStep > i + 1
                  ? "bg-green-500 text-white dark:bg-green-600 dark:text-white"
                  : currentStep === i + 1
                  ? "bg-orange-500 text-white dark:bg-orange-500 dark:text-white shadow-md dark:shadow-orange-900/40"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              }`}
          >
            {currentStep > i + 1 ? <Check size={18} /> : i + 1}
          </div>

          {i < steps.length - 1 && (
            <div
              className={`w-14 h-1 mx-2 rounded transition-colors duration-200
                ${
                  currentStep > i + 1
                    ? "bg-green-500 dark:bg-green-600"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

  const renderPersonalDetailsForm = () => (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <Label>Full Name *</Label>
          <Input
            type="text"
            name="fullName"
            placeholder="Enter your full name"
            value={personalDetails.fullName}
            readOnly
          />
        </div>
        <div>
          <Label>Email *</Label>
          <Input
            type="email"
            name="email"
            placeholder="your.email@example.com"
            value={personalDetails.email}
            readOnly
          />
        </div>
        <div>
          <Label>Contact Number *</Label>
          <Input
            type="tel"
            name="contact"
            placeholder="10-digit contact number"
            value={personalDetails.contact}
            readOnly
            pattern="[0-9]{10}"
          />
        </div>
      </div>
    </div>
  );

  const renderRestaurantDetailsForm = () => (
    <div className="mt-7 sm:mt-10">
      <div className="grid sm:grid-cols-2  gap-5 md:gap-y-7 md:gap-x-12">
        {/* Restaurant Name */}
        <div>
          <Label className="mb-2">Restaurant Name *</Label>
          <Input
            type="text"
            name="restaurantName"
            placeholder="Enter Restaurant name"
            value={restaurantDetails.restaurantName}
            onChange={handleRestaurantDetailsChange}
            required
          />
          {errors?.restaurantName && (
            <span className="text-xs text-red-500">
              {errors.restaurantName}
            </span>
          )}
        </div>
        {/* Restaurant Contact */}

        <div>
          <Label className="mb-2">Restaurant Contact *</Label>
          <Input
            type="text"
            name="contact"
            value={restaurantDetails.contact}
            onChange={handleRestaurantDetailsChange}
            placeholder="10-digit phone number"
            required
          />
          {errors?.contact && (
            <span className="text-sm text-red-500">{errors.contact}</span>
          )}
          <div className="flex gap-1 items-center mt-2">
            <input
              ref={checkboxRef}
              type="checkbox"
              id="user_contact"
              name="user_contact"
              value={user?.contact}
              onChange={checkboxChangeHandler}
            />
            <label htmlFor="user_contact" className="text-blue-500 text-sm">
              Same as user contact
            </label>
          </div>
        </div>

        {/* Cuisines */}
        <div>
          <Label className="mb-2">Cuisines *</Label>
          <Input
            type="text"
            name="cuisines"
            placeholder="e.g. Indian, Italian, Chinese"
            value={restaurantDetails.cuisines}
            onChange={handleRestaurantDetailsChange}
            required
          />
          {errors?.cuisines && (
            <span className="text-xs text-red-500">{errors.cuisines}</span>
          )}
          <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
        </div>

        {/* Opening Time */}
        <div>
          <Label className="mb-2">Opening Time * (am)</Label>
          <Input
            type="time"
            name="openingTime"
            value={restaurantDetails.openingTime}
            onChange={handleRestaurantDetailsChange}
            required
          />
          {errors?.openingTime && (
            <span className="text-xs text-red-500">{errors.openingTime}</span>
          )}
        </div>

        {/* Closing Time */}
        <div>
          <Label className="mb-2">Closing Time * (pm)</Label>
          <Input
            type="time"
            name="closingTime"
            value={restaurantDetails.closingTime}
            onChange={handleRestaurantDetailsChange}
            required
          />
          {errors?.closingTime && (
            <span className="text-xs text-red-500">{errors.closingTime}</span>
          )}
        </div>

        {/* Food Type */}
        <div>
          <Label className="mb-2">Food Type *</Label>
          <Select
            value={restaurantDetails.foodType}
            onValueChange={(newValue: FoodType) =>
              setRestaurantDetails((prev: any) => ({
                ...prev,
                foodType: newValue,
              }))
            }
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Food type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {foodTypeOptions.map((type, idx) => (
                  <SelectItem key={idx} value={type}>
                    {type.replace("_"," ")}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors?.foodType && (
            <span className="text-xs text-red-500">{errors.foodType}</span>
          )}
        </div>
        {/* Address */}

      </div>
        <div className="my-10">
          <AcceptAddress
            address={restaurantDetails.address}
            latitude={restaurantDetails.latitude}
            longitude={restaurantDetails.longitude}
            onChange={({ address, latitude, longitude }) => {
              setRestaurantDetails((p) => ({
                ...p,
                address,
                latitude,
                longitude,
              }));
            }}
            errorMsg={
              errors?.address ||
              errors?.latitude?.toString() ||
              errors?.longitude?.toString()
            }
          />
        </div>

      {/* Restaurant Banner Upload */}
      <div className="my-10">
        <Label className="mb-3 text-center">Upload Restaurant Banner</Label>
        <ImagePreviewBox
          imageRef={imageRef}
          previewImage={previewImage}
          className=" h-60!"
        ></ImagePreviewBox>
        <Input
          type="file"
          name="image"
          accept="image/*"
          className="hidden"
          ref={imageRef}
          onChange={fileChangeHandler}
        />
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      {/* Personal Details */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold text-lg mb-4">Personal Details</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Name:</span>{" "}
            {personalDetails.fullName}
          </div>
          <div>
            <span className="font-medium">Email:</span> {personalDetails.email}
          </div>
          <div>
            <span className="font-medium">Phone:</span>{" "}
            {personalDetails.contact}
          </div>
        </div>
      </div>

      {/* Restaurant Details */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold text-lg mb-4">Restaurant Details</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Restaurant Name:</span>{" "}
            {restaurantDetails.restaurantName}
          </div>

          <div>
            <span className="font-medium">Contact:</span>{" "}
            {restaurantDetails.contact}
          </div>

          <div>
            <span className="font-medium">Cuisines:</span>{" "}
            {restaurantDetails.cuisines}
          </div>

          <div>
            <span className="font-medium">Food Type:</span>{" "}
            {restaurantDetails.foodType}
          </div>

          <div>
            <span className="font-medium">Opening Time:</span>{" "}
            {convertToIndianTime(restaurantDetails.openingTime)}
          </div>

          <div>
            <span className="font-medium">Closing Time:</span>{" "}
            {convertToIndianTime(restaurantDetails.closingTime)}
          </div>

          <div>
            <span className="font-medium">Address:</span>{" "}
            {restaurantDetails.address}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
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
              <h1 className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
                Restaurant Owner Application
              </h1>
              <MyUnderLine />
            </div>
          </div>

          {renderStepIndicator()}

          <form>
            {currentStep === 1 && renderPersonalDetailsForm()}
            {currentStep === 2 && renderRestaurantDetailsForm()}
            {currentStep === 3 && renderReviewStep()}

            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <Button
                  type="button"
                  onClick={handlePrevStep}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  Previous
                </Button>
              )}

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="ml-auto bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 flex items-center"
                >
                  Next <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={submitHandler}
                  disabled={loading.submitAppBtn}
                  className="ml-auto bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 flex items-center"
                >
                  {loading.submitAppBtn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
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
    </div>
  );
};

export default RestaurantForm;
