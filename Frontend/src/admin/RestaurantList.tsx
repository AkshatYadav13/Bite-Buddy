import { useState, useEffect,useCallback } from "react";
import { Building, Search, Filter, ChefHat, TrendingUp } from "lucide-react";
import {
  CardSkeletonPage,
  EmptyState,
} from "@/components/shared/utilityComponents";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import Pagination from "@/components/shared/Pagination";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { foodTypeOptions, statusOptions } from "@/schema/restaurantSchema";
import { Button } from "@/components/ui/button";
import RestaurantCard from "./RestaurantCard";
import { useDebouncedValue } from "@/hooks/useDebounedValue";
import { isFilterSelected } from "@/lib/utils";

const defaultFilters:any = Object.freeze({
  search: "",
  status: "All",
  foodType: "All",
  sortBy: "createdAt",
  sortOrder: "desc",
});

const RestaurantList = () => {
  const { restaurants, restaurantPagination, getRestaurants, loading } =
    useRestaurantStore();

  const [filters, setFilters] = useState(defaultFilters);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // debounce only search
  const debouncedSearch = useDebouncedValue(filters.search, 500);

  const filterSelected = isFilterSelected(filters,defaultFilters);

  const handlePagination = useCallback(
    (page: number, limit: number) => {
      getRestaurants(page, limit, {
        ...filters,
        search: debouncedSearch,
      });
    },
    [filters, debouncedSearch, getRestaurants],
  );

  useEffect(() => {
    getRestaurants(1, restaurantPagination?.limit || 10, {
      ...filters,
      search: debouncedSearch,
    });
  }, [
    debouncedSearch,
    filters.status,
    filters.foodType,
    filters.sortBy,
    filters.sortOrder,
  ]);

  function setFiltersToDefault() {
    setFilters(defaultFilters);
  }

  const handleFilterChange = (
    key: keyof typeof defaultFilters,
    value: string,
  ) => {
    setFilters((prev:any) => ({ ...prev, [key]: value }));
  };

  if (!loading.pageLoad && !filterSelected && restaurantPagination?.totalCount === 0) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-input/110">
        <EmptyState
          title="No Restaurants found"
          message="There are currently no restaurants registered on the platform."
          icon={<Building size={48} className="text-gray-500" />}
        />
      </div>
    );
  }

  const { currentPage, totalPages, totalCount, limit } =
    restaurantPagination || {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      limit: 10,
    };

  return (
    <div className="px-3 py-6 md:px-6 lg:px-10 space-y-5 bg-gray-50 dark:bg-input/110">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white pb-2">
        Restaurant Management
      </h1>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm md:flex gap-5">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Search by restaurant name, location, or owner"
              className="w-full pl-10 pr-4  dark:bg-gray-700"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Select
              value={filters.status}
              onValueChange={(val) => handleFilterChange("status", val)}
            >
              <SelectTrigger className="w-full pl-10 pr-4 dark:bg-gray-700">
                <SelectValue placeholder="Select your vehicle type"></SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {["All", ...statusOptions].map((status, idx) => (
                    <SelectItem key={idx + status} value={status}>
                      {status === "All" ? "All Status" : status}
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
                  {["All", ...foodTypeOptions].map((status, idx) => (
                    <SelectItem key={idx + status} value={status}>
                      {status === "All" ? "All Food Type" : status}
                    </SelectItem>
                  ))}
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
                  <SelectItem value="restaurantName-asc">
                    Restaurant Name A-Z
                  </SelectItem>
                  <SelectItem value="restaurantName-desc">
                    Restaurant Name Z-A
                  </SelectItem>
                  <SelectItem value="rating-desc">Highest Rated</SelectItem>
                  <SelectItem value="rating-asc">Lowest Rated</SelectItem>
                  <SelectItem value="orders-desc">Most Orders</SelectItem>
                  <SelectItem value="orders-asc">Least Orders</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        {filterSelected && (
          <Button className="w-fit mt-5 md:m-0" onClick={setFiltersToDefault}>
            Clear
          </Button>
        )}
      </div>

      {/* Results count */}
      {!loading.pageLoad && (
        <div className="text-sm flex gap-10 items-center">
          <p className="text-gray-600 dark:text-gray-400">
            {totalCount > 0
              ? `Found ${totalCount} restaurant${totalCount !== 1 ? "s" : ""}`
              : "No restaurants found"}
            {filterSelected && (
              <span className="ml-1 text-sm">with current filters</span>
            )}
          </p>
        </div>
      )}
      {loading.pageLoad ? (
        <CardSkeletonPage></CardSkeletonPage>
      ) : restaurants && restaurants.length < 1 ? (
        <div className="flex h-90">
          <EmptyState
            title="No restaurants found"
            message="Try adjusting your search or filter criteria."
            icon={<Building className="mx-auto h-12 w-12 text-gray-400" />}
            showBtn={false}
          ></EmptyState>
        </div>
      ) : (
        <div className="space-y-4">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant._id}
              restaurant={restaurant}
              expandedRow={expandedRow}
              toggleRowExpansion={(restaurantId: string) =>
                setExpandedRow(
                  expandedRow === restaurantId ? null : restaurantId,
                )
              }
              ></RestaurantCard>
            ))}
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

export default RestaurantList;
