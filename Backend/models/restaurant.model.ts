import mongoose, { Document, Types } from "mongoose";
import { IUserDocument } from "./user.model";
import { ILocation, locationSchema } from "./subschemas/location.schema";

export type RestaurantStatus = "Open" | "Closed" | "Busy";
export type FoodType = "Pure_Veg" | "Non_Veg" | "Both";

export interface IRestaurant {
  user: Types.ObjectId | IUserDocument;
  restaurantName: string;
  contact: string;

  location: ILocation;

  cuisines: string[];
  imageUrl?: string;
  openingTime: string;
  closingTime: string;
  foodType: FoodType;

  orders: Types.ObjectId[];

  avgRating: number;
  ratingTotal: number;
  ratingCount: number;

  status: RestaurantStatus;
  orderPlaced: number;
  orderServed: number;

  earnings: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
  isActive: boolean;
  fallbackAgents: Types.ObjectId[]; // max 10
  totalDishes:number
}

export interface IRestaurantDocument extends IRestaurant, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema = new mongoose.Schema<IRestaurantDocument>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    restaurantName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    contact: {
      type: String,
      required: true,
      match: /^[6-9]\d{9}$/,
      unique: true,
    },

    location: {
      type: locationSchema,
      required: true,
    },

    cuisines: [{ type: String, required: true }],

    imageUrl: String,

    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],

    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true },

    avgRating: { type: Number, default: 0 },
    ratingTotal: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["Open", "Closed", "Busy"],
      default: "Open",
    },

    foodType: {
      type: String,
      enum: ["Pure_Veg", "Non_Veg", "Both"],
      default: "Pure_Veg",
    },

    orderPlaced: { type: Number, default: 0 },
    orderServed: { type: Number, default: 0 },
    totalDishes: { type: Number, default: 0 },

    earnings: {
      today: { type: Number, default: 0 },
      thisWeek: { type: Number, default: 0 },
      thisMonth: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    
    isActive: { type: Boolean, default: true },
    fallbackAgents: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "DeliveryAgent",
        },
      ],
      validate: {
        validator: (v: Types.ObjectId[]) => v.length <= 10,
        message: "Maximum 10 fallback agents allowed",
      },
    },
  },
  { timestamps: true },
);

// Geo index for distance queries
restaurantSchema.index({ "location.geo": "2dsphere" });

// Filters
restaurantSchema.index({ "location.city": 1 });
restaurantSchema.index({ "location.state": 1 });
restaurantSchema.index({ cuisines: 1 });
restaurantSchema.index({ avgRating: -1 });
restaurantSchema.index({ status: 1 });
restaurantSchema.index({ foodType: 1 });

restaurantSchema.pre("save", function (next) {
  if (this.isModified("ratingTotal") || this.isModified("ratingCount")) {
    this.avgRating =
      this.ratingCount > 0
        ? Math.floor((this.ratingTotal / this.ratingCount) * 10) / 10
        : 0;
  }
  next();
});

export const Restaurant = mongoose.model<IRestaurantDocument>(
  "Restaurant",
  restaurantSchema,
);
