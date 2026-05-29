import { useEffect, useState } from "react";
import {
  DollarSign,
  PieChart,
  Activity,
  UserCheck,
  Award,
  MapPin,
  FileText,
  Calculator,
  UtensilsCrossed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Users,
  ShoppingCart,
  Store,
  Truck,
  BarChart3,
  Receipt,
  IndianRupee,
  ChartColumn,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  LineChart,
  XAxis,
  YAxis,
  Line,
  CartesianGrid,
} from "recharts";
import {
  EmptyState,
  getStatusColor,
  getStatusIcon,
  PageSkeleton,
} from "@/components/shared/utilityComponents";
import { useAdminStore } from "@/store/useAdminStore";
import { StatCard } from "@/components/shared/StatsCard";
import { formatCurrency, getMonthName } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import PaymentsSettlementsTab from "./PaymentsSettlementsTab";
import { useUserStore } from "@/store/useUserStore";
import { TransactionStatus } from "@/types/transactionType";
import { StatusStats } from "@/types/adminType";

type AdminTab = "Overview" | "Financials" | "Payments & Settlements";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("Overview");

  const { stats, loading, getAdminStats } = useAdminStore();

  const {user} = useUserStore()

  useEffect(() => {
    if(user?._id){
      getAdminStats();
    }
  }, [getAdminStats]);

  if (loading) return <PageSkeleton />;

  if (!stats) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-input/110 p-6">
        <EmptyState
          title="No Stats Available"
          message="There are currently no statistics to display."
          icon={<ChartColumn className="w-12 h-12 text-gray-400" />}
          actionLabel="Go Back"
          actionLink="/"
          showBtn
        />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    Pending: "#f59e0b",
    Confirmed: "#3b82f6",
    Preparing: "#f97316",
    Delivered: "#10b981",
    Canceled: "#ef4444",
  };

  const orderStatusData = Object.entries(stats.orders.status).map(
    ([status, count]) => ({
      name: status,
      value: count,
      color: statusColors[status] ?? "#8b5cf6",
    }),
  );

  const tabs: { id: AdminTab; label: string; icon: LucideIcon }[] = [
    { id: "Overview", label: "Overview", icon: Activity },
    { id: "Financials", label: "Financials", icon: DollarSign },
    {
      id: "Payments & Settlements",
      label: "Payments & Settlements",
      icon: IndianRupee,
    },
  ];

  const monthlyTrendData = stats.orders.monthlyTrend.reverse().map((month) => ({
    month: `${getMonthName(month._id.month)}`,
    orders: month.count,
  }));

//   const monthlyTrendData = [
//   { month: "Jan", orders: 120 },
//   { month: "Feb", orders: 150 },
//   { month: "Mar", orders: 180 },
//   { month: "Apr", orders: 220 },
//   { month: "May", orders: 260 },
//   { month: "Jun", orders: 300 },
//   { month: "Jul", orders: 280 },
//   { month: "Aug", orders: 320 },
//   { month: "Sep", orders: 350 },
//   { month: "Oct", orders: 400 },
//   { month: "Nov", orders: 450 },
//   { month: "Dec", orders: 500 }
// ];

  const colors = ["bg-indigo-500", "bg-green-500", "bg-red-500"];

  return (
    <div className="min-h-screen  text-gray-900 dark:text-gray-100">
      {/* HEADER */}
      <div className="px-6 mt-5 rounded-2xl bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Food delivery platform overview
          </p>
        </div>

        <div className="mx-auto">
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                  ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= OVERVIEW ================= */}
      {activeTab === "Overview" && (
        <div className="px-3 mx-auto py-8 space-y-6">
          <div className="grid md:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={stats.users.total.toLocaleString()}
              icon={Users}
              description={`${stats.users.activeLast30Days.toLocaleString()} active in last 30 days`}
              color="blue"
              trend={stats.users.trend}
              trendValue={stats.users.trendValue}
            />
            <StatCard
              title="Total Orders"
              value={stats.orders.total.toLocaleString()}
              icon={ShoppingCart}
              description="All time orders"
              color="green"
              trend={stats.orders.trend}
              trendValue={stats.orders.trendValue}
            />
            <StatCard
              title="Active Restaurants"
              value={stats.restaurants.total.toLocaleString()}
              icon={Store}
              description={`Avg rating: ${stats.restaurants.avgRating.toFixed(
                1,
              )} ⭐`}
              color="orange"
              trend={stats.restaurants.trend}
              trendValue={stats.restaurants.trendValue}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Orders Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <BarChart3 className="h-5 w-5" />
                  Monthly Orders Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" tick={{ fill: "#9ca3af" }} />
                    <YAxis tick={{ fill: "#9ca3af" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        color: "#f9fafb",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <PieChart className="h-5 w-5" />
                  Order Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          {/* Detailed Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <UserCheck className="h-5 w-5" />
                  User Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.users.roles).map(([role, count]) => {
                    const percentage = (
                      (count / stats.users.total) *
                      100
                    ).toFixed(1);
                    return (
                      <div key={role} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize dark:text-gray-300">
                            {role}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {count.toLocaleString()}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Rated Restaurants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <Award className="h-5 w-5" />
                  Top Rated Restaurants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.restaurants.topRated.map((restaurant, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-yellow-800 dark:text-yellow-200">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium dark:text-white">
                            {restaurant.restaurantName}
                          </p>
                          <p className="text-xs text-gray-500">Restaurant</p>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        {restaurant.ratingTotal.toFixed(1)} ⭐
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Delivery Agents Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <MapPin className="h-5 w-5" />
                  Delivery Agents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stats.deliveryAgents.total}
                    </div>
                    <p className="text-sm text-gray-500">Total Agents</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                      <div className="text-lg font-bold text-green-800 dark:text-green-200">
                        {stats.deliveryAgents.online}
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-300">
                        Online
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        {stats.deliveryAgents.total -
                          stats.deliveryAgents.online}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Offline
                      </p>
                    </div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                      {stats.deliveryAgents.avgRating.toFixed(1)} ⭐
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-300">
                      Average Rating
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <UtensilsCrossed className="h-5 w-5" />
                  Dishes Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.dishes).map(([key, value], idx) => {
                    const total = Object.values(stats.dishes).reduce(
                      (a, b) => a + b,
                      0,
                    );
                    const percentage = (value / total) * 100;

                    return (
                      <div key={key}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {key}
                          </span>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {typeof value === "number"
                              ? value.toLocaleString()
                              : value}
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${colors[idx % colors.length]}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2 ">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Restaurant Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=" text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {stats.restaurantApplications.total}
                </div>
                <div className="space-y-2">
                  {Object.entries(stats.restaurantApplications.status).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <span className="text-xs capitalize">{status}</span>
                        </div>
                        <Badge
                          className={getStatusColor(status)}
                          variant="secondary"
                        >
                          {count}
                        </Badge>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-purple-600" />
                  Agent Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {stats.deliveryAgentApplications.total}
                </div>
                <div className="space-y-2">
                  {Object.entries(stats.deliveryAgentApplications.status).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <span className="text-xs capitalize">{status}</span>
                        </div>
                        <Badge
                          className={getStatusColor(status)}
                          variant="secondary"
                        >
                          {count}
                        </Badge>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {/* ================= FINANCIALS ================= */}
      {activeTab === "Financials" && (
        <div className="px-3 mx-auto py-8 space-y-6">
          <div className="grid md:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(stats.financials.revenue)}
              description="Gross value including platform, restaurant, delivery & GST"
              icon={BarChart3}
              color="indigo"
              trend={stats.financials.trend}
              trendValue={stats.financials.trendValue}
            />

            <StatCard
              title="Platform Profit"
              value={formatCurrency(stats.financials.platformRevenue.total)}
              description="Net earnings from app fees & commissions"
              icon={IndianRupee}
              color="emerald"
            />

            <StatCard
              title="Restaurant Revenue"
              value={formatCurrency(stats.financials.restaurantRevenue)}
              description="Total payout earned by restaurants"
              icon={Store}
              color="blue"
            />

            <StatCard
              title="Delivery Revenue"
              value={formatCurrency(stats.financials.deliveryRevenue)}
              description="Delivery charges earned from orders"
              icon={Truck}
              color="purple"
            />

            <StatCard
              title="GST Collected"
              value={formatCurrency(stats.financials.gstCollected)}
              description="Total tax collected on all orders"
              icon={Receipt}
              color="orange"
            />
          </div>

          {/* Transactions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
              Transaction Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TransactionCard
                title="Restaurant Payments"
                data={stats.transactionStats.summary.Restaurant}
                color="green"
              />
              <TransactionCard
                title="Delivery Payments"
                data={stats.transactionStats.summary.Delivery}
                color="blue"
              />
              <TransactionCard
                title="Customer Refunds"
                data={stats.transactionStats.summary.Customer}
                color="purple"
              />
            </div>
          </div>

          {/* Financial Summary Card */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-800 dark:text-green-200">
                    {stats.financials.grossMargin}%
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Gross Margin
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">
                      Total Orders Margin
                    </span>
                    <span className="font-medium">
                      {formatCurrency(
                        stats.financials.platformRevenue.orderMargin,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">
                      Total App Fee
                    </span>
                    <span className="font-medium">
                      {formatCurrency(
                        stats.financials.platformRevenue.totalAppFee,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">
                      Total Profit
                    </span>
                    <span className="font-medium">
                      {formatCurrency(stats.financials.platformRevenue.total)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "Payments & Settlements" && (
        <div className="px-3 mx-auto py-6">
          <PaymentsSettlementsTab></PaymentsSettlementsTab>
        </div>
      )}
    </div>
  );
}
interface TransactionCardProps {
  title: string;
  data: { [key in TransactionStatus]: StatusStats };
  color: "green" | "blue" | "purple";
}

const TransactionCard: React.FC<TransactionCardProps> = ({ title, data }) => {
  const total = data.Pending.count + data.Paid.count;

  const pendingWidth = total > 0 ? (data.Pending.count / total) * 100 : 0;
  const paidWidth = total > 0 ? (data.Paid.count / total) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pending */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Pending
              </span>
              <span className="">
                ({data.Pending.count})
              </span>
            </div>
            
            <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
              ₹{data.Pending.amount}
            </span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${pendingWidth}%` }}
            />
          </div>
        </div>

        {/* Paid */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Paid
              </span>
              <span className="">
                 ({data.Paid.count})
              </span>
            </div>
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              ₹{data.Paid.amount}
            </span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${paidWidth}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
