import { Request, Response } from "express";
import { IRestaurantDocument, Restaurant } from "../models/restaurant.model";
import {
  Bill,
  CartItem,
  DeliveryDetails,
  IOrderDocument,
  Orders,
  PopulatedOrderFull,
  PopulatedOrderRestaurant,
  RatingDetails,
} from "../models/order.model";
import { instance } from "../utils/razorpay";
import crypto from "crypto";
import {
  emitToUser,
  getOtp,
  getShippingDetails,
} from "../utils/utilityFunctions";
import { IUserDocument, User } from "../models/user.model";
import mongoose, { Types } from "mongoose";
import {
  DeliveryAgent,
  IDeliveryAgentDocument,
} from "../models/deliveryAgent.model";
import { Dish, IDishDocument } from "../models/dish.model";
import { GST_RATE } from "../utils/dataSet";
import { ILocation } from "../models/subschemas/location.schema";
import { Transaction } from "../models/transaction.model";

export const getRazorPayKey = (req: Request, res: Response) => {
  try {
    res.status(200).json({
      key: process.env.RAZORPAY_API_KEY,
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

type OrderRequest = {
  cart: CartItem[];
  deliveryDetails: {
    drop: ILocation; // user location snapshot
  };
  restaurantId: string;
};

export const placeOrder = async (req: Request, res: Response) => {
  try {
    /* ================== BASIC INPUT VALIDATION ================== */
    const orderReq: OrderRequest | undefined = req.body.orderDetails;

    if (!orderReq) {
      res
        .status(400)
        .json({ success: false, message: "Order details are required" });
      return;
    }

    const { cart, deliveryDetails, restaurantId } = orderReq;

    if (!restaurantId) {
      res
        .status(400)
        .json({ success: false, message: "Restaurant ID is required" });
      return;
    }

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      res.status(400).json({ success: false, message: "Cart cannot be empty" });
      return;
    }

    if (!deliveryDetails || !deliveryDetails.drop) {
      res.status(400).json({
        success: false,
        message: "Delivery drop location is required",
      });
      return;
    }

    const { drop } = deliveryDetails;

    if (
      !drop.address ||
      typeof drop.latitude !== "number" ||
      typeof drop.longitude !== "number"
    ) {
      res.status(400).json({
        success: false,
        message: "Incomplete delivery address details",
      });
      return;
    }

    for (const item of cart) {
      if (
        !item.dishId ||
        !item.quantity ||
        item.quantity <= 0 ||
        !item.sellingPrice
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid cart item data",
        });
        return;
      }
    }

    /* ================== FETCH RESTAURANT ================== */
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      res.status(400).json({ success: false, message: "Restaurant not found" });
      return;
    }

    /* ================== FETCH USER ================== */
    const user = await User.findById(req.id);
    if (!user) {
      res.status(400).json({ success: false, message: "User not found" });
      return;
    }

    const pickup = restaurant.location;

    /* ================== VALIDATE CART ITEMS ================== */
    const menu = (await Dish.find({
      restaurant: restaurantId,
    }).select("id")) as Types.ObjectId[];

    const menuIds = menu.map((dish) => dish._id.toString());

    for (const item of cart) {
      if (!menuIds.includes(item.dishId.toString())) {
        res.status(400).json({
          success: false,
          message: `Dish ${item.name} is not available in restaurant`,
        });
        return;
      }
    }

    /* ================== BILL CALCULATION ================== */
    const cartTotal = cart.reduce(
      (acc: number, item: CartItem) => acc + item.sellingPrice * item.quantity,
      0,
    );

    const shippingDetails = getShippingDetails(
      { latitude: pickup.latitude, longitude: pickup.longitude },
      { latitude: drop.latitude, longitude: drop.longitude },
    );

    const appFee = Number(process.env.APP_FEE);
    const gstAmount = Math.ceil(cartTotal * GST_RATE);
    const grandTotal = Math.ceil(
      cartTotal + gstAmount + shippingDetails.fee + appFee,
    );

    const bill: Bill = {
      cartTotal,
      shippingFee: shippingDetails.fee,
      gstAmount,
      grandTotal,
      appFee,
    };

    /* ================== LOCATION SNAPSHOT ================== */
    const createLocation = (loc: {
      address: string;
      latitude: number;
      longitude: number;
    }): ILocation => ({
      ...loc,
      geo: {
        type: "Point",
        coordinates: [loc.longitude, loc.latitude],
      },
    });

    const deliveryDetailsFinal: DeliveryDetails = {
      pickup,
      drop: createLocation(drop),
      distanceKm: shippingDetails.distance,
      estimatedTimeMin: shippingDetails.time,
    };

    /* ================== CREATE ORDER ================== */
    const order = await Orders.create({
      user: req.id,
      restaurant: restaurantId,
      deliveryDetails: deliveryDetailsFinal,
      cartItems: cart,
      bill,
      currentStatus: "Pending",
    });

    await User.updateOne({ _id: req.id }, { $push: { orders: order._id } });

    const newOrder = await order.populate([
      { path: "user", select: "fullName email contact address" },
      { path: "restaurant", select: "restaurantName contact address" },
    ]);

    res.status(200).json({ success: true, newOrder });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;

    const order = await Orders.findById(orderId).populate({
      path: "user",
      select: "fullName email contact",
    });

    if (!order) {
      res.status(400).json({
        message: "Order not found",
        success: false,
      });
      return;
    }

    const restaurant = await Restaurant.findById(order.restaurant);

    if (!restaurant) {
      res.status(400).json({
        message: "Restaurant not found",
        success: false,
      });
      return;
    }

    // payment
    const options = {
      amount: Number(Math.floor(order.bill.grandTotal) * 100),
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };
    const razorpay_order = await instance.orders.create(options);

    order.razorpayOrderId = razorpay_order.id;
    await order.save();

    res.status(200).json({
      success: true,
      razorpayOrderId: razorpay_order.id,
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const paymentVerification = async (req: Request, res: Response) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const paymentSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = razorpay_signature === paymentSignature;

    let isSuccess;

    const order = (await Orders.findOne({
      razorpayOrderId: razorpay_order_id,
    })) as IOrderDocument;
    const restaurant = (await Restaurant.findById(
      order.restaurant,
    )) as IRestaurantDocument;

    if (isAuthentic) {
      order.currentStatus = "Placed";
      order.paymentId = razorpay_payment_id;
      order.isVerified = true;
      order.paidAt = new Date();

      restaurant.orderPlaced += 1;
      restaurant.orders.push(order._id);
      await restaurant.save();

      emitToUser(restaurant.user.toString(), "new-order-placed", {
        orderId: order._id,
      });

      await order.save();
      isSuccess = "success";
    } else {
      isSuccess = "failed";
    }

    res.redirect(
      `${process.env.FRONTEND_URL}/customer/order/payment-result?result=${isSuccess}&orderId=${order._id}&paymentId=${razorpay_payment_id}&amount=${order.bill.grandTotal}`,
    );
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;

    const order = (await Orders.findById(orderId)
      .populate({ path: "restaurant" })
      .populate({ path: "user", select: "fullName email contact profilePic" })
      .populate({
        path: "deliveryAgent",
        select:
          "licenseNumber vehicleNumber vehicleType status avgRating ratingCount",
        populate: {
          path: "user",
          select: "fullName email contact profilePic",
        },
      })) as PopulatedOrderRestaurant | null;

    if (!order) {
      res.status(400).json({ message: "Order not found", success: false });
      return;
    }

    const user = (await User.findById(req.id)) as IUserDocument | null;

    if (!user) {
      res.status(400).json({ message: "User not found", success: false });
      return;
    }

    const restaurant = await Restaurant.findById(order.restaurant);
    if (!restaurant) {
      res.status(400).json({ message: "Restaurant not found", success: false });
      return;
    }

    const userId = user._id.toString();

    const isCustomer = userId === order.user._id.toString();
    const isRestaurantOwner = userId === order.restaurant.user.toString();

    if (!isCustomer && !isRestaurantOwner) {
      res.status(400).json({
        message: "You are not authorized to cancel this order",
        success: false,
      });
      return;
    }

    if (order.deliveryAgent) {
      res.status(400).json({
        message:
          "Order cancellation is not allowed after assignment of delivery agent",
        success: false,
      });
      return;
    }

    if (isCustomer) {
      restaurant.orderPlaced = Math.max(0, restaurant.orderPlaced - 1);
      await restaurant.save();
    }

    const customerTransaction = await Transaction.create({
      userId,
      userType: "Customer",
      orderId,
      amount: order.bill.grandTotal - order.bill.appFee,
      reason: "Order_Cancel_Refund",
      status: "Pending",
      recievedAt:order.paidAt
    });

    order.cancellationDetails = {
      cancelBy: user._id,
      userType: isCustomer ? "Customer" : "Restaurant_Owner",
      reason: req.body.reason || "No reason provided",
      transactionId: customerTransaction._id,
    };

    order.currentStatus = "Canceled";
    order.isActive = false;
    await order.save();

    const customerId = order.user.toString();
    const ownerId = order.restaurant.toString();

    // Emit order status updates to customer, agent, and restaurant
    const uniqueReceivers = new Set<string>();

    if (isCustomer) {
      uniqueReceivers.add(ownerId);
    } else {
      uniqueReceivers.add(customerId);
    }

    for (const receiverId of uniqueReceivers) {
      emitToUser(receiverId, "order-status-update", { updatedOrder: order });
    }

    res.status(200).json({
      message: "Order canceled successfully",
      success: true,
      updatedOrder: order,
      canceledBy: user.role,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// CONFIRMED -> PREPARING -> READY -> OUTFORDELIVERY -> DELIVERED

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const { inpParcelOtp } = req.body;

    let { status } = req.body;

    const order = (await Orders.findById(orderId).populate(
      "deliveryAgent",
    )) as IOrderDocument;
    if (!order) {
      res.status(400).json({ success: false, message: "Order not found" });
      return;
    }

    const user = await User.findById(req.id);
    if (!user) {
      res.status(400).json({ success: false, message: "User not found" });
      return;
    }

    const restaurant = (await Restaurant.findById(
      order.restaurant,
    )) as IRestaurantDocument;
    if (!restaurant) {
      res.status(400).json({ success: false, message: "Restaurant not found" });
      return;
    }

    switch (status) {
      // --------------------- CONFIRMED ---------------------
      case "Confirmed": {
        const pickupLat = order.deliveryDetails.pickup.latitude;
        const pickupLng = order.deliveryDetails.pickup.longitude;
        const FIVE_MINUTES = 5 * 60 * 1000;

        // find available agents within 5km with no active orders
        const agents = await DeliveryAgent.find({
          activeOrders: { $size: 0 },
          status: "Available",
          lastLocationUpdatedAt: { $gte: new Date(Date.now() - FIVE_MINUTES) },
          "lastLocation.geo": {
            $near: {
              $geometry: { type: "Point", coordinates: [pickupLng, pickupLat] },
              $maxDistance: 5000,
            },
          },
        }).select("user");

        for (const agent of agents) {
          emitToUser(agent.user.toString(), "new-pickup-order", {
            orderId: order._id,
            pickupLocation: order.deliveryDetails.pickup,
          });
        }
        break;
      }

      // --------------------- READY FOR PICKUP ---------------------
      case "ReadyForPickup": {
        if (order.deliveryAgent) break;

        // assign agent with least activeOrders from restaurant's preferred list
        const agents = await DeliveryAgent.find({
          _id: { $in: restaurant.fallbackAgents || [] },
          status: { $in: ["Available", "OnDelivery"] },
        }).sort({ "activeOrders.length": 1 });

        if (!agents.length) {
          res
            .status(400)
            .json({ success: false, message: "No delivery agent available" });
          return;
        }

        const agent = agents[0];
        order.deliveryAgent = agent._id;
        agent.activeOrders.push(order._id);
        agent.status = "OnDelivery";
        order.agentAssignmentType = "Fallback";

        order.statusDetails.push({ status, time: new Date() });
        status = "AcceptedByAgent";

        await agent.save();
        break;
      }

      // --------------------- OUT FOR DELIVERY ---------------------
      case "OutForDelivery": {
        if (order.deliveryDetails.parcelAcceptedOtp?.code !== inpParcelOtp) {
          res.status(400).json({
            success: false,
            message: "Invalid or expired Parcel Accepted OTP",
          });
          return;
        }
        if (!order.deliveryAgent) {
          res.status(400).json({
            message: "No agent assigned to this order",
            success: false,
          });
          return;
        }

        const agent = (await DeliveryAgent.findOne({
          user: user._id,
        })) as IDeliveryAgentDocument;
        if (!agent) {
          res.status(400).json({
            message: "Delivery Agent not found",
            success: false,
          });
          return;
        }

        if (!order.deliveryAgent.equals(agent.id)) {
          res.status(403).json({
            message: "You are not authorized for this order",
            success: false,
          });
          return;
        }

        order.deliveryDetails.parcelAcceptedOtp = undefined;
        order.markModified("deliveryDetails");
        break;
      }

      // --------------------- DELIVERED ---------------------
      case "Delivered": {
        if (order.deliveryDetails.parcelDeliveredOtp?.code !== inpParcelOtp) {
          res.status(400).json({
            success: false,
            message: "Invalid or expired Parcel Delivered OTP",
          });
          return;
        }

        const agent = (await DeliveryAgent.findOne({
          user: user._id,
        })) as IDeliveryAgentDocument;
        if (!agent) {
          res
            .status(400)
            .json({ success: false, message: "Delivery Agent not found" });
          return;
        }

        if (order.deliveryAgent?._id?.toString() !== agent._id.toString()) {
          res.status(403).json({
            success: false,
            message: "You are not authorized for this order",
          });
          return;
        }

        // Clear OTP
        order.isActive = false;
        order.deliveryDetails.parcelDeliveredOtp = undefined;
        order.markModified("deliveryDetails");

        // Update agent stats
        agent.totalDeliveries += 1;
        agent.activeOrders = agent.activeOrders.filter(
          (id) => !id.equals(order._id),
        );
        if (agent.activeOrders.length === 0) agent.status = "Available";

        const deliveryEarning = order.bill.shippingFee || 0;
        agent.earnings.today += deliveryEarning;
        agent.earnings.thisWeek += deliveryEarning;
        agent.earnings.thisMonth += deliveryEarning;
        agent.earnings.total += deliveryEarning;

        await agent.save();

        // Update restaurant stats and earnings
        let restaurantEarning = 0;
        for (const item of order.cartItems) {
          const dish = await Dish.findById(item.dishId);
          if (dish) {
            dish.totalUnitsSold += item.quantity;
            dish.orderCount += 1;
            await dish.save();
          }
          restaurantEarning += (item?.costPrice || 0) * (item?.quantity || 1);
        }

        restaurant.earnings.today += restaurantEarning;
        restaurant.earnings.thisWeek += restaurantEarning;
        restaurant.earnings.thisMonth += restaurantEarning;
        restaurant.earnings.total += restaurantEarning;
        restaurant.orderServed += 1;
        await restaurant.save();

        // Transaction logs
        await Transaction.create({
          userId: restaurant._id,
          userType: "Restaurant",
          orderId,
          amount: restaurantEarning,
          reason: "Order_Delivered",
          status: "Pending",
          recievedAt:order.paidAt
        });
        await Transaction.create({
          userId: agent.user,
          userType: "Delivery",
          orderId,
          amount: deliveryEarning,
          reason: "Order_Delivered",
          status: "Pending",
          recievedAt:order.paidAt
        });

        break;
      }

      default:
        break;
    }

    // Append to status history
    order.statusDetails.push({ status, time: new Date() });
    order.currentStatus = status;
    await order.save();

    const baseQuery = Orders.findById(orderId);
    const populatedOrder = await applyOrderPopulates(baseQuery);

    const customerId = order.user.toString();
    const ownerId = populatedOrder.restaurant.user.toString();
    const agentId = order.deliveryAgent?.toString();

    const uniqueReceivers = new Set<string>();
    uniqueReceivers.add(customerId);
    if (user.role === "Restaurant_Owner" && agentId)
      uniqueReceivers.add(agentId);
    else if (user.role === "Delivery_Agent") uniqueReceivers.add(ownerId);

    for (const receiverId of uniqueReceivers) {
      emitToUser(receiverId, "order-status-update", {
        updatedOrder: populatedOrder,
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully updated order status to ${status}`,
      updatedOrder: populatedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const generateOrderOtp = async (req: Request, res: Response) => {
  try {
    const { type } = req.params; // "OutForDelivery" | "Delivered"
    const orderId = req.params.id;
    const userId = req.id;

    if (!["OutForDelivery", "Delivered"].includes(type)) {
      res.status(400).json({
        success: false,
        message: "Invalid OTP type",
      });
      return 
    }

    const order = await applyOrderPopulates(
      Orders.findById(orderId)
    ) as PopulatedOrderFull | null;

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return
    }

    if (order.deliveryAgent?.user._id.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: "Only delivery agent can generate OTP",
      });
      return
    }

    if (
      (type === "OutForDelivery" && order.currentStatus !== "AcceptedByAgent") ||
      (type === "Delivered" && order.currentStatus !== "OutForDelivery" )
    ) {
      res.status(400).json({
        success: false,
        message: "OTP generation not allowed for current order status",
      });
      return
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const otpPayload = {
      code: getOtp(),
      expiresAt,
    };

    if (type === "OutForDelivery") {
      order.deliveryDetails.parcelAcceptedOtp = otpPayload;
    } else {
      order.deliveryDetails.parcelDeliveredOtp = otpPayload;
    }

    await order.save();

    /* ---------------- SOCKET EMISSION ---------------- */

    const customerId = order.user._id.toString();
    const ownerId = order.restaurant.user.toString();

    const receivers = new Set<string>();

    if (type === "OutForDelivery") {
      receivers.add(ownerId); // restaurant owner
    }

    if (type === "Delivered") {
      receivers.add(customerId); // customer
    }

    for (const receiverId of receivers) {
      emitToUser(receiverId, "order-otp-generated", {
        orderId: order._id,
        type,
        expiresAt,
      });
    }

    res.status(200).json({
      success: true,
      updatedOrder:order,
      message: `OTP sent to ${
        type === "OutForDelivery" ? "restaurant owner" : "customer"
      }`,
    });
  } catch (error) {
    console.error("Generate OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const deletePendingOrder = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;

    const order = (await Orders.findById(orderId)) as IOrderDocument | null;

    if (!order) {
      res.status(400).json({ message: "Order not found", success: false });
      return;
    }

    const user = (await User.findById(req.id)) as IUserDocument | null;

    if (!user) {
      res.status(400).json({ message: "User not found", success: false });
      return;
    }

    const userId = user._id as mongoose.Types.ObjectId;

    const isCustomer = userId.equals(order.user as Types.ObjectId);

    if (!isCustomer) {
      res.status(400).json({
        message: "You are not authorized to remove this order",
        success: false,
      });
      return;
    }

    if (order.currentStatus !== "Pending") {
      res.status(400).json({
        message: "Order can only be deleted at pending stage",
        success: false,
      });
      return;
    }
    await order.deleteOne();
    user.orders = user.orders.filter((orderId) => orderId !== order._id);

    await user.save();

    res.status(200).json({
      message: "Order deleted successfully",
      success: true,
      updatedOrder: order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

interface RatingData {
  restaurantRating?: { [id: string]: number };
  dishRatings?: { [dishId: string]: number };
  deliveryAgentRating?: { [id: string]: number };
}

export const setOrderRating = async (req: Request, res: Response) => {
  try {
    const ratingData = req.body.ratingData as RatingData;
    const orderId = req.params.id;

    const order = await Orders.findById(orderId);
    if (!order) {
      res.status(400).json({ success: false, message: "Order not found" });
      return;
    }

    const ratingDetails: RatingDetails = {
      restaurant: 0,
      deliveryAgent: 0,
      food: 0,
    };
    const missingEntities: string[] = [];

    const entitiesToUpdate = {
      restaurant: null as null | { doc: any; rating: number },
      agent: null as null | { doc: any; rating: number },
      dishes: [] as { doc: any; rating: number }[],
    };

    if (ratingData.restaurantRating) {
      const [restaurantId] = Object.keys(ratingData.restaurantRating);
      const rating = Number(ratingData.restaurantRating[restaurantId]);

      if (!Number.isFinite(rating)) {
        res
          .status(400)
          .json({ success: false, message: "Invalid restaurant rating value" });
        return;
      }

      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        missingEntities.push(`Restaurant (${restaurantId})`);
      } else {
        entitiesToUpdate.restaurant = { doc: restaurant, rating };
        ratingDetails.restaurant = rating;
      }
    }

    if (ratingData.deliveryAgentRating) {
      const [agentId] = Object.keys(ratingData.deliveryAgentRating);
      const rating = Number(ratingData.deliveryAgentRating[agentId]);

      if (!Number.isFinite(rating)) {
        res.status(400).json({
          success: false,
          message: "Invalid delivery agent rating value",
        });
        return;
      }

      const agent = await DeliveryAgent.findOne({ user: agentId });
      if (!agent) {
        missingEntities.push(`Delivery Agent (${agentId})`);
      } else {
        entitiesToUpdate.agent = { doc: agent, rating };
        ratingDetails.deliveryAgent = rating;
      }
    }

    if (ratingData.dishRatings) {
      let total = 0;
      let count = 0;

      for (const dishId of Object.keys(ratingData.dishRatings)) {
        const rating = Number(ratingData.dishRatings[dishId]);
        if (!Number.isFinite(rating)) {
          res.status(400).json({
            success: false,
            message: `Invalid rating for dish (${dishId})`,
          });
          return;
        }

        const dish = await Dish.findById(dishId);
        if (!dish) {
          missingEntities.push(`Dish (${dishId})`);
        } else {
          entitiesToUpdate.dishes.push({ doc: dish, rating });
          total += rating;
          count++;
        }
      }

      if (count > 0) {
        ratingDetails.food = parseFloat((total / count).toFixed(1));
      }
    }

    // Stop if something is missing
    if (missingEntities.length > 0) {
      res.status(400).json({
        success: false,
        message: `The following items were not found: ${missingEntities.join(
          ", ",
        )}`,
      });
      return;
    }

    if (entitiesToUpdate.restaurant) {
      const { doc, rating } = entitiesToUpdate.restaurant;
      doc.ratingTotal += rating;
      doc.ratingCount += 1;
      await doc.save();
    }

    if (entitiesToUpdate.agent) {
      const { doc, rating } = entitiesToUpdate.agent;
      doc.ratingTotal += rating;
      doc.ratingCount += 1;
      await doc.save();
    }

    for (const { doc, rating } of entitiesToUpdate.dishes) {
      doc.ratingTotal += rating;
      doc.ratingCount += 1;
      await doc.save();
    }

    order.ratingDetails = ratingDetails;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      ratingDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getOrdersHistory = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const {
      type,
      id,
      search,
      dateFrom,
      dateTo,
      minAmount,
      maxAmount,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    /* ---------------- RESTAURANT ---------------- */

    const matchStage: any = {
      isActive: false,
      currentStatus: { $ne: "Pending" },
    };

    if (type === "Customer") {
      const user = await User.findById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }
      matchStage.user = user._id;
    } else if (type === "Restaurant_Owner") {
      const restaurant = await Restaurant.findOne({
        _id: id,
        user: req.id,
      }).select("_id");

      if (!restaurant) {
        res.status(404).json({
          success: false,
          message: "Restaurant not found",
        });
        return;
      }

      matchStage.restaurant = restaurant._id;
    } else if (type === "Delivery_Agent") {
      const agent = await DeliveryAgent.findOne({
        user: req.id,
        _id: id,
      }).select("_id");

      if (!agent) {
        res.status(404).json({
          success: false,
          message: "Delivery agent not found",
        });
        return;
      }

      matchStage.deliveryAgent = agent._id;
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid user type",
      });
      return;
    }

    /* ---------------- DATE FILTER ---------------- */
    if (dateFrom || dateTo) {
      matchStage.createdAt = {};
      if (dateFrom) matchStage.createdAt.$gte = new Date(dateFrom as string);

      if (dateTo) {
        const end = new Date(dateTo as string);
        end.setHours(23, 59, 59, 999);
        matchStage.createdAt.$lte = end;
      }
    }

    /* ---------------- AMOUNT FILTER ---------------- */
    if (minAmount || maxAmount) {
      matchStage["bill.grandTotal"] = {};
      if (minAmount) matchStage["bill.grandTotal"].$gte = Number(minAmount);
      if (maxAmount) matchStage["bill.grandTotal"].$lte = Number(maxAmount);
    }

    /* ---------------- SORT ---------------- */
    const sortStage: any = {};
    const allowedSortFields = ["createdAt", "bill.grandTotal"];

    sortStage[
      allowedSortFields.includes(sortBy as string)
        ? (sortBy as string)
        : "createdAt"
    ] = sortOrder === "asc" ? 1 : -1;

    /* ---------------- AGGREGATION PIPELINE ---------------- */
    const pipeline: any[] = [
      { $match: matchStage },

      /* USER */
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      /* RESTAURANT */
      {
        $lookup: {
          from: "restaurants",
          localField: "restaurant",
          foreignField: "_id",
          as: "restaurant",
        },
      },
      { $unwind: "$restaurant" },

      {
        $lookup: {
          from: "dishes",
          localField: "dishId",
          foreignField: "_id",
          as: "dishId",
        },
      },
      { $unwind: "$restaurant" },

      /* DELIVERY AGENT */
      {
        $lookup: {
          from: "deliveryagents",
          localField: "deliveryAgent",
          foreignField: "_id",
          as: "deliveryAgent",
        },
      },
      {
        $unwind: {
          path: "$deliveryAgent",
          preserveNullAndEmptyArrays: true,
        },
      },

      /* DELIVERY AGENT → USER */
      {
        $lookup: {
          from: "users",
          localField: "deliveryAgent.user",
          foreignField: "_id",
          as: "deliveryAgent.user",
        },
      },
      {
        $unwind: {
          path: "$deliveryAgent.user",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    /* ---------------- SEARCH ---------------- */
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "user.fullName": { $regex: search, $options: "i" } },
            {
              "deliveryAgent.user.fullName": {
                $regex: search,
                $options: "i",
              },
            },
            {
              "deliveryDetails.pickup.address": {
                $regex: search,
                $options: "i",
              },
            },
            {
              "deliveryDetails.drop.address": {
                $regex: search,
                $options: "i",
              },
            },
          ],
        },
      });
    }

    /* ---------------- PROJECT (PURE INCLUSION) ---------------- */
    pipeline.push({
      $project: {
        bill: 1,
        currentStatus: 1,
        deliveryDetails: 1,
        createdAt: 1,
        cartItems: 1,
        cancellationDetails: 1,
        ratingDetails: 1,
        statusDetails: 1,

        user: {
          fullName: 1,
          email: 1,
          contact: 1,
          profilePic: 1,
        },

        restaurant: {
          _id: 1,
          restaurantName: 1,
          contact: 1,
          openingTime: 1,
          closingTime: 1,
        },
        deliveryAgent: {
          licenseNumber: 1,
          vehicleNumber: 1,
          vehicleType: 1,
          avgRating: 1,
          ratingCount: 1,
          user: {
            fullName: 1,
            email: 1,
            contact: 1,
            profilePic: 1,
          },
        },
      },
    });

    /* ---------------- PAGINATION ---------------- */
    pipeline.push(
      { $sort: sortStage },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    );

    /* ---------------- EXECUTE ---------------- */
    const ordersHistory = await Orders.aggregate(pipeline);

    /* ---------------- COUNT ---------------- */
    const countPipeline = pipeline.filter(
      (stage) => !stage.$skip && !stage.$limit && !stage.$sort,
    );

    countPipeline.push({ $count: "total" });

    const countResult = await Orders.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;

    /* ---------------- RESPONSE ---------------- */
    res.status(200).json({
      success: true,
      ordersHistory,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
    });
  } catch (error) {
    console.error("getOrdersHistory error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getActiveOrders = async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;

    const filter: any = {
      isActive: true,
    };

    if (type === "Customer") {
      const user = await User.findById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      filter.user = id;
    } else if (type === "Restaurant_Owner") {
      const restaurant = await Restaurant.findOne({
        _id: id,
        user: req.id,
      });

      if (!restaurant) {
        res.status(404).json({
          success: false,
          message: "Restaurant not found",
        });
        return;
      }

      filter.restaurant = id;
      filter.currentStatus = { $ne: "Pending" };
    } else if (type === "Delivery_Agent") {
      const agent = await DeliveryAgent.findOne({
        user: req.id,
        _id: id,
      }).select("_id");

      if (!agent) {
        res.status(404).json({
          success: false,
          message: "Delivery agent not found",
        });
        return;
      }

      filter.deliveryAgent = agent._id;
      filter.currentStatus = { $ne: "Pending" };
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid user type",
      });
      return;
    }

    const activeOrders = await applyOrderPopulates(
      Orders.find(filter).sort({ createdAt: -1 }),
    );

    res.status(200).json({
      success: true,
      activeOrders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// utility function
export const applyOrderPopulates = (query: any) => {
  return query
    .populate({ path: "user", select: "fullName email contact profilePic" })
    .populate({
      path: "restaurant",
      select: "-orderPlaced -orderServed -orders -cuisines",
    })
    .populate({
      path: "deliveryAgent",
      select:
        "licenseNumber vehicleNumber vehicleType status avgRating ratingCount lastLocationUpdatedAt lastLocation",
      populate: [
        {
          path: "user",
          select: "fullName email contact profilePic",
        }
      ],
    });
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      res.status(400).json({
        success: false,
        message: "Invalid order id",
      });
      return;
    }

    const order = await Orders.findById(orderId)
      .populate({
        path: "user",
        select: "fullName email phone",
      })
      .populate({
        path: "restaurant",
        select: "restaurantName location ",
      })
      .populate({
        path: "deliveryAgent",
        populate: {
          path: "user",
          select: "fullName contact",
        },
      })
      .populate({
        path: "cartItems",
        populate: {
          path: "dishId",
          select: "name price image",
        },
      })
      .lean();

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("getOrderById error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};
