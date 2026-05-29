import { Request, Response } from "express";
import {
  Transaction
} from "../models/transaction.model";
import { User, UserRole } from "../models/user.model";
import { Restaurant } from "../models/restaurant.model";
import mongoose, { Types } from "mongoose";
import { DeliveryAgent } from "../models/deliveryAgent.model";

export const markTransactionPaid = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    // already paid → avoid double update
    if (transaction.status === "Paid") {
      res.status(400).json({
        success: false,
        message: "Transaction already marked as PAID",
      });
      return;
    }

    transaction.status = "Paid";
    transaction.paidAt = new Date();

    await transaction.save();

    res.status(200).json({
      success: true,
      message: "Transaction marked as PAID",
      updatedData: transaction,
    });
  } catch (error) {
    console.error("Mark transaction paid error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

type ResolveTargetArgs = {
  user: any;
  type: string;
  targetId: string;
  userId: Types.ObjectId;
};

const getResolvedTargetId = async ({
  user,
  type,
  targetId,
  userId,
}: ResolveTargetArgs): Promise<Types.ObjectId> => {
  if (!mongoose.Types.ObjectId.isValid(targetId)) {
    throw new Error("Invalid targetId");
  }

  /* -------- CUSTOMER -------- */
  if ((user.role === "Customer" && type === "Customer") || (user.role === "Admin" && type === "Admin")) {
    if (targetId !== userId.toString()) {
      throw new Error("Unauthorized targetId");
    }
    return new mongoose.Types.ObjectId(targetId);
  }

  /* -------- DELIVERY AGENT -------- */
  if (user.role === "Delivery_Agent" && type === "Delivery_Agent") {
    const agent = await DeliveryAgent.findOne({
      _id: targetId,
      user: userId,
    });

    if (!agent) {
      throw new Error("Invalid delivery agent id");
    }

    return userId;
  }

  /* -------- RESTAURANT OWNER -------- */
  if (user.role === "Restaurant_Owner" && type === "Restaurant_Owner") {
    const restaurant = await Restaurant.findOne({
      _id: targetId,
      user: userId,
    });

    if (!restaurant) {
      throw new Error("Invalid restaurant id");
    }

    return restaurant._id;
  }

  throw new Error("Invalid role or type");
};

const buildTransactionFilters = ({
  query,
  type,
  resolvedTargetId,
}: {
  query: any;
  type:UserRole
  resolvedTargetId?: Types.ObjectId;
}) => {
  const {
    status,
    userType,
    reason,
    minAmount,
    maxAmount,
    orderId,
    dateRange,
    userId,
    customDateFrom,
    customDateTo,
  } = query;

  const filters: any = {};

  if(type === "Admin"){
    if (userType && userType !== "ALL") filters.userType = userType;
    if (userId) filters.userId = userId;
  }
  else{
    if (type === "Restaurant_Owner") {
      filters.userType = "Restaurant";
    } else if (type === "Delivery_Agent") {
      filters.userType = "Delivery";
    } else {
      filters.userType = "Customer";
    }
    filters.userId = resolvedTargetId;
  }

  if (status && status !== "ALL") filters.status = status;
  if (reason && reason !== "ALL") filters.reason = reason;
  if (orderId) filters.orderId = orderId;

  /* -------- AMOUNT -------- */
  const min = Number(minAmount);
  const max = Number(maxAmount);

  if (min || max) {
    filters.amount = {};
    if (min) filters.amount.$gte = min;
    if (max) filters.amount.$lte = max;
  }

  /* -------- DATE -------- */
  if(dateRange!=="ALL"){
    if (dateRange === "custom" && customDateFrom && customDateTo) {
      filters.createdAt = {
        $gte: new Date(customDateFrom),
        $lte: new Date(customDateTo),
      };
    }
    else{
      const now = new Date();
      const from = new Date();
    
      if (dateRange === "today") {
        from.setHours(0, 0, 0, 0);
      }


      if (dateRange === "last7days") from.setDate(now.getDate() - 7);
      if (dateRange === "last30days") from.setDate(now.getDate() - 30);
    
      filters.createdAt = { $gte: from, $lte: now };
    }
  }
  return filters;
};


export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(400).json({
        message: "User not found",
        success: false,
      });
      return;
    }
    const { type, targetId, search, page = 1, limit = 10 } = req.query as any;
    /* ======================= TARGET ID RESOLUTION ======================= */

    
    let resolvedTargetId: Types.ObjectId;
    
    try {
      resolvedTargetId = await getResolvedTargetId({
        user,
        type,
        targetId,
        userId: user._id,
      });
    } catch (err: any) {
      res.status(403).json({ message: err.message });
      return;
    }
    const filters = buildTransactionFilters({
      query: req.query,
      type,
      resolvedTargetId,
    });

    let transactions = await Transaction.find(filters)
      .populate({
        path: "userId",
        select: "restaurantName fullName",
      })
      .sort({ createdAt: -1 })
      .lean();

    /* -------- SEARCH -------- */
    if (search) {
      const q = search.toLowerCase();
      transactions = transactions.filter(
        (t: any) =>
          t.userId?.restaurantName?.toLowerCase().includes(q) ||
          t.userId?.fullName?.toLowerCase().includes(q),
      );
    }

    // summary stats
    let pendingAmt = 0;
    let paidAmt = 0;
    let pendingCount = 0;
    let paidCount = 0;

    transactions.forEach((doc) => {
      if (doc.status === "Pending") {
        pendingAmt += doc.amount;
        pendingCount++
      } else if (doc.status === "Paid") {
        paidAmt += doc.amount;
        paidCount++
      }
    });

    /* -------- PAGINATION -------- */
    const totalCount = transactions.length;
    const skip = (Number(page) - 1) * Number(limit);

    const paginatedTransactions = transactions.slice(
      skip,
      skip + Number(limit),
    );

    res.status(200).json({
      success: true,
      transactionsData:{
        summary:{
          pendingAmt,
          paidAmt,
          pendingCount,
          paidCount
        },
        list:paginatedTransactions,
      },
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalCount,
        limit: Number(limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
    });
  }
};
