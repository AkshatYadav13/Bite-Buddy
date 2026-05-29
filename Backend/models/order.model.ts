import mongoose, { Types, Document } from "mongoose";
import { IUserDocument } from "./user.model";
import { IRestaurant } from "./restaurant.model";
import { locationSchema, ILocation } from "./subschemas/location.schema";
import { IDeliveryAgent, IDeliveryAgentDocument } from "./deliveryAgent.model";

export type PopulatedOrderRestaurant = Omit<IOrderDocument, "restaurant"> & {
  restaurant: IRestaurant;
};
export type PopulatedOrderAgent = Omit<IOrderDocument, "deliveryAgent"> & {
  deliveryAgent: IDeliveryAgent;
};
export type PopulatedOrderFull = Omit<IOrderDocument, "restaurant" | "deliveryAgent"> & {
  restaurant: IRestaurant;
  deliveryAgent: IDeliveryAgent;
};


/* ================= TYPES ================= */
export const agentAssignmentTypeOptions = ["Manual", "Fallback"] as const;

export type AgentAssignmentType = (typeof agentAssignmentTypeOptions)[number];

export const OrderStatusOptions = [
  "Pending",
  "Placed",
  "Confirmed",
  "Preparing",
  "ReadyForPickup",
  "AcceptedByAgent",
  "OutForDelivery",
  "Delivered",
  "Canceled",
] as const;

export type OrderStatus = (typeof OrderStatusOptions)[number];

export type StatusDetails = {
  status: OrderStatus;
  time: Date;
};

export type ParcelOtp = {
  code: string;
  expiresAt: Date;
};

export type DeliveryDetails = {
  pickup: ILocation; // restaurant location snapshot
  drop: ILocation; // user location snapshot
  distanceKm: number;
  estimatedTimeMin: number;
  parcelAcceptedOtp?: ParcelOtp;
  parcelDeliveredOtp?: ParcelOtp;
};

export type CartItem = {
  dishId: Types.ObjectId;
  name: string;
  imageUrl?: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
};

export type Bill = {
  cartTotal: number;
  appFee: number;
  shippingFee: number;
  gstAmount: number;
  grandTotal: number;
};

export type CancellationDetails = {
  userType: "Restaurant_Owner" | "Customer";
  cancelBy: Types.ObjectId;
  reason: string;
  transactionId: Types.ObjectId;
};

export type RatingDetails = {
  restaurant?: number;
  deliveryAgent?: number;
  food?: number;
};

export interface IOrder {
  user: Types.ObjectId | IUserDocument;
  restaurant: Types.ObjectId | IRestaurant;
  deliveryAgent?: Types.ObjectId | IDeliveryAgentDocument;

  deliveryDetails: DeliveryDetails;
  cartItems: CartItem[];
  bill: Bill;

  currentStatus: OrderStatus;
  statusDetails: StatusDetails[];

  isVerified: boolean;
  razorpayOrderId?: string;
  paymentId?: string;
  paidAt?:Date;

  cancellationDetails?: CancellationDetails;
  ratingDetails?: RatingDetails;
  agentAssignmentType: AgentAssignmentType;
  isActive:boolean
}
// assignmentType

export interface IOrderDocument extends IOrder, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/* ================= SCHEMAS ================= */

const otpSchema = new mongoose.Schema(
  {
    code: { type: String, minlength: 6, maxlength: 6 },
    expiresAt: { type: Date },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema<IOrderDocument>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    deliveryAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryAgent",
    },

    deliveryDetails: {
      pickup: { type: locationSchema, required: true },
      drop: { type: locationSchema, required: true },

      distanceKm: { type: Number, required: true },
      estimatedTimeMin: { type: Number, required: true },

      parcelAcceptedOtp: otpSchema,
      parcelDeliveredOtp: otpSchema,
    },

    cartItems: [
      {
        dishId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Dish",
          required: true,
        },
        name: { type: String, required: true },
        imageUrl: { type: String },
        costPrice: { type: Number, required: true },
        sellingPrice: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],

    bill: {
      cartTotal: { type: Number, required: true },
      shippingFee: { type: Number, required: true },
      gstAmount: { type: Number, required: true },
      grandTotal: { type: Number, required: true },
      appFee: {
        type: Number,
        required: true,
      },
    },

    currentStatus: {
      type: String,
      enum: OrderStatusOptions,
      required: true,
      default: "Pending",
    },

    statusDetails: [
      {
        status: {
          type: String,
          enum: OrderStatusOptions,
          required: true,
        },
        time: { type: Date, required: true },
      },
    ],

    razorpayOrderId: String,
    paymentId: String,

    isVerified: {
      type: Boolean,
      default: false,
    },
    paidAt:{
      type:Date
    },

    cancellationDetails: {
      cancelBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reason: {
        type: String,
        required: function (this: any) {
          return this.currentStatus === "Canceled";
        },
      },
      userType: {
        type: String,
        enum: ["Restaurant_Owner", "Customer"],
        required: function (this: any) {
          return this.currentStatus === "Canceled";
        },
      },
      transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        required: function (this: any) {
          return this.currentStatus === "Canceled";
        },
      },
    },

    ratingDetails: {
      restaurant: { type: Number, min: 0, max: 5 },
      deliveryAgent: { type: Number, min: 0, max: 5 },
      food: { type: Number, min: 0, max: 5 },
    },
    agentAssignmentType: {
      type: String,
      enum: agentAssignmentTypeOptions,
      default: "Manual",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

/* ================= INDEXES ================= */

// for nearby delivery agents
orderSchema.index({ "deliveryDetails.pickup.geo": "2dsphere" });
orderSchema.index({ "deliveryDetails.drop.geo": "2dsphere" });

// status based filtering
orderSchema.index({ currentStatus: 1 });

/* ================= PRE SAVE ================= */

orderSchema.pre("save", function (next) {
  if (this.isModified("currentStatus")) {
    const lastStatus =
      this.statusDetails?.[this.statusDetails.length - 1]?.status;
    if (lastStatus !== this.currentStatus) {
      this.statusDetails.push({
        status: this.currentStatus,
        time: new Date(),
      });
    }
  }
  next();
});

orderSchema.index(
  { deliveryAgent: 1, currentStatus: 1 },
  {
    partialFilterExpression: {
      currentStatus: { $in: ["AcceptedByAgent", "OutForDelivery"] },
    },
  },
);

export const Orders = mongoose.model<IOrderDocument>("Order", orderSchema);

// MANUAL → agent ne orders page se choose kiya

// FALLBACK → restaurant ne fallback agent assign kiya
