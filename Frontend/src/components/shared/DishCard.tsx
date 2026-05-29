import { Button } from "../ui/button";
import {
  DollarSign,
  Tag,
  ChefHat,
  MapPin,
  Star,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { DishType } from "@/types/dishType";
import RESTAURANT_DEFAULT_IMAGE from "@/assets/restaurant_default_image.jpg";
import { FoodTypeTag, StatusTag } from "./RestaurantCard";
import { Link, useNavigate } from "react-router-dom";
import { AddToCartBtn, FavoriteBtn } from "./utilityComponents";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { useUserStore } from "@/store/useUserStore";
import { useDishStore } from "@/store/useDishStore";

export type DishCardProps = {
  dish: DishType;
};

export const DishCard = ({ dish }: DishCardProps) => {
  const { cartRestaurantId } = useCartStore();
  const { restaurantDetails } = useRestaurantStore();
  const { user,toggleDishInFavorites,loading } = useUserStore();
  const naviagte = useNavigate();
  const { setSelectedDish } = useDishStore();

  // Action btn restrictions
  const isCartResDish = !cartRestaurantId || cartRestaurantId === dish.restaurant?._id
  const isRestaurantNotOpen = dish.restaurant?.status !== "Open";

  
  let restriction:null|string  = null

  if (isRestaurantNotOpen) {
    restriction = `Restaurant ${restaurantDetails?.status}`;
  } else if (!isCartResDish) {
    restriction = "One Restaurant at a Time";
  }
  else if(!dish.isAvailable){
    restriction = "Currently Unavailable"
  }

  const cartItem = {
    dishId: dish?._id,
    name: dish.name,
    imageUrl: dish.imageUrl,
    sellingPrice: dish.sellingPrice,
    costPrice: dish.costPrice,
    quantity: 1,
  };
  
  
  function dishDetailsHandler() {
    setSelectedDish(dish);
    if(!restriction && user?.role === "Customer"){
      naviagte(`/dish/${dish._id}`);
    }
  }
  
  return (
    <div
    className={`overflow-hidden group bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-full ${
        !dish.isAvailable ? "opacity-60" : ""
      }`}
    >
      <div className="relative">
        {/* Image Container */}
        <div onClick={dishDetailsHandler} className={`${!restriction ? "cursor-pointer":"" } relative overflow-hidden`}>
          <img
            src={dish.imageUrl || RESTAURANT_DEFAULT_IMAGE}
            alt={dish.name}
            className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <StatusTag status={dish.isAvailable ? "Available" : "Unavailable"} />
          <FoodTypeTag foodType={dish.isVeg ? "Pure Veg" : "Non Veg"} />
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 justify-between">
          {/* Header Section */}
          <div className="flex justify-between gap-3 items-start">
            <div className="">
              <h3 className="mb-1 font-bold text-xl dark:text-white text-gray-900">
                {dish.name}
              </h3>
              <Link to={`/restaurant/id/${dish.restaurant?._id}`}>
                <p className="hover:text-blue-500! text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {dish.restaurant.restaurantName}
                </p>
              </Link>
            </div>
            {
              user?.role === "Customer" && (
                <FavoriteBtn
                  isFavorite={user ? user.favoriteDishes.includes(dish._id): false}
                  onClickHandler={()=> toggleDishInFavorites(dish._id)}
                loading={loading.toggleDishInFavoritesBtn}
                ></FavoriteBtn>
              )
            }
          </div>

          {/* Description */}
          <p className="text-sm my-4 leading-relaxed line-clamp-4 dark:text-gray-300 text-gray-600">
            {dish.description}
          </p>

          {/* Tags */}
          {dish.tags && dish.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 my-2 mb-6">
              {dish.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="my-gradient-btn inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
              {dish.tags.length > 3 && (
                <span className="px-2 py-1 rounded-full text-xs font-medium dark:bg-gray-700 dark:text-gray-400 bg-gray-100 text-gray-500">
                  +{dish.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          <div className="mb-4 flex gap-2 justify-between items-center flex-wrap text-sm">
            {/* Price */}
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm dark:text-gray-400 text-gray-600">
                Price:
              </span>
              <span className="font-bold text-lg text-green-600">
                ₹{dish.sellingPrice}
              </span>
            </div>

            {/* Category */}
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 dark:text-blue-400 text-blue-600" />
              <span className="font-medium dark:text-blue-300 text-blue-600">
                {dish.category}
              </span>
            </div>

            {/* Ratings */}
            {dish.ratingCount > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className=" font-medium">{dish.avgRating}</span>
                <span className="text-gray-500">
                  ({dish.ratingCount} reviews)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
            

      {/* Add to Cart Button */}
{
        user?.role === "Customer" && (
          <div className="px-5 pb-5">
            {
              restriction ?
                <Button
                  disabled
                  className="w-full bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-semibold py-3 rounded-xl cursor-not-allowed"
                >
                  {restriction}
                </Button>
              :(
                <AddToCartBtn cartItem={cartItem} restaurantId={dish.restaurant._id} ></AddToCartBtn>
              )
            }
          </div>
        )
      }
    </div>
  );
};
