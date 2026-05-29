import AcceptAddress from "@/components/shared/AcceptAddress";
import {
  EmptyState,
  ImagePreviewBox,
  MyUnderLine,
  PageSkeleton,
} from "@/components/shared/utilityComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hasDataChanged } from "@/lib/utils";
import {
  foodTypeOptions,
  RestaurantInputState,
  restaurantSchema,
  statusOptions,
} from "@/schema/restaurantSchema";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { useUserStore } from "@/store/useUserStore";
import { FoodType, RestaurantStatus } from "@/types/restaurantType";
import { Loader2 } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

const Restaurant = () => {
  const { loading, userRestaurant, updateRestaurant } = useRestaurantStore();
  const { user } = useUserStore();

  const [input, setInput] = useState<RestaurantInputState>({
    restaurantName: userRestaurant?.restaurantName || "",
    cuisines: userRestaurant?.cuisines.join(",") || "",
    openingTime: userRestaurant?.openingTime || "",
    closingTime: userRestaurant?.closingTime || "",
    status: userRestaurant?.status,
    foodType: userRestaurant?.foodType || "",
    contact: userRestaurant?.contact ? userRestaurant?.contact : "",
    imageUrl: null as File | null,
    address: userRestaurant?.location.address || "",
    latitude: userRestaurant?.location.latitude || 0,
    longitude: userRestaurant?.location.latitude || 0,
  });
  const checkboxRef = useRef<HTMLInputElement | null>(null);

  const [errors, setErrors] = useState<Partial<RestaurantInputState>>();
  const imageRef = useRef<HTMLInputElement | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(
    userRestaurant?.imageUrl || null,
  );
  const [isChanged, setIsChanged] = useState<boolean>(false);

  function fileChangeHandler(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (file) {
      setInput((prev) => ({ ...prev, imageUrl: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }
  function inputChangeHandler(e: ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target;
    if (name === "contact" && checkboxRef.current) {
      checkboxRef.current.checked = false;
    }
    setInput((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  function checkboxChangeHandler(e: ChangeEvent<HTMLInputElement>) {
    const { checked, value } = e.target;
    setInput((prev) => ({ ...prev, contact: checked ? value : "" }));
  }

  async function submitHandler(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const result = restaurantSchema.safeParse(input);
    if (!result.success) {
      const fieldErrors = result.error.formErrors.fieldErrors;
      setErrors(fieldErrors as Partial<RestaurantInputState>);
      return;
    }

    // Create FormData matching controller expectations
    const formData = new FormData();

    // Basic fields
    formData.append("restaurantName", input.restaurantName);
    formData.append("contact", input.contact);
    formData.append("cuisines", input.cuisines); // Controller splits by comma
    formData.append("openingTime", input.openingTime);
    formData.append("closingTime", input.closingTime);
    formData.append("foodType", input.foodType);
    formData.append("address", input.address);
    formData.append("latitude", input.latitude.toString());
    formData.append("longitude", input.longitude.toString());

    // Image
    if (input.imageUrl && input.imageUrl instanceof File) {
      formData.append("image", input.imageUrl);
    }

    await updateRestaurant(formData);
  }

  useEffect(() => {
    if (!userRestaurant) return;

    setInput((state) => ({
      ...state,
      restaurantName: userRestaurant.restaurantName || "",
      address: userRestaurant.location.address || "",
      cuisines: userRestaurant.cuisines?.join(",") || "",
      openingTime: userRestaurant.openingTime || "",
      closingTime: userRestaurant.closingTime || "",
      status: userRestaurant.status,
      foodType: userRestaurant.foodType,
      contact: userRestaurant.contact || "",
      imageUrl: null as File | null,
      longitude: userRestaurant.location.longitude || 0,
      latitude: userRestaurant.location.latitude || 0,
    }));
    if (userRestaurant.contact === user?.contact && checkboxRef.current) {
      checkboxRef.current.checked = true;
    }
  }, [userRestaurant]);

  useEffect(() => {
    const result = hasDataChanged(input, userRestaurant, "imageUrl"); // need to update
    setIsChanged(result);
  }, [input]);

  return (
    <div className="md:py-15 xl:px-35 p-5 bg-gray-50 dark:bg-input/110">
      {loading.pageLoad ? (
        <PageSkeleton></PageSkeleton>
      ) : !userRestaurant ? (
        <div className="pt-35">
          <EmptyState></EmptyState>
        </div>
      ) : (
        <>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Update Restaurant
            </h1>
            <MyUnderLine></MyUnderLine>
          </div>

          <form className="" onSubmit={submitHandler}>
            <div className="my-7 sm:my-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-y-7 md:gap-x-12">
              <div className="">
                <Label className="mb-2">Restaurant Name</Label>
                <Input
                  type="text"
                  name="restaurantName"
                  placeholder="Enter Restaurant name"
                  value={input.restaurantName}
                  onChange={inputChangeHandler}
                  required
                ></Input>
                {errors && (
                  <span className="text-xs text-red-500">
                    {errors.restaurantName}
                  </span>
                )}
              </div>
              <div>
                <Label className="mb-2">Restaurant Contact</Label>
                <Input
                  type="text"
                  name="contact"
                  value={input?.contact}
                  onChange={inputChangeHandler}
                  className="my-1"
                  required
                ></Input>
                {errors && (
                  <span className="text-sm text-red-500">{errors.contact}</span>
                )}
                <div className=" flex gap-1 items-center">
                  <input
                    ref={checkboxRef}
                    type="checkbox"
                    id="user_contact"
                    name="user_contact"
                    value={user?.contact}
                    onChange={checkboxChangeHandler}
                  ></input>
                  <label
                    htmlFor="user_contact"
                    className="text-blue-500 text-sm"
                  >
                    Same as user contact
                  </label>
                </div>
              </div>
              <div>
                <Label className="mb-2">Cuisines</Label>
                <Input
                  type="text"
                  name="cuisines"
                  placeholder="e.g. Indian, Italian, Chinees etc"
                  value={input.cuisines.toString()}
                  onChange={inputChangeHandler}
                  required
                ></Input>
                {errors && (
                  <span className="text-xs text-red-500">
                    {errors.cuisines}
                  </span>
                )}
              </div>
              <div>
                <Label className="mb-2">Opening Time</Label>
                <Input
                  type="time"
                  name="openingTime"
                  value={input.openingTime}
                  onChange={inputChangeHandler}
                  required
                ></Input>
                {errors && (
                  <span className="text-xs text-red-500">
                    {errors.openingTime}
                  </span>
                )}
              </div>
              <div>
                <Label className="mb-2">Closing Time</Label>
                <Input
                  type="time"
                  name="closingTime"
                  value={input.closingTime}
                  onChange={inputChangeHandler}
                  required
                ></Input>
                {errors && (
                  <span className="text-xs text-red-500">
                    {errors.closingTime}
                  </span>
                )}
              </div>
              <div>
                <Label className="mb-2">Status</Label>
                <Select
                  defaultValue={input.status}
                  value={input.status}
                  onValueChange={(newValue: RestaurantStatus) =>
                    setInput((prev) => ({ ...prev, ["status"]: newValue }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Status"></SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {statusOptions.map((status, idx) => (
                        <SelectItem key={idx} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors && (
                  <span className="text-xs text-red-500">{errors.status}</span>
                )}
              </div>
              <div>
                <Label className="mb-2">Food Type</Label>
                <Select
                  defaultValue={input.foodType}
                  value={input.foodType}
                  onValueChange={(newValue: FoodType) =>
                    setInput((prev) => ({ ...prev, ["foodType"]: newValue }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Food type"></SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {foodTypeOptions.map((status, idx) => (
                        <SelectItem key={idx} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors && (
                  <span className="text-xs text-red-500">
                    {errors.foodType}
                  </span>
                )}
              </div>

              <div className="col-span-2">
                  <AcceptAddress
                    address={input.address}
                    latitude={input.latitude}
                    longitude={input.longitude}
                    onChange={({ address, latitude, longitude }) => {
                      setInput((p) => ({
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
            </div>

            <div className="my-10">
              <Label className="mb-3 text-center">
                Upload Restaurant Banner
              </Label>
              <ImagePreviewBox
                imageRef={imageRef}
                previewImage={previewImage}
                fallbackImage={userRestaurant?.imageUrl}
                className="sm:w-[70%] h-60!"
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

            <div className="flex justify-center items-center mb-8">
              {loading.updateRestaurantBtn ? (
                <Button className="my-gradient-btn w-full sm:max-w-90" disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin"></Loader2>
                  <span>Please wait</span>
                </Button>
              ) : (
                <Button
                  disabled={!isChanged}
                  className="my-gradient-btn w-full sm:max-w-90"
                >
                  {isChanged ? "Save Changes" : "No Changes Detected"}
                </Button>
              )}
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default Restaurant;
