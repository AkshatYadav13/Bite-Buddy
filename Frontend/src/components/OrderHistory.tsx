import { useEffect, useState, useCallback } from "react";
import { Search, PackageSearch } from "lucide-react";

import Pagination from "@/components/shared/Pagination";
import {
  CardSkeletonPage,
  EmptyState,
} from "@/components/shared/utilityComponents";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebounedValue";
import { getTargetId, isFilterSelected } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useOrderStore } from "@/store/useOrderStore";
import { useUserStore } from "@/store/useUserStore";
import StaticOrderCard from "@/components/StaticOrder";

/* ---------------- DEFAULT FILTERS ---------------- */

const orderHistoryEmptyMsgMap: Record<string, { title: string; message: string }> = {
  Restaurant_Owner: {
    title: "No Order History",
    message:
      "You don’t have any completed or cancelled orders yet. Once orders are fulfilled or cancelled, they’ll appear here.",
  },
  Customer: {
    title: "No Past Orders",
    message:
      "You haven’t placed any orders yet. Once you complete an order, it will show up here.",
  },
  Delivery_Agent: {
    title: "No Delivery History",
    message:
      "You haven’t completed any deliveries yet. Your past deliveries will be listed here.",
  },
  Admin: {
    title: "No Order Records",
    message:
      "There are no completed or cancelled orders available at the moment. Order records will appear here once activity begins.",
  },
};


const defaultFilters = Object.freeze({
  searchQuery: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  dateFrom: "",
  dateTo: "",
  minAmount: "",
  maxAmount: "",
});

const OrderHistory = () => {
  const { ordersHistory, orderPagination, loading, getOrderHistory } =
    useOrderStore();
  const { user } = useUserStore();
  const [expandedOrder, setExpandedOrder] = useState<string | null>("");

  const toggleExpand = (orderId: string) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  const [filters, setFilters] = useState<any>(defaultFilters);

  const debouncedSearch = useDebouncedValue(filters.searchQuery, 500);
  const filterSelected = isFilterSelected(filters, defaultFilters);

  const { currentPage, totalPages, totalCount, limit } = orderPagination || {
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

  const taregtId = getTargetId();

  const handlePagination = useCallback(
    (page: number, limit: number) => {
      if (user?.role && taregtId) {
        getOrderHistory(user?.role!, taregtId, page, limit, {
          ...filters,
          search: debouncedSearch,
        });
      }
    },
    [filters, debouncedSearch, getOrderHistory, user?.role, taregtId],
  );

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    if (user?.role && taregtId) {
      getOrderHistory(user?.role, taregtId, 1, limit, {
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
    filters.minAmount,
    filters.maxAmount,
    user?.role,
    taregtId,
  ]);

  /* ---------------- EMPTY STATE (NO FILTERS) ---------------- */
  if(!user) return

  if (!loading.pageLoad && !filterSelected && totalCount === 0) {
    return (
      <div className="flex h-screen bg-gray-50">
          <EmptyState
            icon={<PackageSearch size={48} className="text-gray-500" />}
            title={orderHistoryEmptyMsgMap[user.role]?.title}
            message={orderHistoryEmptyMsgMap[user.role]?.message}
          />
      </div>
    );
  }

  return (
    <div className="px-3 py-6 md:px-6 lg:px-10 space-y-6 bg-gray-50 dark:bg-input/110">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Orders History
      </h1>

      {/* ---------------- FILTER BAR ---------------- */}
      <div className="bg-white dark:bg-gray-800 p-4 pt-1 rounded-lg border shadow-sm md:flex gap-5">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Search */}

          <div>
            <Label className=" block text-sm font-medium mb-1">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                className="pl-10 pr-3"
                placeholder="Search customer, agent or address"
                value={filters.searchQuery}
                onChange={(e) =>
                  handleFilterChange("searchQuery", e.target.value)
                }
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-1">Date From</Label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
            />
          </div>

          <div>
            <Label className="block text-sm font-medium mb-1">Date To</Label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value })
              }
            />
          </div>

          <div>
            <Label className="block text-sm font-medium mb-1">Min Amount</Label>
            <Input
              type="number"
              placeholder="₹0"
              value={filters.minAmount}
              onChange={(e) =>
                setFilters({ ...filters, minAmount: e.target.value })
              }
            />
          </div>

          <div>
            <Label className="block text-sm font-medium  mb-1">
              Max Amount
            </Label>
            <Input
              type="number"
              placeholder="₹10000"
              value={filters.maxAmount}
              onChange={(e) =>
                setFilters({ ...filters, maxAmount: e.target.value })
              }
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <Label className="block text-sm font-medium  mb-1">Sort By</Label>
            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={(value) => {
                const [field, order] = value.split("-");
                handleFilterChange("sortBy", field);
                handleFilterChange("sortOrder", order);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort orders" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                  <SelectItem value="grandTotal-desc">
                    Amount High → Low
                  </SelectItem>
                  <SelectItem value="grandTotal-asc">
                    Amount Low → High
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filterSelected && (
          <Button className="mt-7" onClick={resetFilters}>
            Clear
          </Button>
        )}
      </div>

      {/* ---------------- RESULT COUNT ---------------- */}
      {!loading.pageLoad && (
        <p className="text-gray-600 dark:text-gray-400">
          {totalCount > 0
            ? `Found ${totalCount} order${totalCount > 1 ? "s" : ""}`
            : "No orders found"}
          {filterSelected && (
            <span className="ml-1 text-sm">with current filters</span>
          )}
        </p>
      )}

      {/* ---------------- CONTENT ---------------- */}
      {loading.pageLoad ? (
        <CardSkeletonPage />
      ) : ordersHistory.length < 1 ? (
        <EmptyState
          title="No Orders Found"
          message="Try adjusting your search or filter criteria."
        />
      ) : (
        <div className="space-y-4">
          {ordersHistory.map((order) => (
            <StaticOrderCard
              order={order}
              key={order._id}
              isOpen={expandedOrder === order._id}
              onToggle={() => toggleExpand(order._id)}
            ></StaticOrderCard>
          ))}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            limit={limit}
            onClickFn={handlePagination}
          />
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
