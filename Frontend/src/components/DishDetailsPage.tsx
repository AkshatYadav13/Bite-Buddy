import { useEffect, useState } from "react";
import {
  MapPin,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
  Clock,
} from "lucide-react";
import { useDishStore } from "@/store/useDishStore";
import { Link, useParams } from "react-router-dom";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { FoodTypeTag, RatingBox, RatingTag } from "./shared/RestaurantCard";
import { DishCard } from "./shared/DishCard";
import { DishType } from "@/types/dishType";
import {
  AddToCartBtn,
  CardSkeletonPage,
  EmptyState,
  FavoriteBtn,
} from "./shared/utilityComponents";
import { Button } from "./ui/button";
import { useUserStore } from "@/store/useUserStore";

const DishDetailsPage = () => {
  const { id: dishId } = useParams();

  const [quantity, setQuantity] = useState(1);

  const {
    similarDishes,
    getSimilarDishes,
    loading:dishLoading,
    getDishDetails,
    selectedDish,
  } = useDishStore();

  const { getRestaurantMenu,menu,loading:restaurantLoading} = useRestaurantStore();
  
  const { user, toggleDishInFavorites,loading:userLoading } = useUserStore();

  const dishRestaurantId = selectedDish?.restaurant._id;

  const handleQuantityChange = (change: number) => {
    setQuantity(Math.max(1, quantity + change));
  };

  useEffect(() => {
    if(!dishRestaurantId || !dishId){
      return;
    }
    
    getSimilarDishes(dishId);

    if (!selectedDish || selectedDish._id !== dishId) {
      getDishDetails(dishId);
    }

    if(menu.length === 0 || menu[0].restaurant._id !== dishRestaurantId){
      getRestaurantMenu(dishRestaurantId,1,5);
    }

  }, [dishId,dishRestaurantId]);


  if (!selectedDish || !dishRestaurantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <EmptyState
          title="Dish Not Found"
          message="The dish you're looking for doesn't exist or is no longer available."
          icon={
            <Clock className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          }
        />
      </div>
    );
  }

  const restaurantDishes = menu
    .filter((dish) => dish._id !== dishId)
    .slice(0, 3);

  const cartItem = {
    dishId: selectedDish?._id,
    name: selectedDish?.name,
    sellingPrice: selectedDish?.sellingPrice,
    costPrice: selectedDish?.costPrice,
    imageUrl: selectedDish?.imageUrl,
    quantity,
  };

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-input/110 text-gray-9
    00 dark:text-gray-100"
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to={`/restaurant/id/${selectedDish?.restaurant._id}`}>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <h1 className="text-lg font-semibold">Dish Details</h1>
            </div>
            <div className="flex items-center space-x-2">
              {
                user?.role === "Customer" && (
                  <FavoriteBtn
                    isFavorite={
                      user ? user.favoriteDishes.includes(selectedDish._id) : false
                    }
                onClickHandler={() => toggleDishInFavorites(selectedDish._id)}
                defaultVisible={true}
                loading={userLoading?.toggleDishInFavoritesBtn}
              ></FavoriteBtn>
                )
              }
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-10 py-6">
        {/* Section 1: Selected Dish Details */}

        <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-lg overflow-hidden mb-15 mt-5">
            {
              dishLoading.pageLoad ? (
              <div className="lg:flex animate-pulse">
                  
                  {/* Image Section */}
                  <div className="lg:w-1/2 relative">
                    <div className="w-full sm:h-80 lg:h-full bg-gray-200 dark:bg-gray-700 rounded-md" />

                    {/* Food Type Tag */}
                    <div className="absolute top-4 left-4 w-20 h-6 bg-gray-300 dark:bg-gray-600 rounded-full" />

                    {/* Rating Tag */}
                    <div className="absolute top-4 right-4 w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  </div>

                  {/* Content Section */}
                  <div className="lg:w-1/2 px-4 sm:px-8 py-3 pb-0 flex flex-col justify-between">

                    <div>
                      {/* Title */}
                      <div className="h-8 sm:h-10 w-3/4 bg-gray-300 dark:bg-gray-600 rounded mb-4" />

                      {/* Restaurant Name */}
                      <div className="flex items-center mb-4">
                        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full mr-2" />
                        <div className="h-4 w-40 bg-gray-300 dark:bg-gray-600 rounded" />
                      </div>

                      {/* Description */}
                      <div className="space-y-2 mb-6">
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full" />
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6" />
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-4/6" />
                      </div>

                      {/* Tags */}
                      <div className="flex gap-2 mb-5">
                        <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded-full" />
                        <div className="w-20 h-6 bg-gray-300 dark:bg-gray-600 rounded-full" />
                        <div className="w-14 h-6 bg-gray-300 dark:bg-gray-600 rounded-full" />
                      </div>

                      {/* Rating Box */}
                      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />

                      {/* Order Count Box */}
                      <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6" />

                      {/* Price */}
                      <div className="h-8 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-6" />
                    </div>

                    {/* Quantity + Button */}
                    <div className="grid gap-5 mb-6 sm:grid-cols-[100px_1fr]">
                      <div className="h-12 w-28 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded-full" />
                    </div>
                  </div>
              </div>
              ) : (
                <div className="lg:flex">
                    <div className="lg:w-1/2 relative">
                      <img
                    src={selectedDish?.imageUrl}
                    alt={selectedDish?.name}
                    className="w-full sm:h-80 lg:h-full object-cover"
                  />
                  <FoodTypeTag
                    foodType={selectedDish?.isVeg ? "Pure Veg" : "Non Veg"}
                  />
                  {selectedDish?.ratingCount > 0 && (
                    <RatingTag avgRating={selectedDish?.avgRating.toString()} />
                  )}
                </div>

                <div className="text-xs sm:text-sm lg:w-1/2 px-4 sm:px-8 py-3 pb-0 flex flex-col justify-between">
                  <div className="">
                    <h1 className="text-lg sm:text-3xl font-bold my-2">
                      {selectedDish?.name}
                    </h1>

                    <div className="flex items-center mb-3">
                      <MapPin className="w-3 h-3 sm:w-5 sm:h-5 text-gray-400 mr-2" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {selectedDish.restaurant.restaurantName}
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                      {selectedDish.description}
                    </p>

                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <div className="flex space-x-2">
                        {selectedDish.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-x-5 sm:grid-cols-2 lg:grid-cols-1">
                      {selectedDish.avgRating > 0 && (
                        <RatingBox
                          avgRating={selectedDish.avgRating}
                          ratingCount={selectedDish.ratingCount}
                        />
                      )}

                      {selectedDish.orderCount > 0 && (
                        <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-5 flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <ShoppingBag className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span>
                            Over {Math.round(selectedDish.totalUnitsSold / 10) * 10}
                            + plates served to{" "}
                            {Math.round(selectedDish.orderCount / 10) * 10}+
                            satisfied customers
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center mb-6">
                      <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                        ₹ {selectedDish.sellingPrice}
                      </span>
                    </div>
                  </div>

                  {user?.role === "Customer" && (
                    <div className="grid gap-5 mb-6 sm:grid-cols-[100px_1fr]">
                      <div className="flex items-center border-2 border-gray-200 dark:border-gray-600 rounded-full my-auto h-fit w-fit">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 font-medium">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <AddToCartBtn
                      cartItem={cartItem}
                      restaurantId={dishRestaurantId}
                      text={`Add to Cart - ₹ ${
                        selectedDish.sellingPrice * quantity
                      }`}
                    ></AddToCartBtn>
                    </div>
                  )}
                </div>
              </div>
              )
            }
        </div>

        {/* Section 2: Price Comparison */}

        <div className="mb-15">
          {dishLoading.getSimilarDishes ? (
            <CardSkeletonPage></CardSkeletonPage>
          ) : similarDishes.length !== 0 ? (
            <>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h2 className="sm:text-2xl font-bold">
                  Recommended ({similarDishes.length})
                </h2>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-blue-100 dark:bg-blue-800 px-3 py-1 rounded-full">
                  Similar Dishes
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarDishes?.map((dish: DishType) => (
                  <DishCard key={dish._id} dish={dish} />
                ))}
              </div>
            </>
          ) : null}
        </div>

        {/* Section 3: More from Same Restaurant */}
        <div className="mb-10">
          {restaurantLoading.getRestaurantMenu ? (
            <CardSkeletonPage></CardSkeletonPage>
          ) : restaurantDishes?.length !== 0 ? (
            <>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="sm:text-2xl font-bold">
                  More from {selectedDish?.restaurant.restaurantName}
                </h2>
                <Link to={`/restaurant/id/${dishRestaurantId}`} >
                  <Button
                    variant="outline"
                    className="text-xs sm:text-sm text-orange-500 hover:text-orange-600 font-medium"
                  >
                    View All →
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurantDishes?.map((dish: DishType) => (
                  <DishCard key={dish._id} dish={dish} />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DishDetailsPage;
