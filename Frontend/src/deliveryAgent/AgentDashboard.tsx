import { ReactNode, useEffect, useState } from "react";
import {
  User,
  MapPin,
  Star,
  Package,
  TrendingUp,
  BarChart3,
  Calendar,
  Award,
  Route,
  Building,
  UserCheck,
  Settings,
  ShieldCheck,
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
} from "recharts";
import { useDeliveryAgentStore } from "@/store/useDeliveryAgentStore";
import {
  EmptyState,
  TabButton,
  StatusBadge,
  PageSkeleton,
} from "@/components/shared/utilityComponents";
import PaymentsSettlementsTab from "@/admin/PaymentsSettlementsTab";
import { useOrderStore } from "@/store/useOrderStore";
import { RestaurantType } from "@/types/restaurantType";

function convertMinutesToHrsMins(timeInMins: number) {
  const hrs = Math.floor(timeInMins / 60);
  const mins = Math.round(timeInMins % 60);
  const displayTime = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  return displayTime;
}

const AgentDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("profile");
  const {
    deliveryAgentDetails: agentData,
    getDeliveryAgentStats,
    agentStats,
    loading,
  } = useDeliveryAgentStore();

  const { activeOrders } = useOrderStore();

  useEffect(() => {
    if (agentData?._id) {
      getDeliveryAgentStats();
    }
  }, [agentData?._id]);

  if (loading.pageLoading) {
    return <PageSkeleton></PageSkeleton>;
  }

  if (!agentData || !agentStats) {
    return (
      <div className="h-screen flex">
        <EmptyState
          title="No Agent Stats"
          message="You don’t have any delivery data yet. Start accepting orders to see your performance stats here.."
          icon={<Building size={48} className="text-gray-500" />}
          actionLabel="Go Back"
          actionLink="/"
          showBtn={true}
        />
      </div>
    );
  }

  const deliveryStatsList: StatsType[] = [
    {
      label: "Total Distance",
      value: Math.round(agentStats.ordersAnalytics.distance.totalKm) + "km",
    },
    {
      label: "Average Distance",
      value: Math.round(agentStats.ordersAnalytics.distance.avgKm) + "km",
    },
    {
      label: "Est. Time on Road",
      value: convertMinutesToHrsMins(
        agentStats.ordersAnalytics.avgDeliveryTimeMin,
      ),
    },
  ];

  const weeklyEarnings = agentStats.earnings.weeklyEarnings;

  //   const weeklyEarnings = [
  //   { day: "Mon", earnings: 80 },
  //   { day: "Tue", earnings: 110 },
  //   { day: "Wed", earnings: 95 },
  //   { day: "Thu", earnings: 140 },
  //   { day: "Fri", earnings: 260 },
  //   { day: "Sat", earnings: 520 },
  //   { day: "Sun", earnings: 480 },
  // ];

  return (
    <div className="min-h-screen bg-gray-50  dark:bg-input/110 mb-10 mt-5">
      {/* Header */}
      <div className="bg-white  dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-y-4">
          <div>
            <h1 className=" sm:text-2xl pb-1.5 font-bold text-gray-900 dark:text-white">
              Agent Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-xs">
              ID: {agentData._id}
            </p>
          </div>
          <StatusBadge status={agentData.status} />
        </div>
      </div>
      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-900  border-b border-gray-200 dark:border-gray-700 px-6">
        <nav className="flex max-w-140 overflow-x-scroll  my-scrollbar sm:overflow-auto sm:max-w-full">
          {[
            "profile",
            "earnings",
            "orders",
            "performance",
            "areas",
            "Payments & Settlements",
          ].map((tab) => (
            <TabButton
              key={tab}
              id={tab}
              isActive={selectedTab === tab}
              onClick={setSelectedTab}
            />
          ))}
        </nav>
      </div>

      <div className="py-6">
        {/* Section 1: Agent Profile Details */}
        {selectedTab === "profile" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
              <h2 className="sm:text-xl font-semibold text-gray-900 mb-6 flex items-center dark:text-teal-500">
                <User className="h-5 w-5 mr-2" />
                Agent Profile Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  ["Name", agentData.user.fullName],
                  ["Email", agentData.user.email],
                  ["Contact", agentData.user.contact],
                  ["Status", agentStats.profile.status],
                  ["Vehicle Type", agentStats.profile.vehicle.type],
                  ["Vehicle Number", agentStats.profile.vehicle.number],
                  ["License Number", agentStats.profile.vehicle.licenseNumber],
                  [
                    "Average Rating",
                    <span className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {agentStats.profile.rating.avg.toFixed(1)} (
                      {agentStats.profile.rating.count} reviews)
                    </span>,
                  ],
                  [
                    "Joined On",
                    new Date(agentStats.profile.joinedAt).toLocaleDateString(),
                  ],
                  [
                    "Total Working Days",
                    `${agentStats.profile.totalWorkingDays} days`,
                  ],
                ].map(([label, value], idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {label}
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Earnings & Charts */}
        {selectedTab === "earnings" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Today's Earnings"
                value={`₹${agentData.earnings.today}`}
                icon={TrendingUp}
                color="green"
              />
              <StatCard
                title="This Week"
                value={`₹${agentData.earnings.thisWeek}`}
                icon={Calendar}
                color="blue"
              />
              <StatCard
                title="This Month"
                value={`₹${agentData.earnings.thisMonth}`}
                icon={BarChart3}
                color="purple"
              />
              <StatCard
                title="Total Earnings"
                value={`₹${agentData.earnings.total}`}
                subtitle={`Avg: ₹${agentStats.earnings.summary.avgPerDelivery.toFixed(
                  0,
                )}/delivery`}
                icon={Award}
                color="orange"
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Weekly Earnings Chart
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyEarnings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", color: "#fff" }}
                    formatter={(value) => [`₹${value}`, "Earnings"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="#3B82F6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Section 3: Order History & Stats */}
        {selectedTab === "orders" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Deliveries"
                value={
                  agentStats?.ordersAnalytics?.totalDelivered?.toString() || "0"
                }
                icon={Package}
                color="green"
              />
              <StatCard
                title="Active Orders"
                value={
                  agentStats?.ordersAnalytics?.activeOrders?.toString() || "0"
                }
                icon={Package}
                color="orange"
              />

              <StatCard
                title="Canceled Orders"
                value={
                  agentStats?.ordersAnalytics?.totalCanceled?.toString() || "0"
                }
                icon={Package}
                color="red"
              />

              <StatCard
                title="Manual Assignments"
                value={
                  agentStats?.ordersAnalytics?.orderCount.assignedManual?.toString() ||
                  "0"
                }
                icon={UserCheck} // icon representing a manual/user action
                color="orange"
              />

              <StatCard
                title="Auto-Assigned Orders"
                value={
                  agentStats?.ordersAnalytics?.orderCount.assignedFallback?.toString() ||
                  "0"
                }
                icon={Settings} // icon representing system/automation
                color="blue"
              />

              <StatCard
                title="Average Delivery Time"
                value={convertMinutesToHrsMins(
                  agentStats?.ordersAnalytics?.avgDeliveryTimeMin || 0,
                )}
                icon={Route}
                color="blue"
              />
            </div>

            {activeOrders.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Active Order
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        {[
                          "Order ID",
                          "Restaurant",
                          "Customer",
                          "Pick Up",
                          "Drop",
                          "Assignment Type",
                          "Amount",
                          "You Earned",
                          "Status",
                        ].map((th) => (
                          <th
                            key={th}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                          >
                            {th}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {activeOrders.map((order) => {
                        return (
                          <tr key={order._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {order._id}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {order.restaurant.restaurantName}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {order.user.fullName}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {order.deliveryDetails.pickup.address}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {order.deliveryDetails.drop.address}
                            </td>

                            <td
                              title={
                                order.agentAssignmentType === "Manual"
                                  ? "You accepted this order manually"
                                  : "Assigned to you as restaurant fallback"
                              }
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                            >
                              {order.agentAssignmentType}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              ₹{order.bill.grandTotal}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500 font-semibold">
                              ₹{order.bill.shippingFee}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge
                                status={order.currentStatus}
                              ></StatusBadge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Section 4: Performance & Feedback */}
        {selectedTab === "performance" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rating Distribution */}
              <div className="bg-white rounded-lg shadow-sm border p-6 dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-base font-semibold text-gray-900 dark:text-teal-500 mb-4">
                  Rating Distribution
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={agentStats.performance.ratingDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Section 5: Delivery Areas */}
        {selectedTab === "areas" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Delivery Areas */}
              <div className="bg-white rounded-lg shadow-sm border p-6 dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center dark:text-teal-500">
                  <MapPin className="h-5 w-5 mr-2 dark:text-teal-500" />
                  Top Delivery Areas
                </h3>
                <div className="space-y-3">
                  {agentStats.preferredAreas.topAreas.length === 0 ? (
                    <p className="text-sm text-gray-500">No data available.</p>
                  ) : (
                    agentStats.preferredAreas.topAreas.map((area, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded border dark:bg-gray-600 dark:border-gray-500"
                      >
                        <span className="text-sm font-medium">{area.area}</span>
                        <span className="text-sm">
                          {area.deliveries} deliveries
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Delivery Stats */}
              <StatsBox
                statsList={deliveryStatsList}
                title="Delivery Stats"
              ></StatsBox>

              <div className="bg-white rounded-lg shadow-sm border p-6 dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center dark:text-teal-500">
                  <ShieldCheck className="h-5 w-5 mr-2 text-blue-600 dark:text-teal-500" />
                  Fallback Restaurant Assignment
                </h3>

                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  You are registered as a fallback delivery partner for these
                  restaurants. Orders will be assigned only when their primary
                  delivery agents are unavailable.
                </p>

                <div className="space-y-3">
                  {agentData.preferredRestaurants?.map(
                    (restaurant: RestaurantType) => (
                      <div
                        key={restaurant._id}
                        className="
            flex flex-col rounded-lg border
            border-gray-200 dark:border-gray-700
            bg-gray-50 dark:bg-gray-800
            px-4 py-2
            hover:bg-gray-100 dark:hover:bg-gray-700
            transition
          "
                      >
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {restaurant?.restaurantName}
                        </span>

                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {restaurant?.location?.address}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === "Payments & Settlements" && (
          <div className="mx-auto">
            <PaymentsSettlementsTab></PaymentsSettlementsTab>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;

// UTILITY COMPONENTS

type StarCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  icon: any;
  color: string;
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
}: StarCardProps) => (
  <div className="bg-white rounded-lg shadow-sm border p-6 dark:bg-gray-800 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-teal-600">
          {title}
        </p>
        <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      <Icon className={`h-8 w-8 text-${color}-500`} />
    </div>
  </div>
);

type StatsType = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  classes?: string;
};

const StatsBox = ({
  statsList,
  title,
}: {
  statsList: StatsType[];
  title: string;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 dark:bg-gray-800 dark:border-gray-700">
      <h3 className="text-base font-semibold text-gray-900 dark:text-teal-500 mb-4">
        {title}
      </h3>
      <div className="space-y-4">
        {statsList.map(
          (
            {
              label,
              value,
              icon,
              classes = "text-gray-600 dark:text-gray-300",
            },
            i,
          ) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                {label}
              </span>
              <span
                className={`text-sm font-bold ${classes} flex items-center`}
              >
                {value || 0}
                {icon}
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );
};
