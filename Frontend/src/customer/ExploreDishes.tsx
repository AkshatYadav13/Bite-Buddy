import { useState, useEffect,useCallback } from "react";
import { Building, Search, Filter, ChefHat, TrendingUp } from "lucide-react";
import {
  CardSkeletonPage,
  EmptyState,
} from "@/components/shared/utilityComponents";
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
import { foodTypeOptions } from "@/schema/restaurantSchema";
import { Button } from "@/components/ui/button";
import { categoryOptions, DishType } from "@/types/dishType";
import { useDishStore } from "@/store/useDishStore";
import { useDebouncedValue } from "@/hooks/useDebounedValue";
import { isFilterSelected } from "@/lib/utils";
import { DishCard } from "@/components/shared/DishCard";

const defaultFilters = Object.freeze({
  search: "",
  category: "All",
  foodType: "All",
  sortBy: "createdAt",
  sortOrder: "desc",
  minPrice: "",
  maxPrice: "",
});

const ExploreDishes = () => {
  const { dishes, dishesPagination, getDishes, loading } = useDishStore();

  const [filters, setFilters] = useState(defaultFilters);
  const debouncedSearch = useDebouncedValue(filters.search, 500);

  const filterSelected = isFilterSelected(filters, defaultFilters);

  const handleFilterChange = (
    key: keyof typeof defaultFilters,
    value: string,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };


  const handlePagination = useCallback(
    (page: number, limit: number) => {
      getDishes(page, limit, {
        ...filters,
        search: debouncedSearch,
      });
    },
    [filters, debouncedSearch, getDishes],
  );

  function applyFilterHandler() {
    getDishes(1, dishesPagination?.limit || 10, {
      ...filters,
      search: debouncedSearch,
    });
  }

  function clearFilterHandler() {
    setFilters(defaultFilters);
    getDishes(1, dishesPagination?.limit || 10);
  }

  useEffect(() => {
    getDishes(1, dishesPagination?.limit || 10);
  }, []);

  if (!loading.pageLoad && !filterSelected && dishesPagination?.totalCount === 0) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-input/110">
        <EmptyState
          title="No Dishes found"
          message="There are currently no dishes registered on the platform."
          icon={<Building size={48} className="text-gray-500" />}
        />
      </div>
    );
  }

  const { currentPage, totalPages, totalCount, limit } = dishesPagination || {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  };

  return (
    <div className="px-3 py-6 md:px-6 lg:px-10 space-y-5 bg-gray-50 dark:bg-input/110">
      <h1 className="text-2xl font-bold pb-2">Find Your Next Favorite Place</h1>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
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
            <Button className="w-fit md:m-0" onClick={applyFilterHandler}>
              Apply
            </Button>
            {filterSelected && (
              <Button
                variant="outline"
                className="w-fit md:m-0"
                onClick={clearFilterHandler}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Results count */}
      {!loading.pageLoad && (
        <div className="text-sm flex gap-10 items-center">
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
      {loading.pageLoad ? (
        <CardSkeletonPage></CardSkeletonPage>
      ) : dishes && dishes.length < 1 ? (
        <div className="flex h-90">
          <EmptyState
            title="No dishes found"
            message="Try adjusting your search or filter criteria."
            icon={<Building className="mx-auto h-12 w-12 text-gray-400" />}
            showBtn={false}
          ></EmptyState>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="mb-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {dishes?.map((dish: DishType) => (
              <DishCard key={dish?._id} dish={dish}></DishCard>
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

export default ExploreDishes;
