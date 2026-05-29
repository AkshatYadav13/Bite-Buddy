import { useState, useEffect, useCallback } from "react";
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
import {
  applicationStatusOptions,
  foodTypeOptions,
} from "@/schema/restaurantSchema";
import { Button } from "@/components/ui/button";
import ApplicationCard from "./ApplicationCard";
import { useApplicationStore } from "@/store/useApplicationStore";
import { ApplicationStatus } from "@/types/applicationType";
import { isFilterSelected } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/useDebounedValue";

const defaultFilters = Object.freeze({
  search: "",
  status: "All",
  foodType: "All",
  sortBy: "createdAt",
  sortOrder: "desc",
});

const RestaurantApplicationList = () => {
  const {
    restaurantApplications,
    resAppPagination,
    getRestaurantApplications,
    loading,
    updateApplicationStatus,
  } = useApplicationStore();

  const [filters, setFilters] = useState(defaultFilters);

  // debounce only search
  const debouncedSearch = useDebouncedValue(filters.search, 500);

  const filterSelected = isFilterSelected(filters, defaultFilters);

  const handleFilterChange = (
    key: keyof typeof defaultFilters,
    value: string,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  function setFiltersToDefault() {
    setFilters(defaultFilters);
  }

  const handlePagination = useCallback(
    (page: number, limit: number) => {
      getRestaurantApplications(page, limit, {
        ...filters,
        search: debouncedSearch,
      });
    },
    [filters, debouncedSearch, getRestaurantApplications],
  );

  useEffect(() => {
    getRestaurantApplications(1, resAppPagination?.limit || 10, {
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

  function handleStatusUpdate(
    applicationId: string,
    status: ApplicationStatus,
    reason?: string,
  ) {
    updateApplicationStatus(applicationId, status, reason);
  }

  if (!loading.pageLoad && !filterSelected && resAppPagination?.totalCount === 0) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-input/110">
        <EmptyState
          title="No Restaurants Applications"
          message="There are currently no restaurant applications."
          icon={<Building size={48} className="text-gray-500" />}
        />
      </div>
    );
  }

  const { currentPage, totalPages, totalCount, limit } = resAppPagination || {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  };

  return (
    <div className="px-3 py-6 md:px-6 lg:px-10 space-y-6 bg-gray-50 dark:bg-input/110">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Restaurant Applications
      </h1>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm md:flex gap-5">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by restaurant name, locations, or owner."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
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
                  {["All", ...applicationStatusOptions].map((status, idx) => (
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
        <div className="flex gap-10 items-center">
          <p className="text-gray-600 dark:text-gray-400">
            {totalCount > 0
              ? `Found ${totalCount} restaurant application${totalCount !== 1 ? "s" : ""}`
              : "No restaurant applications found"}
            {filterSelected && (
              <span className="ml-1 text-sm">with current filters</span>
            )}
          </p>
        </div>
      )}
      {loading.pageLoad ? (
        <CardSkeletonPage></CardSkeletonPage>
      ) : restaurantApplications && restaurantApplications.length < 1 ? (
        <div className="flex h-90">
          <EmptyState
            title="No Restaurant Applications"
            message="Try adjusting your search or filter criteria."
            icon={<Building className="mx-auto h-12 w-12 text-gray-400" />}
            showBtn={false}
          ></EmptyState>
        </div>
      ) : (
        <div className="space-y-4">
          {restaurantApplications.map((application) => (
            <ApplicationCard
              key={application._id}
              application={application}
              type="restaurant"
              onStatusUpdate={handleStatusUpdate}
              showActions={
                application.status === "Pending" || application.isDeletable
              }
            ></ApplicationCard>
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

export default RestaurantApplicationList;
