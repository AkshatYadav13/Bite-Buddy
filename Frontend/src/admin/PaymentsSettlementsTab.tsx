import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Building,
  Receipt,
  Package,
  Loader2,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import {
  TransactionFilterType,
  TransactionReason,
  TransactionUserType,
} from "@/types/transactionType";
import { getTargetId, isFilterSelected, toIndianDateFormat } from "@/lib/utils";
import { useTransactionStore } from "@/store/useTransactionStore";
import TableSkeleton, {
  EmptyState,
  StatsCardSkeletonPage,
  StatusBadge,
} from "@/components/shared/utilityComponents";
import Pagination from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebounedValue";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ViewOrderDetailsDialog from "./ViewOrderDetailsDialog";
import { useOrderStore } from "@/store/useOrderStore";
import { Card, CardContent } from "@/components/ui/card";
import { useUserStore } from "@/store/useUserStore";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { useDeliveryAgentStore } from "@/store/useDeliveryAgentStore";
import { useAdminStore } from "@/store/useAdminStore";

const defaultFilters: TransactionFilterType = Object.freeze({
  searchQuery: "",
  dateRange: "ALL",
  customDateFrom: "",
  customDateTo: "",
  status: "ALL",
  userType: "ALL",
  reason: "ALL",
  minAmount: "",
  maxAmount: "",
  orderId: "",
  userId: "",
});

const PaymentsSettlementsTab = () => {
  const {
    transactionPagination,
    getAllTransactions,
    loading,
    transactionsData,
    markTransactionPaid,
  } = useTransactionStore();

  const { stats } = useAdminStore();

  const {
    singleOrder,
    getSingleOrderDetails,
    loading: orderLoading,
  } = useOrderStore();

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [openViewOrderDialog, setOpenViewOrderDialog] = useState(false);

  const [filters, setFilters] = useState<TransactionFilterType>(defaultFilters);

  const debouncedSearchQuery = useDebouncedValue(filters.searchQuery, 500);

  const filterSelected = isFilterSelected(filters, defaultFilters);

  const { user } = useUserStore();
  const { userRestaurant } = useRestaurantStore();
  const { deliveryAgentDetails } = useDeliveryAgentStore();

  const [selectedTransactionId, setSelectedTransactionId] = useState<string>("");

  if (
    !user ||
    (user.role === "Restaurant_Owner" && !userRestaurant) ||
    (user.role === "Delivery_Agent" && !deliveryAgentDetails)
  )
    return null;

  /* -------------------- TARGET ID -------------------- */

  const targetId = getTargetId();

  /* -------------------- PAGINATION -------------------- */
  const { currentPage, totalPages, totalCount, limit } =
    transactionPagination || {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      limit: 10,
    };

  const setFiltersToDefault = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleFilterChange = useCallback((key: any, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handlePagination = useCallback(
    (page: number, pageLimit: number) => {
      if (!targetId) return;

      getAllTransactions(user.role, targetId, page, pageLimit, {
        ...filters,
        searchQuery: debouncedSearchQuery,
      });
    },
    [user.role, targetId, filters, debouncedSearchQuery, getAllTransactions],
  );

  const viewOrderHandler = useCallback(
    async (orderId: string) => {
      setSelectedTransactionId(orderId)
      const opened = await getSingleOrderDetails(orderId);
      setSelectedTransactionId("")
      setOpenViewOrderDialog(opened);
    },
    [getSingleOrderDetails],
  );

  const markTransactionPaidHandler = async (id:string) => {
    setSelectedTransactionId(id);
    await markTransactionPaid(id);
    setSelectedTransactionId("");    
  };

  /* -------------------- EFFECT -------------------- */
  useEffect(() => {
    if (!targetId) return;

    getAllTransactions(user.role, targetId, 1, limit, {
      ...filters,
      searchQuery: debouncedSearchQuery,
    });
  }, [filters, debouncedSearchQuery, targetId]);

  /* -------------------- HELPERS -------------------- */

  const getUserTypeColor = useCallback((type: TransactionUserType) => {
    switch (type) {
      case "Restaurant":
        return "bg-purple-100 text-purple-800";
      case "Customer":
        return "bg-blue-100 text-blue-800";
      case "Delivery":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  const transactions = transactionsData?.list;

  const getReasonText = useCallback((reason: TransactionReason) => {
    return reason === "Order_Delivered" ? "Order Delivered" : "Refund";
  }, []);

  if (
    !loading.getAllTransactions &&
    !filterSelected &&
    transactions?.length === 0
  ) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-input/110">
        <EmptyState
          title="No Transactions Found"
          message="Payments and settlements will appear here once transactions are created."
          icon={<Receipt size={48} className="text-muted-foreground" />}
        />
      </div>
    );
  }

  return (
    <div
      className={`${user.role === "Customer" ? "max-w-6xl mx-auto my-10" : ""} w-full h-full overflow-auto`}
    >
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm  text-center text-gray-700 dark:text-white">
          Manage all transaction processes and settlements
        </p>
      </div>

      {/* Stats Cards */}
      {loading.getTransactionsStats ? (
        <StatsCardSkeletonPage />
      ) : transactionsData?.list ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Pending */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total Pending
                </span>
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>

              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{transactionsData?.summary?.pendingAmt}
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {transactionsData?.summary?.pendingCount} transactions
              </p>
            </CardContent>
          </Card>

          {/* Total Paid */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total Paid
                </span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>

              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ₹{transactionsData?.summary?.paidAmt}
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {transactionsData?.summary?.paidCount} transactions
              </p>
            </CardContent>
          </Card>

          {/* Active Settlements */}
          {user.role === "Admin" && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Active Settlements
                  </span>
                  <Package className="w-5 h-5 text-purple-500" />
                </div>

                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.transactionStats.total?.activeSettlementsCount}
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Requires attention
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}

      {/* Filters Section */}

      <div className="overflow-hidden mb-6 rounded-lg shadow-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Filters
            </h2>
          </div>

          {/* Primary Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by restaurant, agent, or customer name"
                  className="w-full h-10 pl-10 pr-3 rounded-lg border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={filters.searchQuery}
                  onChange={(e) =>
                    handleFilterChange("searchQuery", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date Range
              </label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={filters.dateRange}
                onChange={(e) =>
                  handleFilterChange("dateRange", e.target.value)
                }
              >
                <option value="ALL">All</option>
                <option value="today">Today</option>
                <option value="last7days">Last 7 days</option>
                <option value="last30days">Last 30 days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="ALL">All</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            {/* User Type */}
            {user.role === "Admin" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User Type
                </label>
                <select
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600
                          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={filters.userType}
                  onChange={(e) =>
                    handleFilterChange("userType", e.target.value)
                  }
                >
                  <option value="ALL">All</option>
                  <option value="Customer">Customer</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Delivery">Delivery Agent</option>
                </select>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Transaction Reason
              </label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={filters.reason}
                onChange={(e) => handleFilterChange("reason", e.target.value)}
              >
                <option value="ALL">All</option>
                <option value="Order_Delivered">Order Delivered</option>
                <option value="Order_Cancel_Refund">Order Canceled</option>
              </select>
            </div>

            {/* Custom Date */}
            {filters.dateRange === "custom" && (
              <>
                {["From", "To"].map((label, i) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {label} Date
                    </label>
                    <input
                      type="date"
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={
                        i === 0 ? filters.customDateFrom : filters.customDateTo
                      }
                      onChange={(e) =>
                        handleFilterChange(
                          i === 0 ? "customDateFrom" : "customDateTo",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Advanced Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {showAdvancedFilters ? <ChevronUp /> : <ChevronDown />}
            {showAdvancedFilters ? "Hide" : "Show"} Advanced Filters
          </button>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                ["Min Amount (₹)", "minAmount"],
                ["Max Amount (₹)", "maxAmount"],
                ["Order ID", "orderId"],
                ["User ID", "userId"],
              ].map(([label, key]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                  </label>
                  <input
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={(filters as any)[key]}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 flex justify-end bg-gray-50 dark:bg-input/35 ">
          <Button onClick={setFiltersToDefault} variant="outline">
            Clear All Filters
          </Button>
        </div>
      </div>

      {loading.getAllTransactions ? (
        <TableSkeleton></TableSkeleton>
      ) : transactions?.length === 0 ? (
        <div className="flex h-90">
          <EmptyState
            title="No Matching Transactions"
            message="Try adjusting your filters to see results."
            icon={<Building className="mx-auto h-12 w-12 text-gray-400" />}
            showBtn={false}
          ></EmptyState>
        </div>
      ) : (
        <div className="space-y-4">
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

          {/* Transactions Table */}

          <div className="rounded-lg border border-border bg-background shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted border-b border-border">
                  <TableRow>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      S.N
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      User Details
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Order ID
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Amount
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Reason
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </TableHead>

                    {user.role === "Admin" ? (
                      <>
                        <TableHead className="gap-2 px-6 py-5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          <div className="flex gap-2">
                            <span>Recieved At </span>
                            <ArrowDown className="w-5 h-5" />
                          </div>
                        </TableHead>

                        <TableHead className=" px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          <div className="flex gap-2">
                            <span>Paid At</span>
                            <ArrowUp className="w-5 h-5" />
                          </div>
                        </TableHead>
                      </>
                    ) : user.role === "Customer" ? (
                      <>
                        <TableHead className="gap-2 px-6 py-5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          <div className="flex gap-2">
                            <span>Paid At </span>
                            <ArrowUp className="w-5 h-5" />
                          </div>
                        </TableHead>

                        <TableHead className=" px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          <div className="flex gap-2">
                            <span>Recieved At</span>
                            <ArrowDown className="w-5 h-5" />
                          </div>
                        </TableHead>
                      </>
                    ) : user.role === "Delivery_Agent" ||
                      user.role === "Restaurant_Owner" ? (
                      <TableHead className=" px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <div className="flex gap-2">
                          <span>Recieved At</span>
                          <ArrowDown className="w-5 h-5" />
                        </div>
                      </TableHead>
                    ) : null}

                    {
                      <TableHead className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </TableHead>
                    }
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-border">
                  {transactions?.map((transaction, index) => (
                    <TableRow
                      key={transaction._id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="px-6 py-4 text-sm font-mono text-foreground">
                        {index + 1}
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {transaction.userType === "Customer" ||
                            transaction.userType === "Delivery"
                              ? transaction.userId?.fullName
                              : transaction.userId?.restaurantName}
                          </span>
                          <span
                            className={`inline-flex w-fit mt-1 px-2 py-0.5 rounded text-xs font-medium ${getUserTypeColor(
                              transaction.userType,
                            )}`}
                          >
                            {transaction.userType}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4 text-sm font-medium text-primary">
                        {transaction.orderId}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-sm font-semibold text-foreground">
                        ₹{transaction.amount.toFixed(2)}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                        {getReasonText(transaction.reason)}
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <StatusBadge status={transaction.status} />
                      </TableCell>

                      {(user.role === "Admin" || user.role === "Customer") && (
                        <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                          {toIndianDateFormat(transaction.recievedAt)}
                        </TableCell>
                      )}

                      <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                        {transaction.paidAt
                          ? toIndianDateFormat(transaction.paidAt)
                          : "-"}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          {user.role === "Admin" &&
                            transaction.status === "Pending" && (
                              <Button
                                onClick={() =>
                                  markTransactionPaidHandler(transaction._id)
                                }
                                className="px-3 py-1 rounded text-xs font-medium
                               bg-green-600 text-white hover:bg-green-700
                               dark:bg-green-500 dark:hover:bg-green-600"
                                disabled={loading.markTransactionPaidBtn && selectedTransactionId===transaction._id}
                              >
                                {(loading.markTransactionPaidBtn && selectedTransactionId===transaction._id) ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin"></Loader2>
                                ) : (
                                  "Mark Paid"
                                )}
                              </Button>
                            )}
                          <Button
                            onClick={() =>
                              viewOrderHandler(transaction.orderId)
                            }
                            className="px-3 py-1 rounded text-xs font-medium
                             bg-muted text-foreground hover:bg-muted/80"
                            disabled={orderLoading.getSingleOrderDetails && selectedTransactionId===transaction._id}
                          >
                            {(orderLoading.getSingleOrderDetails && selectedTransactionId===transaction._id) ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin"></Loader2>
                            ) : (
                              "View Details"
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
      {singleOrder && (
        <ViewOrderDetailsDialog
          open={openViewOrderDialog}
          setOpen={() => setOpenViewOrderDialog(false)}
          order={singleOrder}
          loading={orderLoading.getSingleOrderDetails}
        ></ViewOrderDetailsDialog>
      )}
    </div>
  );
};

export default PaymentsSettlementsTab;
