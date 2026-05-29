import { useEffect } from "react";
import { Badge } from "./ui/badge";
import { Clock } from "lucide-react";
import AvaliableMenu from "./AvaliableMenu.tsx";
import { useParams } from "react-router-dom";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { convertToIndianTime } from "@/lib/utils";
import RESTAURANT_DEFAULT_IMAGE from "@/assets/restaurant_default_image.jpg";

const RestaurantDetails = () => {
  const { restaurantId,ownerId } = useParams();
  const {
    getRestaurantDetailsById,
    getRestaurantDetailsByOwnerId,
    restaurantDetails,
    clearRestaurantMenu,
    loading,
  } = useRestaurantStore();

  const { user, toggleRestaurantInFavorites,loading:userLoading } = useUserStore();

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    if(!restaurantId && !ownerId) return
    clearRestaurantMenu();
    
    if(restaurantId){
      getRestaurantDetailsById(restaurantId);
    }     
    else if(ownerId){
      getRestaurantDetailsByOwnerId(ownerId);
    }
  }, [restaurantId,ownerId]);

  /* ---------------- LOADING STATE ---------------- */
  if (loading.pageLoad) {
    return (
      <div className="px-3 md:px-10 py-5">
        <div className="animate-pulse space-y-6">
          <div className="h-[200px] md:h-[300px] bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- EMPTY / NOT FOUND ---------------- */
  if (!restaurantDetails) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <EmptyState
          title="Restaurant Not Found"
          message="This restaurant may have been removed or is unavailable."
        />
      </div>
    );
  }

  const servingHours = `${convertToIndianTime(
    restaurantDetails?.openingTime
  )} - ${convertToIndianTime(restaurantDetails.closingTime)}`;

  return (
    <div className="px-3 md:px-10 py-5 bg-gray-50 dark:bg-input/110">
      {/* ---------------- COVER IMAGE ---------------- */}
      <img
        className="object-cover h-[200px] md:h-[300px] w-full rounded-lg"
        src={restaurantDetails.imageUrl || RESTAURANT_DEFAULT_IMAGE}
        alt={`${restaurantDetails.restaurantName} banner`}
      />

      {/* ---------------- HEADER ---------------- */}
      <div className="mt-4">
        <div className="flex gap-2 items-center justify-between">
          <h1 className="font-bold text-2xl">
            {restaurantDetails.restaurantName}
          </h1>

          {
            user?.role === "Customer" && (
          <FavoriteBtn
            isFavorite={
              user
                ? user.favoriteRestaurants.includes(restaurantDetails._id)
                : false
            }
            onClickHandler={() =>
              toggleRestaurantInFavorites(restaurantDetails._id)
            }
            loading={userLoading.toggleRestaurantInFavoritesBtn}
            defaultVisible
          />
            )
          }
        </div>

        {/* ---------------- CUISINES ---------------- */}
        <div className="flex gap-3 my-6 flex-wrap">
          {restaurantDetails.cuisines.map((cuisine) => (
            <Badge
              key={cuisine}
              className="px-4 my-gradient-btn rounded-full md:text-sm"
            >
              {cuisine}
            </Badge>
          ))}
        </div>

        {/* ---------------- INFO GRID ---------------- */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          <InfoRow
            icon={<Utensils className="w-4 h-4" />}
            label="Category"
            value={restaurantDetails.foodType}
          />

          <InfoRow
            icon={<Clock className="w-4 h-4" />}
            label="Serving Hours"
            value={servingHours}
          />

          <InfoRow
            icon={getStatusIcon(restaurantDetails.status)}
            label="Status"
            value={restaurantDetails.status}
            classes={`border-l-4 ${
              restaurantDetails.status === "Open"
                ? "border-l-green-500!"
                : "border-l-red-500!"
            }`}
          />

          <InfoRow
            icon={<Home className="w-4 h-4" />}
            label="Address"
            value={restaurantDetails.location.address}
          />

          <InfoRow
            icon={<Phone className="w-4 h-4" />}
            label="Contact"
            value={restaurantDetails.contact}
          />

          {restaurantDetails.ratingCount > 0 && (
            <InfoRow
              icon={<Star className="w-4 h-4 fill-current" />}
              label="Rating"
              value={`${restaurantDetails.avgRating}/5`}
            />
          )}

          <InfoRow
            icon={<ShoppingBag className="w-4 h-4" />}
            label="Orders Served"
            value={restaurantDetails.orderServed.toLocaleString()}
          />
        </div>
      </div>

      {/* ---------------- MENU ---------------- */}
      {
        (restaurantId || restaurantDetails?._id) &&(
          <AvaliableMenu restaurantId={restaurantId || restaurantDetails?._id} />
        )
      }
    </div>
  );
};

export default RestaurantDetails;

import { Utensils, Star, Home, ShoppingBag, Phone } from "lucide-react";
import { EmptyState, FavoriteBtn, getStatusIcon } from "./shared/utilityComponents.tsx";
import { useUserStore } from "@/store/useUserStore.ts";

type InfoRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  classes?: string;
};
const InfoRow = ({ icon, label, value, classes = "" }: InfoRowProps) => (
  <div
    className={`
    flex items-center gap-3 p-3 rounded-lg transition-all duration-200 dark:bg-gray-800/50 dark:hover:bg-gray-800/70 border dark:border-gray-700/50 bg-gray-50/80 hover:bg-gray-100/80 border-gray-200/60 hover:shadow-sm hover:scale-[1.01] backdrop-blur-sm
    ${classes}
  `}
  >
    <div
      className={`flex-shrink-0 p-2 rounded-full transition-colors duration-200 bg-blue-500/10 text-blue-600`}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div
        className={`text-xs font-medium uppercase tracking-wider mb-1 dark:text-gray-400 text-gray-500`}
      >
        {label}
      </div>
      <div className={` font-medium dark:text-gray-100 text-gray-900`}>
        {value}
      </div>
    </div>
  </div>
);
