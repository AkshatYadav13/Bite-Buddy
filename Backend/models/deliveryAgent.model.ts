import mongoose, { Types } from "mongoose";
import { Document } from "mongoose";
import { IUserDocument } from "./user.model";

export type DeliveryAgentStatus = "Offline" | "Available" | "OnDelivery";

export type VehicleType = "Bike" | "Scooter" | "Bicycle";

export type GeoCoordsType = {
  latitude: number;
  longitude: number;
  geo: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
};

export interface IDeliveryAgent {
  user: Types.ObjectId | IUserDocument;
  licenseNumber: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  status: DeliveryAgentStatus;
  avgRating: number;
  ratingTotal: number;
  ratingCount: number;
  totalDeliveries: number;
  activeOrders: mongoose.Types.ObjectId[];
  lastLocation: GeoCoordsType;
  lastLocationUpdatedAt: Date;

  earnings: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
  preferredRestaurants: mongoose.Types.ObjectId[];
}

export interface IDeliveryAgentDocument extends IDeliveryAgent, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const deliveryAgentSchema = new mongoose.Schema<IDeliveryAgentDocument>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      enum: ["Bike", "Scooter", "Bicycle"],
      required: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["Offline", "Available", "OnDelivery"],
      default: "Offline",
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingTotal: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    totalDeliveries: {
      type: Number,
      default: 0,
    },
    earnings: {
      today: { type: Number, default: 0 },
      thisWeek: { type: Number, default: 0 },
      thisMonth: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    activeOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    lastLocation: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },

      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
      },

      geo: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
          required: true,
        },
        coordinates: {
          type: [Number],
          required: true,
          validate: {
            validator: (val: number[]) => val.length === 2,
            message: "Coordinates must be [longitude, latitude]",
          },
        },
      },
    },
    lastLocationUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    preferredRestaurants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],
  },
  { timestamps: true },
);

// Indexes for DeliveryAgent
deliveryAgentSchema.index({ status: 1 });
deliveryAgentSchema.index({ avgRating: -1 });
deliveryAgentSchema.index({ "lastLocation.geo": "2dsphere" });

deliveryAgentSchema.pre("save", function (next) {
  if (this.isModified("ratingTotal") || this.isModified("ratingCount")) {
    this.avgRating =
      this.ratingCount > 0
        ? Math.floor((this.ratingTotal / this.ratingCount) * 10) / 10
        : 0;
  }
  next();
});

export const DeliveryAgent = mongoose.model<IDeliveryAgentDocument>(
  "DeliveryAgent",
  deliveryAgentSchema,
);
