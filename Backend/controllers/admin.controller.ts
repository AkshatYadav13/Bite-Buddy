import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Restaurant } from "../models/restaurant.model";
import { Orders } from "../models/order.model";
import {
  calculateTrend,
  daysAgo,
  formatCounts,
} from "../utils/utilityFunctions";
import { DeliveryAgent } from "../models/deliveryAgent.model";
import { Dish } from "../models/dish.model";
import { Application } from "../models/application.model";
import { Transaction, TransactionStatus, TransactionUserType } from "../models/transaction.model";

export const getTransactionStatsForAdmin = async () => {
  type StatusStats = {
    amount: number;
    count: number;
  };

  type TransactionSummary = {
    [key in TransactionUserType]: {
      [key in TransactionStatus]: StatusStats;
    };
  };
  // 🔹 Initialize structure
  const summary: TransactionSummary = {
    Restaurant: {
      Pending: { amount: 0, count: 0 },
      Paid: { amount: 0, count: 0 },
    },
    Delivery: {
      Pending: { amount: 0, count: 0 },
      Paid: { amount: 0, count: 0 },
    },
    Customer: {
      Pending: { amount: 0, count: 0 },
      Paid: { amount: 0, count: 0 },
    },
  };

  // 🔹 Aggregation
  const data = await Transaction.aggregate([
    {
      $group: {
        _id: {
          userType: "$userType",
          status: "$status",
        },
        amount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  let totalPendingAmt = 0;
  let totalPaidAmt = 0;
  let pendingCount = 0;
  let paidCount = 0;
  let activeSettlementsCount = 0;

  // 🔹 Map aggregation to structure
  data.forEach((item) => {
    const userType = item._id.userType as TransactionUserType;
    const status = item._id.status as TransactionStatus;

    summary[userType][status] = {
      amount: item.amount,
      count: item.count,
    };

    if (status === "Pending") {
      totalPendingAmt += item.amount;
      activeSettlementsCount += item.count;
      pendingCount += item.count;
    }

    if (status === "Paid") {
      totalPaidAmt += item.amount;
      paidCount += item.count;
    }
  });

  return {
    summary,
    total: {
      pendingAmt: totalPendingAmt,
      paidAmt: totalPaidAmt,
      pendingCount,
      paidCount,
      activeSettlementsCount,
    },
  };
};


export const getAdminStats = async (req: Request, res: Response) => {
  try {
    // 🔹 Parallel queries
    const [
      totalUsers,
      userRoles,
      userTrendStats,
      totalOrders,
      orderStatusCounts,
      deliveredOrders,
      cancelledOrdersWithFee,
      monthlyOrders,
      orderTrendStats,
      revenueTrendStats,
      totalRestaurants,
      avgRestaurantRatingData,
      topRestaurants,
      restaurantTrendStats,
      dishesCount,
      totalRestaurantApplications,
      restaurantApplicationStatus,
      totalDeliveryAgentApplications,
      deliveryAgentApplicationStatus,
      totalDeliveryAgents,
      onlineAgents,
      avgDeliveryAgentRatingData,
      transactionStats
    ] = await Promise.all([
      User.countDocuments(),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      getUserTrend(),
      Orders.countDocuments(),
      Orders.aggregate([
        { $group: { _id: "$currentStatus", count: { $sum: 1 } } },
      ]),
      Orders.find({
        isVerified: true,
        currentStatus: "Delivered",
      }).populate({
        path: "cartItems.dishId",
        select: "costPrice price",
      }),

      Orders.find({
        isVerified: true,
        currentStatus: "Canceled",
        "bill.appFee": { $gt: 0 },
      }).select("bill.appFee"),
      Orders.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 6 },
      ]),
      getOrderTrend(),
      getRevenueTrend(),
      Restaurant.countDocuments(),
      Restaurant.aggregate([
        { $group: { _id: null, avg: { $avg: "$ratingTotal" } } },
      ]),
      Restaurant.find()
        .sort({ ratingTotal: -1 })
        .limit(5)
        .select("restaurantName ratingTotal"),
      getRestaurantTrend(),
      Dish.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            available: {
              $sum: { $cond: [{ $eq: ["$isAvailable", true] }, 1, 0] },
            },
            unAvailable: {
              $sum: { $cond: [{ $eq: ["$isAvailable", false] }, 1, 0] },
            },
          },
        },
        { $project: { _id: 0, total: 1, available: 1, unAvailable: 1 } },
      ]),
      Application.countDocuments({ applicationType: "Restaurant" }),
      Application.aggregate([
        { $match: { applicationType: "Restaurant" } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Application.countDocuments({ applicationType: "Delivery_Agent" }),
      Application.aggregate([
        { $match: { applicationType: "Delivery_Agent" } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      DeliveryAgent.countDocuments(),
      DeliveryAgent.countDocuments({ status: "Online" }),
      DeliveryAgent.aggregate([
        { $group: { _id: null, avg: { $avg: "$ratingTotal" } } },
      ]),
        getTransactionStatsForAdmin()
    ]);

    // 🔹 FINANCIAL CALCULATIONS (Orders-based)
    let orderMargin = 0;
    let totalAppFee = 0;
    let restaurantRevenue = 0;
    let deliveryRevenue = 0;
    let gstCollected = 0;
    let costOfGoods = 0;

    for (const order of deliveredOrders) {
      totalAppFee += order.bill.appFee;
      deliveryRevenue += order.bill.shippingFee;
      gstCollected += order.bill.gstAmount;

      for (const item of order.cartItems) {
        const cp = item.costPrice || 0;
        const sp = item.sellingPrice || 0;
        costOfGoods += cp * item.quantity;
        restaurantRevenue += cp * item.quantity;
        orderMargin += (sp - cp) * item.quantity;
      }
    }

    /* Canceled Orders (ONLY appFee) */
    for (const order of cancelledOrdersWithFee) {
      totalAppFee += order.bill.appFee;
    }

    const platformRevenue = {
      orderMargin,
      totalAppFee,
      total: orderMargin + totalAppFee,
    };
    const revenue =
      platformRevenue.total +
      restaurantRevenue +
      deliveryRevenue +
      gstCollected;
    const grossMargin =
      revenue > 0 ? (platformRevenue.total / revenue) * 100 : 0;

    
    // 🔹 RESPONSE
    res.status(200).json({
      users: {
        total: totalUsers,
        activeLast30Days: userTrendStats.current,
        roles: formatCounts(userRoles),
        trend: userTrendStats.trend,
        trendValue: userTrendStats.trendValue,
      },
      orders: {
        total: totalOrders,
        status: formatCounts(orderStatusCounts),
        monthlyTrend: monthlyOrders,
        trend: orderTrendStats.trend,
        trendValue: orderTrendStats.trendValue,
      },
      financials: {
        currMonthRevenue: revenueTrendStats.current,
        trend: revenueTrendStats.trend,
        trendValue: revenueTrendStats.trendValue,
        revenue,
        platformRevenue,
        restaurantRevenue,
        deliveryRevenue,
        gstCollected,
        costOfGoods,
        grossMargin: grossMargin.toFixed(2),
      },
      transactionStats,
      restaurants: {
        total: totalRestaurants,
        avgRating: avgRestaurantRatingData[0]?.avg || 0,
        topRated: topRestaurants,
        trend: restaurantTrendStats.trend,
        trendValue: restaurantTrendStats.trendValue,
      },
      dishes: {
        total: dishesCount[0]?.total || 0,
        available: dishesCount[0]?.available || 0,
        unAvailable: dishesCount[0]?.unAvailable || 0,
      },
      restaurantApplications: {
        total: totalRestaurantApplications,
        status: formatCounts(restaurantApplicationStatus),
      },
      deliveryAgentApplications: {
        total: totalDeliveryAgentApplications,
        status: formatCounts(deliveryAgentApplicationStatus),
      },
      deliveryAgents: {
        total: totalDeliveryAgents,
        online: onlineAgents,
        avgRating: avgDeliveryAgentRatingData[0]?.avg || 0,
      },
      success: true,
    });
  } catch (error) {
    console.log("Admin Stats Error:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getUserTrend = async () => {
  const current = await User.countDocuments({
    lastLogin: { $gte: daysAgo(30) },
  });
  const previous = await User.countDocuments({
    lastLogin: { $gte: daysAgo(60), $lt: daysAgo(30) },
  });
  return { current, ...calculateTrend(current, previous) };
};

export const getOrderTrend = async () => {
  const current = await Orders.countDocuments({
    createdAt: { $gte: daysAgo(30) },
  });
  const previous = await Orders.countDocuments({
    createdAt: { $gte: daysAgo(60), $lt: daysAgo(30) },
  });
  return { current, ...calculateTrend(current, previous) };
};

export const getRevenueTrend = async () => {
  const pipeline = (start: Date, end?: Date) => {
    const match: any = {
      createdAt: { $gte: start },
      isVerified: true,
      currentStatus: "Delivered",
    };
    if (end) match.createdAt.$lt = end;
    return [
      { $match: match },
      { $group: { _id: null, total: { $sum: "$bill.appFee" } } },
    ];
  };

  const [curr, prev] = await Promise.all([
    Orders.aggregate(pipeline(daysAgo(30))),
    Orders.aggregate(pipeline(daysAgo(60), daysAgo(30))),
  ]);
  const current = curr[0]?.total || 0;
  const previous = prev[0]?.total || 0;

  return { current, ...calculateTrend(current, previous) };
};

export const getRestaurantTrend = async () => {
  const current = await Restaurant.countDocuments({
    createdAt: { $gte: daysAgo(30) },
  });
  const previous = await Restaurant.countDocuments({
    createdAt: { $gte: daysAgo(60), $lt: daysAgo(30) },
  });
  return { current, ...calculateTrend(current, previous) };
};
