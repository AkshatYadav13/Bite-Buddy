import { RestaurantType } from "@/types/restaurantType";
import { CiLock, CiUnlock } from "react-icons/ci";
import { FaRegStar } from "react-icons/fa";
import { PiBowlFood } from "react-icons/pi";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import RESTAURANT_DEFAULT_IMAGE from '@/assets/restaurant_default_image.jpg';
import { ChevronRight } from "lucide-react";
import { FavoriteBtn } from "./utilityComponents";
import { useUserStore } from "@/store/useUserStore";

export const RestaurantCard = ({ restaurant }: { restaurant: RestaurantType }) => {
  const {user,toggleRestaurantInFavorites,loading} = useUserStore()

  return (
    <div className="group overflow-hidden relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 flex flex-col h-full">
      
      {/* Image Container with Overlay */}
      <div className="relative overflow-hidden">
        <img
          className="object-cover h-48 w-full transition-transform duration-300 group-hover:scale-105"
          src={restaurant.imageUrl || RESTAURANT_DEFAULT_IMAGE}
          alt={restaurant.restaurantName}
        />

        {/* Status Badge */}
        <StatusTag status={restaurant.status} ></StatusTag>

        {/* Rating Badge */}
        {restaurant.avgRating > 0 && (
          <RatingTag avgRating={restaurant.avgRating.toString()} ></RatingTag>
        )}

        {/* Veg/Non-Veg Indicator */}
        <FoodTypeTag foodType={restaurant.foodType} ></FoodTypeTag>
      </div>

      {/* Main Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div className="flex-1">
          <div className="flex gap-2 items-center justify-between">
            <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-4 line-clamp-1 group-hover:text-orange-600 transition-colors">
              {restaurant.restaurantName}
            </h2>
            {
              user?.role === "Customer" && (
                <FavoriteBtn
                  isFavorite={user ? user.favoriteRestaurants.includes(restaurant._id): false}
                  onClickHandler={()=> toggleRestaurantInFavorites(restaurant._id)}
                  loading={loading.toggleRestaurantInFavoritesBtn}
                ></FavoriteBtn>
              )
            }
          </div>

          {restaurant.avgRating > 0 && (
            <RatingBox avgRating={restaurant.avgRating} ratingCount={restaurant.ratingCount} ></RatingBox>
          )}

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cuisines</h3>
            <div className="items-start flex gap-2 flex-wrap">
              {restaurant.cuisines.slice(0, 4).map((cuisine: string) => (
                <span
                  key={cuisine}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm hover:shadow-md transition-shadow"
                >
                  {cuisine}
                </span>
              ))}
              {restaurant.cuisines.length > 4 && (
                <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium px-3 py-1 rounded-full">
                  +{restaurant.cuisines.length - 4} more
                </span>
              )}
            </div>
          </div>

          <div className="text-sm flex gap-2 my-auto mb-7">
            <span className="font-medium text-gray-700 dark:text-gray-300 mb-2">Address: </span>
            <span>{restaurant.location.address}</span>
          </div>
        </div>

        {/* Button */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">View full menu</span>
          <Link to={`/restaurant/id/${restaurant._id}`}>
            <Button className="my-gradient-btn text-white font-medium px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              Explore Menu
              <ChevronRight></ChevronRight>
            </Button>
          </Link>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};


export const FoodTypeTag = ({foodType}:{foodType:string})=>{
  return(
    <div className="absolute  bottom-3 right-3">
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        foodType === 'Pure Veg' ? 'bg-green-100 text-green-800 border border-green-200' :
        foodType === 'Non Veg' ? 'bg-green-100 text-red-800 border border-green-200' : 
        'bg-red-100 text-yellow-800 border border-red-200'
      }`}>
        <PiBowlFood className="w-3 h-3" />
        {foodType}
      </div>
    </div>
  )
}

export const RatingTag = ({avgRating}:{avgRating:string})=>{
  return(
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-1 rounded-full">
        <FaRegStar className="w-3 h-3 text-yellow-500" />
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{avgRating}</span>
      </div>
  )
}

export const StatusTag = ({status}:{status:string})=>{
  return(
    <div className="absolute top-3 left-3">
      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
        ['Open',"Available"].includes(status)
          ? 'bg-green-500/90 text-white'
          : 'bg-red-500/90 text-white'
      }`}>
        {status === 'Open' ? <CiUnlock className="w-3 h-3" /> : <CiLock className="w-3 h-3" />}
        {status}
      </div>
    </div>
  )
}

export const RatingBox = ({avgRating,ratingCount}:{avgRating:number,ratingCount:number})=>{
  return(
    <div className="flex items-center justify-between mb-5 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-2">
        <div className="flex text-yellow-500">
          {[...Array(5)].map((_, i) => (
            <FaRegStar
              key={i}
              className={`w-4 h-4 ${i < Math.floor(Number(avgRating)) ? 'fill-current' : ''}`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          ({ratingCount} reviews)
        </span>
      </div>
      <span className="text-lg font-bold text-orange-600">{avgRating}/5</span>
    </div>
  )
}