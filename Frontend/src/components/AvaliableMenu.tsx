import { useCartStore } from "@/store/useCartStore";
import { Clock} from "lucide-react";
import { DishCard } from "./shared/DishCard";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { useUserStore } from "@/store/useUserStore";
import { CardSkeletonPage, EmptyState, MyUnderLine, Notify } from "./shared/utilityComponents";
import { UserType } from "@/types/userType";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebounedValue";
import { isFilterSelected } from "@/lib/utils";
import Pagination from "./shared/Pagination";
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
import {
  Building,
  ChefHat,
  Filter,
  Search,
  TrendingUp,
} from "lucide-react";
import { Button } from "./ui/button";
import { categoryOptions } from "@/types/dishType";


const defaultFilters = Object.freeze({
  search: "",
  category: "All",
  foodType: "All",
  sortBy: "createdAt",
  sortOrder: "desc",
  minPrice: "",
  maxPrice: "",
});

const AvailableMenu = ({restaurantId}:{restaurantId:string}) => {

  const { cartRestaurantId } = useCartStore();
  const { restaurantDetails,menu,getRestaurantMenu,restaurantPagination,loading } = useRestaurantStore();
  const { user } = useUserStore();

  const addToCartAllowed =
    !cartRestaurantId || cartRestaurantId === restaurantDetails?._id;
  const resOwnerId = (restaurantDetails?.user as UserType)._id;
  const isOwnerVisit = user?._id === resOwnerId;
  const isRestaurantNotOpen = restaurantDetails?.status !== "Open";

  let alertMsg = {
    title: "",
    content: "",
  };

  if (isOwnerVisit) {
    alertMsg.title = "Owner Action Restricted";
    alertMsg.content = "As the restaurant owner, you can’t place orders from your own menu.";
  } else if (isRestaurantNotOpen) {
    alertMsg.title = `Restaurant ${restaurantDetails?.status}`;
    alertMsg.content = `This restaurant is currently ${restaurantDetails?.status.toLowerCase()}. You can browse the menu but cannot place an order right now.`;
  } else if (!addToCartAllowed) {
    alertMsg.title = "One Restaurant at a Time";
    alertMsg.content =
      "You can only order from one restaurant at a time. Please clear your cart to add items from another restaurant.";
  }

  
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
        getRestaurantMenu(restaurantId, page, limit, {
          ...filters,
          search: debouncedSearch,
        });
      },
      [filters, debouncedSearch, getRestaurantMenu, restaurantId],
    );
  
    /* ---------------- FETCH ---------------- */
  
    useEffect(() => {
      getRestaurantMenu(restaurantId, 1, limit, {
        ...filters,
        search: debouncedSearch,
      });
    }, [
      restaurantId,
      debouncedSearch,
      filters.sortBy,
      filters.sortOrder,
      filters.dateFrom,
      filters.dateTo,
      filters.minPrice,
      filters.maxPrice,
      filters.category,
      filters.foodType,
    ]);

  
  if (user?.role !== "Restaurant_Owner" && !loading.getRestaurantMenu && !filterSelected && totalCount === 0) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-input/110">
          <EmptyState
            title="No Menu Items Available"
            message="Check back later for delicious dishes!"
            icon={<Clock className="w-12 h-12 text-gray-400" />}
          />
      </div>
    );
  }


  return (
    <div className="py-8 md:py-1">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Available Menu
        </h1>
        <MyUnderLine />
      </div>

      {alertMsg.title && alertMsg.content && (
        <Notify
          title={alertMsg.title}
          content={alertMsg.content}
        />
      )}


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
      
      {loading.getRestaurantMenu ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {menu.map((dish) => (
              <DishCard key={dish._id} dish={dish} />
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
    </div>
  );
};
export default AvailableMenu;
