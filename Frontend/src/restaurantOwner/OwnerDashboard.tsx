import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Star,
  Clock,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Award,
  ChefHat,
  BarChart3,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  IndianRupee,
  Target,
  TrendingDown,
  Activity,
  Utensils,
  ChartColumn,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  AreaChart,
  Area,
} from "recharts";
import {
  EmptyState,
  getStatusColor,
  InvalidAccess,
  PageSkeleton,
  StatusBadge,
  TabButton,
} from "@/components/shared/utilityComponents";
import { formatCurrency, toIndianDateFormat } from "@/lib/utils";
import { StatCard } from "@/components/shared/StatsCard";
import { useRestaurantStore } from "@/store/useRestaurantStore";
import { statusOptions } from "@/schema/restaurantSchema";
import { RestaurantStatus } from "@/types/restaurantType";
import ConfirmBox from "@/components/shared/ConfirmBox";
import PaymentsSettlementsTab from "@/admin/PaymentsSettlementsTab";

const DashboradHeader = () => {
  const { userRestaurant, updateRestaurantStatus } = useRestaurantStore();
  const [selectedStatus, setSelectedStatus] = useState<RestaurantStatus>(
    userRestaurant?.status!,
  );
  const [openStatusConfirmBox, setOpenStausComfirmBox] = useState(false);
  const ownerEmail = useRestaurantStore().stats?.profile.owner.email;

  function statusChangeHandler(newStatus: RestaurantStatus) {
    setOpenStausComfirmBox(true);
    setSelectedStatus(newStatus);
  }

  function getStatusMessage(status: RestaurantStatus) {
    switch (status) {
      case "Open":
        return "Your restaurant will start accepting new orders from customers.";
      case "Closed":
        return "Your restaurant will stop accepting new orders.";
      case "Busy":
        return "Your restaurant will temporarily stop accepting new orders due to high load.";
      default:
        return `Are you sure you want to update the restaurant status to ${selectedStatus}`;
    }
  }

  if (!userRestaurant) {
    return <InvalidAccess></InvalidAccess>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-6 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
        {/* Left side: logo + info */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="hidden w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl sm:flex items-center justify-center">
            <Store className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-5 mb-2">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {userRestaurant.restaurantName}
              </h1>
              <StatusBadge status={userRestaurant.status}></StatusBadge>
            </div>
            <div className="flex flex-wrap gap-3 text-gray-600 dark:text-gray-400 text-sm">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {userRestaurant.location.address}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                {userRestaurant.avgRating} ({userRestaurant.ratingCount}{" "}
                reviews)
              </div>
              <div className="flex items-center gap-1">
                <ChefHat className="h-4 w-4" />
                {userRestaurant.totalDishes} dishes
              </div>
            </div>
          </div>
        </div>

        {/* Right side: join date */}
        <div className="text-sm text-gray-500 dark:text-gray-400 sm:text-right">
          <p>Member since</p>
          <p className="font-medium text-gray-800 dark:text-white">
            {new Date(userRestaurant?.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-[5fr_1fr] gap-y-6 gap-x-14 items-end">
        {/* Contact + Cuisine Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-gray-400" />
            <span>{userRestaurant.contact}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="break-all">{ownerEmail}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Utensils className="h-4 w-4 text-gray-400" />
            <span className="break-words">
              {userRestaurant.cuisines.join(", ")}
            </span>
          </div>
        </div>

        <div>
          <Label className="">Update Status</Label>
          <Select
            defaultValue={selectedStatus}
            value={selectedStatus}
            onValueChange={statusChangeHandler}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Status"></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {statusOptions.map((status, idx) => (
                  <SelectItem key={idx} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <ConfirmBox
        open={openStatusConfirmBox}
        onOpenChange={setOpenStausComfirmBox}
        title="Update Restaurant Status"
        message={getStatusMessage(selectedStatus)}
        onConfirm={() =>
          updateRestaurantStatus(userRestaurant?._id!, selectedStatus)
        }
        onCancel={() => setSelectedStatus(userRestaurant?.status!)}
      />
    </div>
  );
};

const RestaurantOwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { loading, stats, getRestaurantStats } = useRestaurantStore();

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  useEffect(() => {
    getRestaurantStats();
  }, []);

  const weeklyEarningsData = stats?.earnings.weeklyEarnings

  // const weeklyEarningsData = [
  //   { day: "Mon", earnings: 1200 },
  //   { day: "Tue", earnings: 1800 },
  //   { day: "Wed", earnings: 1500 },
  //   { day: "Thu", earnings: 2200 },
  //   { day: "Fri", earnings: 3000 },
  //   { day: "Sat", earnings: 4200 },
  //   { day: "Sun", earnings: 3800 },
  // ];

  const monthlyEarningsData = stats?.earnings.monthlyTrend

  // const monthlyEarningsData = [
  //   { month: "Jan", earnings: 32000 },
  //   { month: "Feb", earnings: 28000 },
  //   { month: "Mar", earnings: 35000 },
  //   { month: "Apr", earnings: 40000 },
  //   { month: "May", earnings: 42000 },
  //   { month: "Jun", earnings: 45000 },
  //   { month: "Jul", earnings: 47000 },
  //   { month: "Aug", earnings: 52000 },
  //   { month: "Sep", earnings: 48000 },
  //   { month: "Oct", earnings: 55000 },
  //   { month: "Nov", earnings: 60000 },
  //   { month: "Dec", earnings: 70000 },
  // ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-input/110 p-6">
      {loading.pageLoad ? (
        <PageSkeleton></PageSkeleton>
      ) : stats === null ? (
        <EmptyState
          title="No Stats Available"
          message="There are currently no statistics to display. Please check back later or ensure data is being tracked properly."
          icon={<ChartColumn className="w-12 h-12 text-gray-400" />}
          actionLabel="Go Back"
          actionLink="/"
          showBtn={true}
        />
      ) : (
        <div className="max-w-7xl mx-auto space-y-6">
          <DashboradHeader></DashboradHeader>

          {/* Navigation Tabs */}
          <div className="bg-white dark:bg-gray-900  border-b border-gray-200 dark:border-gray-700">
            <nav className="flex max-w-140 overflow-x-scroll my-scrollbar sm:overflow-auto sm:max-w-full">
              {[
                "overview",
                "earnings",
                "orders",
                "ratings",
                "dishes",
                "Payments & Settlements",
              ].map((tab) => (
                <TabButton
                  key={tab}
                  id={tab}
                  isActive={activeTab === tab}
                  onClick={setActiveTab}
                />
              ))}
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Today's Earnings"
                  value={formatCurrency(stats.earnings.today)}
                  icon={IndianRupee}
                  description="Revenue generated today"
                  color="green"
                />
                <StatCard
                  title="Total Orders"
                  value={stats.orderStats.totalOrders.toLocaleString()}
                  icon={ShoppingCart}
                  description={`${stats.orderStats.deliveredOrders} delivered`}
                  color="blue"
                />
                <StatCard
                  title="Avg Order Value"
                  value={formatCurrency(stats.orderStats.avgOrderValue)}
                  icon={Target}
                  description="Per order average"
                  color="purple"
                />
                <StatCard
                  title="Customer Rating"
                  value={`${stats.ratings.avgRating}/5`}
                  icon={Star}
                  description={`${stats.ratings.totalRatings} total ratings`}
                  color="yellow"
                />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.orderStats.recentOrders.map((order, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex-wrap gap-y-2"
                        >
                          <div>
                            <p className="font-medium">{order.id}</p>
                            <p className="text-sm text-gray-500">
                              {order.customer} • {order.items} items
                            </p>
                            <p className="text-xs text-gray-400">
                              {toIndianDateFormat(order.time)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-medium">
                              {formatCurrency(order.amount)}
                            </p>
                            <Badge
                              className={getStatusColor(order.status)}
                              variant="secondary"
                            >
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Top Performing Dishes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.orderStats.topDishes
                        .slice(0, 5)
                        .map((dish, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-orange-800 dark:text-orange-200">
                                  #{index + 1}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{dish.name}</p>
                                <p className="text-sm text-gray-500">
                                  {dish.orders} units sold
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {formatCurrency(dish.revenue)}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Earnings Tab */}
          {activeTab === "earnings" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Today's Earnings"
                  value={formatCurrency(stats.earnings.today)}
                  icon={IndianRupee}
                  description="Revenue generated today"
                  color="green"
                />
                <StatCard
                  title="This Week"
                  value={formatCurrency(stats.earnings.thisWeek)}
                  icon={Calendar}
                  description="Last 7 days earnings"
                  color="blue"
                />
                <StatCard
                  title="This Month"
                  value={formatCurrency(stats.earnings.thisMonth)}
                  icon={TrendingUp}
                  description="Current month earnings"
                  color="purple"
                />
                <StatCard
                  title="Total Earnings"
                  value={formatCurrency(stats.earnings.total)}
                  icon={DollarSign}
                  description="All time earnings"
                  color="emerald"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Earnings Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={weeklyEarningsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Area
                          type="monotone"
                          dataKey="earnings"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Earnings Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyEarningsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Line
                          type="monotone"
                          dataKey="earnings"
                          stroke="#3b82f6"
                          strokeWidth={3}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Orders"
                  value={stats.orderStats.totalOrders.toLocaleString()}
                  icon={ShoppingCart}
                  description="All time orders"
                  color="blue"
                />
                <StatCard
                  title="Today Orders"
                  value={stats.orderStats.todayOrders.toLocaleString()}
                  icon={ShoppingCart}
                  color="blue"
                />
                <StatCard
                  title="Delivered"
                  value={stats.orderStats.deliveredOrders.toLocaleString()}
                  icon={CheckCircle}
                  description="Successfully delivered"
                  color="green"
                />
                <StatCard
                  title="Canceled"
                  value={stats.orderStats.canceledOrders.toLocaleString()}
                  icon={XCircle}
                  description="Canceled orders"
                  color="red"
                />
                <StatCard
                  title="Active Orders"
                  value={stats.orderStats.pendingOrders.toLocaleString()}
                  icon={Clock}
                  description="Currently processing"
                  color="yellow"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Orders by Hour</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.orderStats.ordersByHour}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="orders" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Order Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span>Delivered</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {stats.orderStats.deliveredOrders}
                          </p>
                          {stats.orderStats.deliveredOrders > 0 && (
                            <p className="text-sm text-gray-500">
                              {(
                                (stats.orderStats.deliveredOrders /
                                  stats.orderStats.totalOrders) *
                                100
                              ).toFixed(1)}
                              %
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900 rounded-lg">
                        <div className="flex items-center gap-3">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <span>Canceled</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {stats.orderStats.canceledOrders}
                          </p>
                          {stats.orderStats.canceledOrders > 0 && (
                            <p className="text-sm text-gray-500">
                              {(
                                (stats.orderStats.canceledOrders /
                                  stats.orderStats.totalOrders) *
                                100
                              ).toFixed(1)}
                              %
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-yellow-600" />
                          <span>Active Orders</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {stats.orderStats.pendingOrders}
                          </p>
                          {stats.orderStats.totalOrders > 0 && (
                            <p className="text-sm text-gray-500">
                              {(
                                (stats.orderStats.pendingOrders /
                                  stats.orderStats.totalOrders) *
                                100
                              ).toFixed(1)}
                              %
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Ratings Tab */}
          {activeTab === "ratings" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                    {stats.ratings.avgRating}
                  </div>
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 ${
                          i < Math.floor(stats.ratings.avgRating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Based on {stats.ratings.totalRatings} reviews
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.ratings.distribution.map((item) => (
                      <div
                        key={item.rating}
                        className="flex items-center gap-3"
                      >
                        <span className="text-sm w-8">{item.rating}★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500 w-12">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rating Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={stats.ratings.distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {stats.ratings.distribution.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, _, props) => [
                          `${value} reviews`,
                          `${props.payload.rating} Stars`,
                        ]}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Dishes Tab */}
          {activeTab === "dishes" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Dishes"
                  value={stats.dishPerformance.totalDishes.toString()}
                  icon={ChefHat}
                  description="Menu items available"
                  color="purple"
                />
                <StatCard
                  title="Available Dishes"
                  value={stats.dishPerformance.availableDishes.toString()}
                  icon={CheckCircle}
                  description="Currently available"
                  color="green"
                />
                <StatCard
                  title="Un-Available Dishes"
                  value={(
                    stats.dishPerformance.totalDishes -
                    stats.dishPerformance.availableDishes
                  ).toString()}
                  icon={AlertCircle}
                  description="Currently available"
                  color="red"
                />
                <StatCard
                  title="Categories"
                  value={stats.dishPerformance.categoryWise.length.toString()}
                  icon={Package}
                  description="Menu categories"
                  color="blue"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Top Rated Dishes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.dishPerformance.topRatedDishes.map(
                        (dish, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-green-800 dark:text-green-200">
                                  #{index + 1}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{dish.name}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${
                                          i < Math.floor(dish.rating)
                                            ? "text-yellow-400 fill-current"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span>{dish.rating}</span>
                                  <span>•</span>
                                  <span>{dish.orders} orders</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">
                                {formatCurrency(dish.revenue)}
                              </p>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5" />
                      Needs Attention
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.dishPerformance.leastPerforming.map(
                        (dish, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900 dark:to-orange-900 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                              </div>
                              <div>
                                <p className="font-medium">{dish.name}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${
                                          i < Math.floor(dish.rating)
                                            ? "text-yellow-400 fill-current"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span>{dish.rating}</span>
                                  <span>•</span>
                                  <span>{dish.orders} orders</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-red-600">
                                {formatCurrency(dish.revenue)}
                              </p>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.dishPerformance.categoryWise}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip
                        formatter={(value: number, name) => {
                          if (name === "revenue") return formatCurrency(value);
                          return value;
                        }}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="orders"
                        fill="#3b82f6"
                        name="orders"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="revenue"
                        fill="#10b981"
                        name="revenue"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "Payments & Settlements" && (
            <div className="mx-auto">
              <PaymentsSettlementsTab></PaymentsSettlementsTab>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RestaurantOwnerDashboard;
