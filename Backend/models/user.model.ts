import mongoose, { Document, Types, Schema } from "mongoose";
import { IUserAddress, userAddressSchema } from "./subschemas/location.schema";

export const USER_ROLES = [
  'Customer',
  'Restaurant_Owner',
  'Delivery_Agent',
  'Admin',
  'Applicant',
] as const;

export type UserRole = typeof USER_ROLES[number];

export interface IUser {
  fullName: string;
  email: string;
  password?: string;
  contact: string;
  profilePic?: string;
  role: UserRole;
  lastLogin?: Date;
  orders: Types.ObjectId[];
  favoriteRestaurants: Types.ObjectId[];
  favoriteDishes: Types.ObjectId[];
  canApply: boolean;
  applicationId?:Types.ObjectId
  addresses: Types.DocumentArray<IUserAddress>;
}


export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    password: {
      type: String,
      select: false,
      minlength: 6
    },
    contact: {
      type: String,
      required: true,
      match: /^[6-9]\d{9}$/,
      unique: true
    },
    profilePic: String,
    role: {
      type: String,
      enum: USER_ROLES,
      required: true
    },
    lastLogin: {
      type: Date,
      default: Date.now
    },
    orders: [
      {
        type: Types.ObjectId,
        ref: 'Order',
        default: []
      }
    ],
    favoriteRestaurants: [
      {
        type: Types.ObjectId,
        ref: 'Restaurant',
        default: []
      }
    ],
    favoriteDishes: [
      {
        type: Types.ObjectId,
        ref: 'Dish',
        default: []
      }
    ],
    canApply: {
      type: Boolean,
      default: true
    },
    applicationId: {
      type: Types.ObjectId,
      ref: "Application",
      required: false
    },
    addresses: {
      type: [userAddressSchema],
      default: [],
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ "addresses.geo": "2dsphere" });


userSchema.pre("save", function (next) {
  if (!Array.isArray(this.addresses)) return next();

  let foundDefault = false;

  this.addresses.forEach(address => {
    if (address.isDefault) {
      if (!foundDefault) {
        foundDefault = true;
      } else {
        address.isDefault = false;
      }
    }
  });

  next();
});

export const User = mongoose.model<IUserDocument>("User", userSchema);


