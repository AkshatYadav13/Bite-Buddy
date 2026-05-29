import { Request, Response } from "express";
import {
  DeliveryAgent,
  IDeliveryAgentDocument,
} from "../models/deliveryAgent.model";
import { IUser, User } from "../models/user.model";
import { Application, IApplicationDocument } from "../models/application.model";
import { buildSortQuery, emitToUser } from "../utils/utilityFunctions";
import { Orders } from "../models/order.model";
import { startOfWeek, endOfWeek, startOfDay, endOfDay } from "date-fns";
import { IRestaurantDocument, Restaurant } from "../models/restaurant.model";
import { applyOrderPopulates } from "./orders.controller";

export const registerDeliveryAgent = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      res
        .status(400)
        .json({ success: false, message: "Location not available" });
      return;
    }

    const application = (await Application.findOne({
      _id: applicationId,
      applicationType: "Delivery_Agent",
    })) as IApplicationDocument;

    if (!application) {
      res.status(400).json({
        message: "Delivery agent application does not exist.",
        success: false,
      });
      return;
    }

    if (application.status !== "Approved") {
      res.status(400).json({
        message:
          "User can only be registered as delivery agent after application is approved",
        success: false,
      });
      return;
    }

    const applicant = await User.findById(application.user);
    if (!applicant) {
      res.status(400).json({
        message: "User not found",
        success: false,
      });
      return;
    }

    const { licenseNumber, vehicleNumber, vehicleType, preferredRestaurants } =
      application.deliveryAgentDetails!;

    /* ================== CREATE DELIVERY AGENT ================== */
    const deliveryAgent = await DeliveryAgent.create({
      user: applicant._id,
      licenseNumber,
      vehicleNumber,
      vehicleType,
      status: "Available",
      preferredRestaurants,
      lastLocation: {
        latitude,
        longitude,
        geo: { type: "Point", coordinates: [longitude, latitude] },
      },
    });

    /* ================== ADD AGENT TO RESTAURANT FALLBACK ================== */
    if (
      Array.isArray(preferredRestaurants) &&
      preferredRestaurants.length > 0
    ) {
      await Restaurant.updateMany(
        { _id: { $in: preferredRestaurants } },
        { $addToSet: { fallbackAgents: deliveryAgent._id } },
      );
    }

    /* ================== UPDATE USER ================== */
    applicant.role = "Delivery_Agent";
    applicant.applicationId = undefined;
    await applicant.save();

    application.isDeletable = true;
    await application.save();

    res.status(200).json({
      message: `${applicant.fullName} successfully registered as Delivery Agent`,
      deliveryAgent,
      success: true,
    });
  } catch (error) {
    console.log("Error occurred while registering delivery agent", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const updateDeliveryAgentRating = async (
  req: Request,
  res: Response,
) => {
  try {
    const { rating, id } = req.params;

    const agent = await DeliveryAgent.findById(id).populate("user");
    if (!agent) {
      res.status(400).json({
        message: "Delivery Agent not found",
        success: false,
      });
      return;
    }

    if (agent.user.toString() === req.id) {
      res.status(400).json({
        message: "You can't rate yourself",
        success: false,
      });
      return;
    }

    agent.ratingTotal += Number(rating);
    agent.ratingCount += 1;

    await agent.save();

    res.status(200).json({
      message: `Successfully rated rating of delivery agent.`,
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getDeliveryAgents = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const searchTerm = (req.query.search as string) || "";
    const status = (req.query.status as string) || "All";
    const vehicleType = (req.query.vehicleType as string) || "All";
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "desc";

    let filterQuery: any = {};
    if (status !== "All") {
      filterQuery.status = status;
    }
    if (vehicleType !== "All") {
      filterQuery.vehicleType = vehicleType;
    }

    let deliveryAgents: IDeliveryAgentDocument[] = [];
    let totalCount: number = 0;

    const sortQuery: any =
      sortBy === "rating"
        ? { avgRating: sortOrder === "asc" ? 1 : -1 }
        : buildSortQuery(sortBy, sortOrder);

    const query = DeliveryAgent.find(filterQuery)
      .populate({
        path: "user",
        select: "fullName email contact",
      })
      .sort(sortQuery);

    if (searchTerm) {
      const allAgents = await query.exec();
      const filtered = allAgents.filter((agent) => {
        const user = agent.user as IUser;
        return (
          agent.licenseNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      totalCount = filtered.length;
      deliveryAgents = filtered.slice(skip, skip + limit);
    } else {
      deliveryAgents = await query.skip(skip).limit(limit).exec();
      totalCount = await DeliveryAgent.countDocuments(filterQuery);
    }

    // Custom sort for userName (if needed)
    if (sortBy === "userName") {
      deliveryAgents.sort((a, b) => {
        const aName = (a.user as IUser).fullName;
        const bName = (b.user as IUser).fullName;
        return sortOrder === "desc"
          ? bName.localeCompare(aName)
          : aName.localeCompare(bName);
      });
    }

    res.status(200).json({
      success: true,
      deliveryAgents,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getPickupOrdersforAgents = async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      res
        .status(400)
        .json({ success: false, message: "Agent location not available" });
      return;
    }

    const agent = (await DeliveryAgent.findOne({
      user: req.id,
    })) as IDeliveryAgentDocument;

    if (!agent) {
      res.status(400).json({ success: false, message: "Agent not found" });
      return;
    }

    // Find orders that are ready for pickup and near the agent
    const pickupOrders = await Orders.find({
      currentStatus: { $in: ["ReadyForPickup", "Confirmed"] },
      "deliveryDetails.pickup.geo": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat], // agent's current location
          },
          $maxDistance: 5000, // 5 km radius, adjust as needed
        },
      },
    })
      .populate({ path: "user", select: "fullName email contact profilePic" })
      .populate({
        path: "restaurant",
        select: "-orderPlaced -orderServed -orders -cuisines",
      })
      .lean();

    res.status(200).json({
      success: true,
      pickupOrders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const acceptOrder = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.id);
    if (!user) {
      res.status(400).json({ success: false, message: "User not found" });
      return;
    }

    const agent = (await DeliveryAgent.findOne({
      user: req.id,
    })) as IDeliveryAgentDocument;
    const orderId = req.params.id;

    if (!agent) {
      res.status(400).json({ success: false, message: "Agent not found" });
      return;
    }

    // 🔑 IMPORTANT CHECK (only 1 active order allowed)
    if (agent.status !== "Available" || agent.activeOrders.length > 0) {
      res.status(400).json({
        success: false,
        message: "Agent must be available and have no active orders",
      });
      return;
    }

    const order = await applyOrderPopulates(
      Orders.findOne({
        _id: orderId,
        currentStatus: { $in: ["ReadyForPickup", "Confirmed"] },
        deliveryAgent: { $exists: false },
      }),
    );

    if (!order) {
      res.status(400).json({
        success: false,
        message: "Order not found or already accepted",
      });
      return;
    }

    const restaurant = (await Restaurant.findById(
      order.restaurant,
    )) as IRestaurantDocument;
    if (!restaurant) {
      res.status(400).json({ success: false, message: "Restaurant not found" });
      return;
    }

    /* ================== UPDATE ORDER ================== */

    order.currentStatus = "AcceptedByAgent";
    order.deliveryAgent = agent._id;
    order.agentAssignmentType = "Manual";

    /* ================== UPDATE AGENT ================== */

    agent.activeOrders.push(order._id);
    agent.status = "OnDelivery";

    /* ================== SOCKET PAYLOAD ================== */

    const orderWithAgentDetails = {
      ...order.toObject(),
      deliveryAgent: {
        vehicleNumber: agent.vehicleNumber,
        vehicleType: agent.vehicleType,
        user: { fullName: user.fullName },
      },
    };

    emitToUser(order.user._id.toString(), "order-status-update", {
      updatedOrder: orderWithAgentDetails,
    });

    emitToUser(restaurant.user.toString(), "order-status-update", {
      updatedOrder: orderWithAgentDetails,
    });

    await Promise.all([agent.save(), order.save()]);

    res.status(200).json({
      success: true,
      message: "Order accepted successfully",
      acceptedOrder: orderWithAgentDetails,
    });
  } catch (error) {
    console.error("Error occurred in accepting order", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getAgentDetails = async (req: Request, res: Response) => {
  try {
    const agent = await DeliveryAgent.findOne({ user: req.id })
      .populate({ path: "user", select: "fullName email contact" })
      .populate({
        path: "activeOrders",
        populate: [
          {
            path: "user",
            select: "fullName email contact profilePic",
          },
          {
            path: "restaurant",
            select: " -orderPlaced -orderServed -orders -cuisines",
          },
        ],
      })
      .populate({
        path: "preferredRestaurants",
        select: "restaurantName location.address",
      });

    if (!agent) {
      res.status(400).json({
        success: false,
        message: "Delivery Agent not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      agent,
    });
    return;
  } catch (error) {
    console.error("Error in getAgentDetails:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
    return;
  }
};

export const getAgentDashboardStats = async (req: Request, res: Response) => {
  try {
    const agent = await DeliveryAgent.findOne({ user: req.id })
      .populate("user", "fullName email contact")
      .lean();

    if (!agent) {
      res.status(404).json({
        success: false,
        message: "Delivery agent not found",
      });
      return;
    }

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // WEEKLY EARNINGS

    const result1 = await Orders.aggregate([
      {
        $match: {
          deliveryAgent: agent._id,
          currentStatus: "Delivered",
        },
      },
      {
        $addFields: {
          deliveredTime: {
            $toDate: {
              $arrayElemAt: [
                {
                  $map: {
                    input: {
                      $filter: {
                        input: "$statusDetails",
                        as: "s",
                        cond: { $eq: ["$$s.status", "Delivered"] },
                      },
                    },
                    as: "d",
                    in: "$$d.time",
                  },
                },
                0,
              ],
            },
          },
        },
      },
      {
        $match: {
          deliveredTime: { $gte: weekStart, $lte: weekEnd },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$deliveredTime" },
          earnings: { $sum: "$bill.shippingFee" },
        },
      },
      {
        $project: {
          _id: 0,
          day: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 1] }, then: "Sun" },
                { case: { $eq: ["$_id", 2] }, then: "Mon" },
                { case: { $eq: ["$_id", 3] }, then: "Tue" },
                { case: { $eq: ["$_id", 4] }, then: "Wed" },
                { case: { $eq: ["$_id", 5] }, then: "Thu" },
                { case: { $eq: ["$_id", 6] }, then: "Fri" },
                { case: { $eq: ["$_id", 7] }, then: "Sat" },
              ],
              default: "Unknown",
            },
          },
          earnings: 1,
        },
      },
    ]);

    const defaultDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const earningsMap = Object.fromEntries(
      result1.map((d) => [d.day, d.earnings]),
    );

    const weeklyEarnings = defaultDays.map((day) => ({
      day,
      earnings: earningsMap[day] || 0,
    }));

    const aggregation = await Orders.aggregate([
      { $match: { deliveryAgent: agent._id } },
      {
        $facet: {
          /* ===================== EARNINGS ===================== */
          earnings: [
            {
              $group: {
                _id: null,
                total: { $sum: "$bill.shippingFee" },
                today: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ["$createdAt", todayStart] },
                          { $lte: ["$createdAt", todayEnd] },
                          { $eq: ["$currentStatus", "Delivered"] },
                        ],
                      },
                      "$bill.shippingFee",
                      0,
                    ],
                  },
                },
                thisWeek: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ["$createdAt", weekStart] },
                          { $lte: ["$createdAt", weekEnd] },
                          { $eq: ["$currentStatus", "Delivered"] },
                        ],
                      },
                      "$bill.shippingFee",
                      0,
                    ],
                  },
                },
                thisMonth: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ["$createdAt", monthStart] },
                          { $eq: ["$currentStatus", "Delivered"] },
                        ],
                      },
                      "$bill.shippingFee",
                      0,
                    ],
                  },
                },
              },
            },
          ],

          /* ===================== ORDERS ANALYTICS ===================== */
          ordersAnalytics: [
            {
              $group: {
                _id: null,
                assignedManual: {
                  $sum: {
                    $cond: [{ $eq: ["$agentAssignmentType", "Manual"] }, 1, 0],
                  },
                },
                assignedFallback: {
                  $sum: {
                    $cond: [
                      { $eq: ["$agentAssignmentType", "Fallback"] },
                      1,
                      0,
                    ],
                  },
                },
                totalDelivered: {
                  $sum: {
                    $cond: [{ $eq: ["$currentStatus", "Delivered"] }, 1, 0],
                  },
                },
                totalCanceled: {
                  $sum: {
                    $cond: [{ $eq: ["$currentStatus", "Cancelled"] }, 1, 0],
                  },
                },
                activeOrders: {
                  $sum: {
                    $cond: [
                      {
                        $in: [
                          "$currentStatus",
                          ["AcceptedByAgent", "OutForDelivery"],
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                totalDistanceKm: {
                  $sum: {
                    $cond: [
                      { $eq: ["$currentStatus", "Delivered"] },
                      "$deliveryDetails.distanceKm",
                      0,
                    ],
                  },
                },
                avgDistanceKm: {
                  $avg: {
                    $cond: [
                      { $eq: ["$currentStatus", "Delivered"] },
                      "$deliveryDetails.distanceKm",
                      null,
                    ],
                  },
                },
              },
            },
          ],

          /* ===================== DELIVERY TIME ===================== */
          deliveryTime: [
            { $match: { currentStatus: "Delivered" } },
            {
              $project: {
                durationMin: {
                  $divide: [
                    {
                      $subtract: [
                        {
                          $toDate: {
                            $arrayElemAt: [
                              {
                                $map: {
                                  input: {
                                    $filter: {
                                      input: "$statusDetails",
                                      as: "s",
                                      cond: {
                                        $eq: ["$$s.status", "Delivered"],
                                      },
                                    },
                                  },
                                  as: "d",
                                  in: "$$d.time",
                                },
                              },
                              0,
                            ],
                          },
                        },
                        {
                          $toDate: {
                            $arrayElemAt: [
                              {
                                $map: {
                                  input: {
                                    $filter: {
                                      input: "$statusDetails",
                                      as: "s",
                                      cond: {
                                        $eq: ["$$s.status", "AcceptedByAgent"],
                                      },
                                    },
                                  },
                                  as: "a",
                                  in: "$$a.time",
                                },
                              },
                              0,
                            ],
                          },
                        },
                      ],
                    },
                    1000 * 60, // convert ms to minutes
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                avgDeliveryTimeMin: { $avg: "$durationMin" },
              },
            },
          ],

          /* ===================== PERFORMANCE ===================== */
          ratingDistribution: [
            { $match: { "ratingDetails.deliveryAgent": { $exists: true } } },
            {
              $group: {
                _id: "$ratingDetails.deliveryAgent",
                count: { $sum: 1 },
              },
            },
          ],

          /* ===================== PREFERRED AREAS ===================== */
          preferredAreas: [
            {
              $project: {
                area: {
                  $trim: {
                    input: {
                      $arrayElemAt: [
                        { $split: ["$deliveryDetails.drop.address", ","] },
                        1, // tweak index based on your address format
                      ],
                    },
                  },
                },
              },
            },
            {
              $group: {
                _id: "$area",
                deliveries: { $sum: 1 },
              },
            },
            { $sort: { deliveries: -1 } },
            { $limit: 5 },
          ],
        },
      },
    ]);

    const data = aggregation[0];

    res.status(200).json({
      success: true,
      stats: {
        profile: {
          agentId: agent._id,
          status: agent.status,
          vehicle: {
            type: agent.vehicleType,
            number: agent.vehicleNumber,
            licenseNumber: agent.licenseNumber,
          },
          joinedAt: agent.createdAt,
          totalWorkingDays: Math.floor(
            (Date.now() - new Date(agent.createdAt).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
          rating: {
            avg: agent.avgRating,
            count: agent.ratingCount,
          },
        },

        earnings: {
          summary: {
            today: data.earnings?.[0]?.today || 0,
            thisWeek: data.earnings?.[0]?.thisWeek || 0,
            thisMonth: data.earnings?.[0]?.thisMonth || 0,
            total: data.earnings?.[0]?.total || 0,
            avgPerDelivery:
              (data.earnings?.[0]?.total || 0) / (agent.totalDeliveries || 1),
          },
          weeklyEarnings,
        },

        ordersAnalytics: {
          orderCount: {
            assignedManual: data.ordersAnalytics?.[0]?.assignedManual || 0,
            assignedFallback: data.ordersAnalytics?.[0]?.assignedFallback || 0,
            total:
              (data.ordersAnalytics?.[0]?.assignedManual || 0) +
              (data.ordersAnalytics?.[0]?.assignedFallback || 0),
          },
          totalDelivered: data.ordersAnalytics?.[0]?.totalDelivered || 0,
          totalCanceled: data.ordersAnalytics?.[0]?.totalCanceled || 0,
          activeOrders: data.ordersAnalytics?.[0]?.activeOrders || 0,
          avgDeliveryTimeMin: data.deliveryTime?.[0]?.avgDeliveryTimeMin || 0,
          distance: {
            totalKm: data.ordersAnalytics?.[0]?.totalDistanceKm || 0,
            avgKm: data.ordersAnalytics?.[0]?.avgDistanceKm || 0,
          },
        },

        performance: {
          ratingDistribution: [1, 2, 3, 4, 5].map((r) => ({
            rating: r,
            count:
              data.ratingDistribution.find((x: any) => Math.round(x._id) === r)
                ?.count || 0,
          })),
        },

        preferredAreas: {
          topAreas: data.preferredAreas.map((a: any) => ({
            area: a._id,
            deliveries: a.deliveries,
          })),
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateAgentLocation = async (req: Request, res: Response) => {
  try {
    const agentId = req.id;

    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      res.status(400).json({
        success: false,
        message: "All location fields are required",
      });
      return;
    }

    const updatedAgent = await DeliveryAgent.findOneAndUpdate(
      { user: agentId },
      {
        $set: {
          lastLocation: {
            latitude,
            longitude,
            geo: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
          },
          lastLocationUpdatedAt: new Date(),
        },
      },
      { new: true },
    ).select("lastLocation lastLocationUpdatedAt");

    if (!updatedAgent) {
      res.status(404).json({
        success: false,
        message: "Agent not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Location updated successfully",
      agent: updatedAgent,
    });
  } catch (error) {
    console.error("updateAgentLocation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const MAX_FALLBACK_AGENTS = 10;
const MAX_RADIUS_KM = 5;
const MAX_RESULTS = 15;

export const getOptimalRestaurantsForAgent = async (
  req: Request,
  res: Response,
) => {
  try {
    let { lat, lng } = req.query;

    if (!lat || !lng) {
      res.status(400).json({
        success: false,
        message: "Agent location is required",
      });
      return;
    }

    const restaurants = await Restaurant.find({
      isActive: true,

      // ✅ fallbackAgents < 10
      $expr: {
        $lt: [{ $size: "$fallbackAgents" }, MAX_FALLBACK_AGENTS],
      },

      // ✅ geo filter
      "location.geo": {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: MAX_RADIUS_KM * 1000,
        },
      },
    })
      .select("-earnings -orders")
      .limit(MAX_RESULTS);

    res.status(200).json({
      success: true,
      restaurants,
    });
  } catch (error) {
    console.error("getOptimalRestaurantsForAgent error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch nearby restaurants",
    });
  }
};
