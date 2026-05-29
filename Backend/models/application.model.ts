import mongoose, { Document, Types, Schema } from "mongoose";
import { IUserDocument } from "./user.model";
import { ILocation, locationSchema } from "./subschemas/location.schema";
import { FoodType } from "./restaurant.model";

export type ApplicationType = "Restaurant" | "Delivery_Agent";
export type VehicleType = "Bike" | "Scooter" | "Car" | "Bicycle";
export type ApplicationStatus = "Pending" | "Approved" | "Rejected";

export interface IApplication {
  user: mongoose.Types.ObjectId | IUserDocument;
  applicationType: ApplicationType;
  status: ApplicationStatus;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  reason?: string;
  isDeletable: boolean;
  
  // Restaurant Application Fields
  restaurantDetails?: {
    restaurantName: string;
    contact: string;
    cuisines: string[];
    imageUrl?: string;
    openingTime: string;
    closingTime: string;
    foodType: FoodType;
    location: ILocation;
  };

  // Delivery Agent Application Fields
  deliveryAgentDetails?: {
    licenseNumber: string;
    vehicleType: VehicleType;
    vehicleNumber: string;
    preferredRestaurants:mongoose.Types.ObjectId
  }
}

export interface IApplicationDocument extends IApplication, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new mongoose.Schema<IApplicationDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicationType: {
      type: String,
      enum: ["Restaurant", "Delivery_Agent"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    reviewedAt: Date,
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reason: String,
    isDeletable: {
      type: Boolean,
      default: false,
    },

    restaurantDetails: {
      type: {
        restaurantName: { type: String, required: true, trim: true },
        location: {
          type: locationSchema,
          required: true,
        },

        cuisines: [{ type: String, required: true, trim: true }],
        imageUrl: {
          type: String,
          required: false,
        },
        openingTime: { type: String, required: true },
        closingTime: { type: String, required: true },
        foodType: {
          type: String,
          default: "Pure_Veg",
          enum: ["Pure_Veg", "Non_Veg", "Both"],
        },
        contact: {
          type: String,
          required: true,
          match: /^[6-9]\d{9}$/,
        },
      },
      required: function () {
        return this.applicationType === "Restaurant";
      },
    },

    deliveryAgentDetails: {
      type: {
        licenseNumber: { type: String, required: true },
        vehicleType: {
          type: String,
          enum: ["Bike", "Scooter", "Bicycle"],
          required: true,
        },
        vehicleNumber: { type: String, required: true },
        preferredRestaurants:[{
          type: mongoose.Schema.Types.ObjectId,
          ref: "Restaurant",
        }]
      },
      required: function () {
        return this.applicationType === "Delivery_Agent";
      },
    },
  },
  { timestamps: true }
);

applicationSchema.index({ user: 1, applicationType: 1 }, { unique: true });
applicationSchema.index({ status: 1 });
applicationSchema.index({ applicationType: 1 });

export const Application = mongoose.model<IApplicationDocument>(
  "Application",
  applicationSchema
);
