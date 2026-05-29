import { Request, Response } from "express";
import { IRestaurantDocument, Restaurant } from "../models/restaurant.model";
import {
  deleteItemFromCloudinary,
  uploadImageOnCloundinary,
} from "../utils/cloudinary";
import { Orders } from "../models/order.model";
import { IUser, User } from "../models/user.model";
import { Application, IApplicationDocument } from "../models/application.model";
import { buildSortQuery } from "../utils/utilityFunctions";
import { Dish } from "../models/dish.model";
import { endOfWeek, startOfWeek } from "date-fns";

export const registrRestaurant = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;

    const application = (await Application.findOne({
      _id: applicationId,
      applicationType: "Restaurant",
    })) as IApplicationDocument;

    if (!application) {
      res.status(400).json({
        message: "Restaurant application not found",
        success: false,
      });
      return;
    }

    if (application.status !== "Approved") {
      res.status(400).json({
        message: "Restaurant can only be registered after approval",
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

    const {
      restaurantName,
      contact,
      cuisines,
      foodType,
      openingTime,
      closingTime,
      imageUrl,
      location, // 👈 NEW
    } = application.restaurantDetails!;

    const restaurant = await Restaurant.create({
      user: applicant._id,
      restaurantName,
      contact,
      cuisines,
      foodType,
      openingTime,
      closingTime,
      imageUrl,

      location: {
        ...location,
        geo: {
          type: "Point",
          coordinates: [location.longitude, location.latitude],
        },
      },
    });

    application.isDeletable = true;
    await application.save();

    applicant.role = "Restaurant_Owner";
    applicant.applicationId = undefined;
    await applicant.save();

    res.status(200).json({
      message: "Restaurant registered successfully",
      success: true,
      restaurant,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getUserRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.id });

    if (!restaurant) {
      res.status(400).json({
        message: "You haven't registered a restaurant yet",
        success: false,
      });
      return;
    }

    res.status(200).json({
      restaurant,
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

export const updateRestaurant = async (req: Request, res: Response) => {
  try {
    const {
      restaurantName,
      cuisines,
      foodType,
      openingTime,
      closingTime,
      status: inputStatus,
      contact,
      address,
      latitude,
      longitude,
    } = req.body;

    const image = req.file;

    const restaurant = await Restaurant.findOne({ user: req.id });

    if (!restaurant) {
      res.status(400).json({
        message: "You haven't registered a restaurant yet",
        success: false,
      });
      return;
    }

    if (restaurant.user.toString() !== req.id) {
      res.status(403).json({
        message: "Not allowed to perform this action",
        success: false,
      });
      return;
    }

    /* ---------------- IMAGE UPDATE ---------------- */
    if (image) {
      try {
        if (restaurant.imageUrl) {
          deleteItemFromCloudinary(restaurant.imageUrl);
        }
        const imageUrl = await uploadImageOnCloundinary(image);
        restaurant.imageUrl = imageUrl;
      } catch (err) {
        console.error("Image upload error:", err);
        res.status(400).json({
          message: "Error uploading image",
          success: false,
        });
        return;
      }
    }

    /* ---------------- BASIC FIELDS ---------------- */
    if (restaurantName) restaurant.restaurantName = restaurantName;
    if (foodType) restaurant.foodType = foodType;
    if (openingTime) restaurant.openingTime = openingTime;
    if (closingTime) restaurant.closingTime = closingTime;
    if (inputStatus) restaurant.status = inputStatus;
    if (contact) restaurant.contact = contact;

    /* ---------------- CUISINES ---------------- */
    if (typeof cuisines === "string") {
      restaurant.cuisines = cuisines.split(",").map((c: string) => c.trim());
    }

    /* ---------------- LOCATION UPDATE ---------------- */
    if (address || latitude !== undefined || longitude !== undefined) {
      restaurant.location = {
        address: address ?? restaurant.location.address,
        latitude: Number(latitude) ?? restaurant.location.latitude,
        longitude: Number(longitude) ?? restaurant.location.longitude,
        geo: {
          type: "Point",
          coordinates: [
            Number(longitude) ?? restaurant.location.longitude,
            Number(latitude) ?? restaurant.location.latitude,
          ],
        },
      };
    }

    await restaurant.save();

    res.status(200).json({
      message: "Restaurant details updated successfully",
      success: true,
      restaurant,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const searchRestaurant = async (req: Request, res: Response) => {
  try {
    const searchQuery = (req.query.searchQuery as string) || "";
    const selectedCuisines = ((req.query.selectedCuisines as string) || "")
      .split(",")
      .filter((cuisine) => cuisine);

    const query: any = {};

    if (searchQuery) {
      query.$or = [
        { restaurantName: { $regex: searchQuery, $options: "i" } },
        { "location.address": { $regex: searchQuery, $options: "i" } },
      ];
    }

    if (selectedCuisines.length > 0) {
      query.cuisines = { $in: selectedCuisines };
    }

    const restaurants = await Restaurant.find(query);

    res.status(200).json({
      restaurants,
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

export const getRestaurantDetailsById = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.params.id;

    if (!restaurantId) {
      res.status(400).json({
        message: "Restaurant Id is required",
        success: false,
      });
      return;
    }

    let restaurant = await Restaurant.findById(restaurantId).populate("user");

    if (!restaurant) {
      res.status(400).json({
        message: "Restaurant not found!",
        success: false,
      });
      return;
    }

    res.status(200).json({
      restaurant,
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

export const getRestaurantDetailsByOwnerId = async (
  req: Request,
  res: Response,
) => {
  try {
    const ownerId = req.params.ownerId;

    if (!ownerId) {
      res.status(400).json({
        message: "Owner Id is required",
        success: false,
      });
      return;
    }

    const restaurant = await Restaurant.findOne({ user: ownerId }).populate(
      "user",
    );

    if (!restaurant) {
      res.status(404).json({
        message: "Restaurant not found!",
        success: false,
      });
      return;
    }

    res.status(200).json({
      restaurant,
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

export const updateRestaurantRating = async (req: Request, res: Response) => {
  try {
    const { id, rating } = req.params;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      res.status(400).json({
        message: "Restaurant not found",
        success: false,
      });
      return;
    }

    if (restaurant.user.toString() === req.id) {
      res.status(400).json({
        message: "You can't rate your own restaurant",
        success: false,
      });
      return;
    }

    restaurant.ratingTotal += Number(rating);

    restaurant.ratingCount += 1;
    await restaurant.save();

    res.status(200).json({
      message: `Successfully rated rating for ${restaurant.restaurantName}.`,
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

export const getAllRestaurants = async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);
    const skip = (page - 1) * limit;

    const searchTerm = (req.query.search as string) || "";
    const status = (req.query.status as string) || "All";
    const foodType = (req.query.foodType as string) || "All";
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "desc";

    const filterQuery: any = {};
    if (status !== "All") filterQuery.status = status;
    if (foodType !== "All") filterQuery.foodType = foodType;

    const sortQuery: any = buildSortQuery(sortBy, sortOrder);

    let totalCount = 0;
    let restaurants = [];

    const query = Restaurant.find(filterQuery)
      .populate({
        path: "user",
        select: "fullName email contact",
      })
      .sort(sortQuery);

    if (searchTerm) {
      const allRestaurants = await query.exec();
      const filtered = allRestaurants.filter((restaurant: any) => {
        const user = restaurant.user as IUser;
        return (
          restaurant.restaurantName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          restaurant.location.address
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      totalCount = filtered.length;
      restaurants = filtered.slice(skip, skip + limit);
    } else {
      restaurants = await query.skip(skip).limit(limit).exec();
      totalCount = await Restaurant.countDocuments(filterQuery);
    }

    res.status(200).json({
      success: true,
      restaurants,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAreaTop3Restaurant = async (req: Request, res: Response) => {
  try {
    const { area } = req.query;

    if (!area) {
      res.status(400).json({
        success: false,
        message: "Area is required",
      });
      return;
    }

    const restaurants = await Restaurant.aggregate([
      {
        $match: {
          "location.address": {
            $regex: area,
            $options: "i", // case-insensitive
          },
        },
      },
      {
        $sort: { avgRating: -1 },
      },
      {
        $limit: 3,
      },
      {
        $project: {
          restaurantName: 1,
          "location.address": 1,
          avgRating: 1,
          cuisines: 1,
          imageUrl: 1,
          ratingCount: 1,
          ratingTotal: 1,
          status: 1,
          foodType: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      restaurants,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getPopularRestaurants = async (req: Request, res: Response) => {
  try {
    const { lat, lng, city, type } = req.query; // optional lat/lng

    const user = await User.findById(req.id);
    if (!user) {
      res.status(404).json({ message: "User not found", success: false });
      return;
    }

    let filters: any = { status: "Open" };

    switch (type) {
      case "nearest":
        filters["location.geo"] = {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat],
            },
            $maxDistance: 5000, // meters
          },
        };
        break;
      case "local":
        filters["location.address"] = { $regex: city, $options: "i" };
        break;
    }

    const restaurants = await Restaurant.find(filters)
      .sort({ orderServed: -1, avgRating: -1 })
      .select("-orders -earnings")
      .limit(8)
      .lean();

    res.status(200).json({
      restaurants,
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

export const getRestaurantStats = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.id })
      .populate("user")
      .lean();

    if (!restaurant) {
      res.status(404).json({ success: false, message: "Restaurant not found" });
      return;
    }
    const restaurantId = restaurant._id;

    const allOrders = await Orders.find({ restaurant: restaurantId }).lean();
    const allDishes = await Dish.find({ restaurant: restaurantId }).lean();

    // Earnings
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // === Weekly Earnings ===
    const weeklyRaw = await Orders.aggregate([
      {
        $match: {
          restaurant: restaurant._id,
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
      { $unwind: "$cartItems" },
      {
        $group: {
          _id: { $dayOfWeek: "$deliveredTime" },
          earnings: {
            $sum: {
              $multiply: ["$cartItems.costPrice", "$cartItems.quantity"],
            },
          },
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

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const earningsMap = Object.fromEntries(
      weeklyRaw.map((d) => [d.day, d.earnings]),
    );

    const weeklyEarnings = days.map((day) => ({
      day,
      earnings: earningsMap[day] || 0,
    }));

    // === Monthly Trend (last 6 months) ===
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const monthlyRaw = await Orders.aggregate([
      {
        $match: {
          restaurant: restaurant._id,
          currentStatus: "Delivered",
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      { $unwind: "$cartItems" },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          earnings: {
            $sum: {
              $multiply: ["$cartItems.costPrice", "$cartItems.quantity"],
            },
          },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              {
                $arrayElemAt: [
                  [
                    "",
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ],
                  "$_id.month",
                ],
              },
              " ",
              { $toString: "$_id.year" },
            ],
          },
          earnings: 1,
        },
      },
    ]);

    const monthlyTrend = monthlyRaw.map((m) => ({
      month: m.month,
      earnings: m.earnings,
    }));

    const earnings = {
      ...restaurant.earnings,
      weeklyEarnings,
      monthlyTrend,
    };

    // Order Stats
    const totalOrders = allOrders.length;
    const deliveredOrders = allOrders.filter(
      (o) => o.currentStatus === "Delivered",
    ).length;
    const canceledOrders = allOrders.filter(
      (o) => o.currentStatus === "Canceled",
    ).length;
    const pendingOrders = allOrders.filter(
      (o) => !["Delivered", "Canceled"].includes(o.currentStatus),
    ).length;
    const totalRevenue = allOrders.reduce(
      (acc, order) =>
        acc + order.cartItems.reduce((acc, item) => acc + item.costPrice, 0),
      0,
    );
    const avgOrderValue =
      totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const dishMap: Record<
      string,
      { name: string; orders: number; revenue: number }
    > = {};

    allDishes.forEach((dish) => {
      dishMap[dish.name] = {
        name: dish.name,
        orders: dish.totalUnitsSold,
        revenue: dish.totalUnitsSold * dish.costPrice,
      };
    });

    const topDishes = Object.values(dishMap)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    const recentOrders = allOrders
      .slice(-4)
      .reverse()
      .map((o) => ({
        id: o._id.toString(),
        customer: (o.user as any)?.fullName || "Customer",
        items: o.cartItems.length,
        amount: o.bill.grandTotal,
        status: o.currentStatus,
        time: o.statusDetails.slice(-1)[0]?.time, // or format as 'x min ago'
      }));

    const ordersByHour: Record<string, number> = {};
    allOrders.forEach((order) => {
      const hour = new Date(order.statusDetails[1]?.time).getHours();
      const label = `${hour % 12 || 12}${hour >= 12 ? "PM" : "AM"}`;
      ordersByHour[label] = (ordersByHour[label] || 0) + 1;
    });

    // Ratings Distribution
    const ratingCounts: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    allOrders.forEach((order) => {
      const rating = order.ratingDetails?.restaurant;
      if (rating && ratingCounts[rating] !== undefined) {
        ratingCounts[rating]++;
      }
    });
    const totalRatings = Object.values(ratingCounts).reduce((a, b) => a + b, 0);
    const distribution = Object.entries(ratingCounts).map(
      ([rating, count]) => ({
        rating: Number(rating),
        count,
        percentage: totalRatings
          ? Number(((count / totalRatings) * 100).toFixed(1))
          : 0,
      }),
    );

    // Dish Performance
    const availableDishes = allDishes.filter((d) => d.isAvailable);

    const topRatedDishes = allDishes
      .filter((d) => d.ratingCount > 0)
      .sort((a, b) => {
        if (b.avgRating !== a.avgRating) {
          return b.avgRating - a.avgRating;
        }
        return b.totalUnitsSold - a.totalUnitsSold;
      })
      .slice(0, 5)
      .map((d) => ({
        name: d.name,
        rating: d.avgRating,
        orders: d.totalUnitsSold,
        revenue: d.totalUnitsSold * d.costPrice,
      }));

    const leastPerforming = allDishes
      .filter((d) => d.ratingCount > 0)
      .sort((a, b) => {
        if (a.avgRating !== b.avgRating) {
          return a.avgRating - b.avgRating;
        }
        return a.totalUnitsSold - b.totalUnitsSold;
      })
      .slice(0, 3)
      .map((d) => ({
        name: d.name,
        rating: d.avgRating,
        orders: d.totalUnitsSold,
        revenue: d.totalUnitsSold * d.costPrice,
      }));

    const categoryMap: Record<
      string,
      { category: string; dishes: number; orders: number; revenue: number }
    > = {};
    allDishes.forEach((dish) => {
      if (!categoryMap[dish.category]) {
        categoryMap[dish.category] = {
          category: dish.category,
          dishes: 0,
          orders: 0,
          revenue: 0,
        };
      }
      categoryMap[dish.category].dishes++;
      categoryMap[dish.category].orders += dish.orderCount; //add unit sold also
      categoryMap[dish.category].revenue +=
        dish.totalUnitsSold * dish.costPrice;
    });

    const dishPerformance = {
      totalDishes: allDishes.length,
      availableDishes: availableDishes.length,
      topRatedDishes,
      leastPerforming,
      categoryWise: Object.values(categoryMap),
    };

    const today = new Date();

    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const todayOrders = allOrders.filter((order) => {
      const orderTime = new Date(order.createdAt);
      return orderTime >= startOfToday && orderTime <= endOfToday;
    }).length;

    const stats = {
      profile: {
        name: restaurant.restaurantName,
        owner: {
          name: (restaurant.user as any)?.fullName,
          email: (restaurant.user as any)?.email,
          phone: restaurant.contact,
        },
        location: restaurant.location,
        cuisineTypes: restaurant.cuisines,
        status: restaurant.status,
        avgRating: restaurant.avgRating,
        totalReviews: restaurant.ratingCount,
        totalDishes: allDishes.length,
        createdAt: restaurant.createdAt,
        isVerified: true,
        banner: restaurant.imageUrl,
      },
      earnings,
      orderStats: {
        totalOrders,
         todayOrders,
        deliveredOrders,
        canceledOrders,
        pendingOrders,
        avgOrderValue,
        topDishes,
        recentOrders,
        ordersByHour: Object.entries(ordersByHour).map(([hour, count]) => ({
          hour,
          orders: count,
        })),
      },
      ratings: {
        avgRating: restaurant.avgRating,
        totalRatings,
        distribution,
      },
      dishPerformance,
    };

    res.status(200).json({ success: true, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateRestaurantStatus = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.params.id;
    const status = req.body.status?.toLowerCase();

    const allowedStatuses = ["open", "closed", "busy"];
    if (!allowedStatuses.includes(status)) {
      res.status(400).json({ message: "Invalid status", success: false });
      return;
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      res.status(400).json({ message: "Restaurant not found", success: false });
      return;
    }

    if (restaurant.user.toString() !== req.id) {
      res.status(403).json({
        message: "Not allowed to perform this action",
        success: false,
      });
      return;
    }

    restaurant.status = status.charAt(0).toUpperCase() + status.slice(1); // "open" -> "Open"
    await restaurant.save();

    res.status(200).json({
      message: `${restaurant.restaurantName} is now ${restaurant.status}`,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getRestaurantMenu = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;

    let restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      res.status(400).json({
        message: "Restaurant not found!",
        success: false,
      });
      return;
    }

    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);
    const skip = (page - 1) * limit;

    const searchTerm = (req.query.search as string) || "";
    const category = (req.query.category as string) || "All";
    const foodType = (req.query.foodType as string) || "All";
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "desc";

    const minPrice = parseFloat(req.query.minPrice as string);
    const maxPrice = parseFloat(req.query.maxPrice as string);

    const filterQuery: any = {
      restaurant: restaurantId,
    };
    if (category !== "All") filterQuery.category = category;
    if (foodType !== "All") filterQuery.isVeg = foodType === "Pure_Veg";

    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      filterQuery.sellingPrice = {};
      if (!isNaN(minPrice)) filterQuery.sellingPrice.$gte = minPrice;
      if (!isNaN(maxPrice)) filterQuery.sellingPrice.$lte = maxPrice;
    }

    const sortQuery: any = buildSortQuery(sortBy, sortOrder);

    let totalCount = 0;
    let dishes = [];

    const query = Dish.find(filterQuery)
      .populate({
        path: "restaurant",
        select: "restaurantName address status user",
      })
      .sort(sortQuery);

    if (searchTerm) {
      const allDishes = await query.exec();
      const filtered = allDishes.filter((dish: any) => {
        const dishRestaurant = dish.restaurant as IRestaurantDocument;
        return (
          dish.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dish.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dish.tags
            .join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          dishRestaurant.restaurantName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
      });
      totalCount = filtered.length;
      dishes = filtered.slice(skip, skip + limit);
    } else {
      dishes = await query.skip(skip).limit(limit).exec();
      totalCount = await Dish.countDocuments(filterQuery);
    }

    res.status(200).json({
      success: true,
      menu: dishes,

      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
