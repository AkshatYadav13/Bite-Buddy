import mongoose from "mongoose";

export interface ILocation {
  address: string;
  latitude: number;
  longitude: number;
  geo: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
}

export const locationSchema = new mongoose.Schema(
  {
    address: { type: String, required: true, trim: true },
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
  { _id: false },
);

export interface IUserAddress extends ILocation {
  label: string;
  isDefault: boolean;
}

export const userAddressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },

    // 🔥 reuse shared location fields
    ...locationSchema.obj,
  },
  { _id: true, timestamps: true },
);
