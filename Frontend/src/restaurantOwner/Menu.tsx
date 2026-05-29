import {
  Building,
  ChefHat,
  DollarSign,
  Filter,
  Plus,
  Search,
  ShoppingBag,
  Star,
  Tag,
  TrendingUp,
} from "lucide-react";
import EditDish from "./EditDish";
import { categoryOptions, DishType } from "@/types/dishType";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import AddDish from "./AddDish";
import { Switch } from "@/components/ui/switch";
import ConfirmBox from "@/components/shared/ConfirmBox";
import { useDishStore } from "@/store/useDishStore";
import {
  CardSkeletonPage,
  EmptyState,
  MyUnderLine,
} from "@/components/shared/utilityComponents";
import {
  FoodTypeTag,
  RatingTag,
  StatusTag,
} from "@/components/shared/RestaurantCard";
import RESTAURANT_DEFAULT_IMAGE from "@/assets/restaurant_default_image.jpg";
import { isFilterSelected } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/useDebounedValue";
import Pagination from "@/components/shared/Pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { foodTypeOptions } from "@/schema/restaurantSchema";

const defaultFilters = Object.freeze({
  search: "",
  category: "All",
  foodType: "All",
  sortBy: "createdAt",
  sortOrder: "desc",
  minPrice: "",
  maxPrice: "",
});

export const Menu = () => {
  const {
    userRestaurant,
    getRestaurantMenu,
    loading,
    menu,
    restaurantPagination,
  } = useRestaurantStore();

  const restaurantId = userRestaurant?._id;

  const [openDishDialog, setOpenDishDialog] = useState<boolean>(false);

  const [filters, setFilters] = useState<any>(defaultFilters);

  const debouncedSearch = useDebouncedValue(filters.search, 500);
  const filterSelected = isFilterSelected(filters, defaultFilters);

  const { currentPage, totalPages, totalCount, limit } =
    restaurantPagination || {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      limit: 10,
    };

  /* ---------------- HANDLERS ---------------- */

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(defaultFilters);

  const handlePagination = useCallback(
    (page: number, limit: number) => {
      if (restaurantId) {
        getRestaurantMenu(restaurantId, page, limit, {
          ...filters,
          search: debouncedSearch,
        });
      }
    },
    [filters, debouncedSearch, getRestaurantMenu, restaurantId],
  );

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    if (restaurantId) {
      getRestaurantMenu(restaurantId, 1, limit, {
        ...filters,
        search: debouncedSearch,
      });
    }
  }, [
    debouncedSearch,
    filters.sortBy,
    filters.sortOrder,
    filters.dateFrom,
    filters.dateTo,
    filters.minPrice,
    filters.maxPrice,
    filters.category,
    filters.foodType,
    restaurantId,
  ]);

  /* ---------------- EMPTY STATE (NO FILTERS) ---------------- */

  return (
    <div className="lg:px-[5vw] px-5 mb-10">
      <div className="my-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Avalable Dishes ({userRestaurant?.totalDishes})
          </h1>
          <MyUnderLine></MyUnderLine>
        </div>
        <Button
          className="my-gradient-btn"
          onClick={() => setOpenDishDialog((prev) => !prev)}
        >
          <Plus></Plus>Add Dish
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm my-5">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by dish name, category.."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4  dark:bg-gray-700"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Select
              value={filters.category}
              onValueChange={(val) => handleFilterChange("category", val)}
            >
              <SelectTrigger className="w-full pl-10 pr-4 dark:bg-gray-700">
                <SelectValue placeholder="Select category"></SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {["All", ...categoryOptions].map((category, idx) => (
                    <SelectItem key={idx + category} value={category}>
                      {category === "All" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Food Type Filter */}
          <div className="relative">
            <ChefHat className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Select
              value={filters.foodType}
              onValueChange={(val) => handleFilterChange("foodType", val)}
            >
              <SelectTrigger className="w-full pl-10 pr-4 dark:bg-gray-700">
                <SelectValue placeholder="Select your vehicle type"></SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {["All", ...foodTypeOptions.filter((f) => f !== "Both")].map(
                    (category, idx) => (
                      <SelectItem key={idx + category} value={category}>
                        {category === "All" ? "All Food Type" : category}
                      </SelectItem>
                    ),
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="relative">
            <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={(value) => {
                const [field, order] = value.split("-");
                handleFilterChange("sortBy", field);
                handleFilterChange("sortOrder", order);
              }}
            >
              <SelectTrigger className="w-full pl-10 pr-4 dark:bg-gray-700">
                <SelectValue placeholder="Select your vehicle type"></SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                  <SelectItem value="dishName-asc">Dish Name A-Z</SelectItem>
                  <SelectItem value="dishName-desc">Dish Name Z-A</SelectItem>
                  <SelectItem value="rating-desc">Highest Rated</SelectItem>
                  <SelectItem value="rating-asc">Lowest Rated</SelectItem>
                  <SelectItem value="unitSold-desc">Most Popular</SelectItem>
                  <SelectItem value="unitSold-asc">Least Popular</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Price Filter */}
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            />

            <Input
              type="number"
              min={0}
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            {filterSelected && (
              <Button
                variant="outline"
                className="w-fit md:m-0"
                onClick={resetFilters}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Results count */}
      {!loading.getRestaurantMenu && (
        <div className="text-sm flex gap-10 items-center my-5">
          <p className="text-gray-600 dark:text-gray-400">
            {totalCount > 0
              ? `Found ${totalCount} restaurant${totalCount !== 1 ? "s" : ""}`
              : "No dishes found"}
            {filterSelected && (
              <span className="ml-1 text-sm">with current filters</span>
            )}
          </p>
        </div>
      )}
      {loading.getRestaurantMenu   ? (
        <CardSkeletonPage></CardSkeletonPage>
      ) : menu && menu.length < 1 ? (
        <div className="flex h-90">
          <EmptyState
            title="No dishes found"
            message="Try adjusting your search or filter criteria."
            icon={<Building className="mx-auto h-12 w-12 text-gray-400" />}
          ></EmptyState>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="mb-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {menu?.map((dish: DishType) => (
              <OwnerDishCard key={dish?._id} dish={dish}></OwnerDishCard>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onClickFn={handlePagination}
            limit={limit}
          />
        </div>
      )}

      <AddDish
        open={openDishDialog}
        onOpenChange={() => setOpenDishDialog(false)}
      ></AddDish>
    </div>
  );
};

export default Menu;

type OwnerDishCardProps = {
  dish: DishType;
};

export const OwnerDishCard = ({ dish }: OwnerDishCardProps) => {
  const { toggleDishAvailability,loading } = useDishStore();

  const [selectedDish, setSelectedDish] = useState<DishType | undefined>();
  const [editOpen, setEditOpen] = useState<boolean>(false);

  const [openAvailabilityConfirmBox, setOpenAvailabilityConfirmBox] =
    useState<boolean>(false);
  const [selectedAvailabilty, setSelectedAvailability] = useState<boolean>(
    dish.isAvailable,
  );

  function checkedChangeHandler() {
    setOpenAvailabilityConfirmBox(true);
    setSelectedAvailability((prev) => !prev);
  }

  return (
    <div
      key={dish._id}
      className={`group bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col justify-between h-full ${
        !dish.isAvailable ? "opacity-60" : ""
      }`}
    >
      <div className="relative h-full flex flex-col">
        {/* Image Container */}
        <div className={`relative overflow-hidden`}>
          <img
            src={dish.imageUrl || RESTAURANT_DEFAULT_IMAGE}
            alt={dish.name}
            className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges */}
          <StatusTag status={dish.isAvailable ? "Available" : "Unavailable"} />
          <FoodTypeTag foodType={dish.isVeg ? "Pure Veg" : "Non Veg"} />
          {dish.ratingCount > 0 && (
            <RatingTag avgRating={dish.avgRating.toString()}></RatingTag>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 justify-between">
          {/* Header Section */}
          <h3 className="mb-1 font-bold text-xl dark:text-white text-gray-900">
            {dish.name}
          </h3>

          {/* Description */}
          <p className="text-sm mb-4 leading-relaxed line-clamp-4 dark:text-gray-300 text-gray-600">
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
                ₹{dish.costPrice}
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

          {dish.orderCount > 0 && dish.totalUnitsSold > 0 && (
            <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-5 flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <ShoppingBag className="w-4 h-4 text-green-600 dark:text-green-400" />
              
              <span>
                Over {Math.round(dish.totalUnitsSold / 10) * 10}+ plates served
                to {Math.round(dish.orderCount / 10) * 10}+ satisfied customers
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="mb-6 flex items-center gap-5">
          Toogle Availability
          <Switch
            onCheckedChange={checkedChangeHandler}
            defaultChecked={dish.isAvailable}
            checked={selectedAvailabilty}
            disabled={loading.toggleDishAvailabilityBtn}
          ></Switch>
        </div>

        <Button
          onClick={() => {
            setSelectedDish(dish);
            setEditOpen(true);
          }}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg"
        >
          Edit
        </Button>
      </div>

      <EditDish
        selectedDish={selectedDish!}
        open={editOpen}
        onOpenChange={() => setEditOpen((prev) => !prev)}
      ></EditDish>

      <ConfirmBox
        open={openAvailabilityConfirmBox}
        onOpenChange={setOpenAvailabilityConfirmBox}
        title="Toggle dish availability"
        message={`Are you sure you want to make ${dish.name} ${
          dish.isAvailable ? "unavailable" : "available"
        }?`}
        onConfirm={() => toggleDishAvailability(dish._id)}
        onCancel={() => setSelectedAvailability((prev) => !prev)}
      ></ConfirmBox>
    </div>
  );
};
