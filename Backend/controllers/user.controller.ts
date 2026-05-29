import { Request, Response } from "express";
import { IUserDocument, User, USER_ROLES } from "../models/user.model";
import bcrypt from "bcryptjs";
import {
  deleteItemFromCloudinary,
  uploadImageOnCloundinary,
} from "../utils/cloudinary";
import { getJwtToken } from "../utils/getJwtToken";
import { Restaurant } from "../models/restaurant.model";
import { Types } from "mongoose";
import { Dish } from "../models/dish.model";
import {
  DeliveryAgent,
  DeliveryAgentStatus,
  IDeliveryAgentDocument,
} from "../models/deliveryAgent.model";
import mongoose from "mongoose";

export const signup = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, contact, role } = req.body;

    if (!USER_ROLES.includes(role)) {
      res.status(400).json({
        message: "Invalid role for signup",
        success: false,
      });
      return;
    }

    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({
        message: `Account already exist with this email (${email})`,
        success: false,
      });
      return;
    }

    user = await User.findOne({ contact });
    if (user) {
      res.status(400).json({
        message: `Account already exist with this mobile number (${contact})`,
        success: false,
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      contact,
      role,
    });

    getJwtToken(res, user._id);

    const userWithOutPassword = await User.findOne({ email }).select(
      "-password",
    );

    res.status(200).json({
      message: "Account created successfully",
      userWithOutPassword,
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

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!USER_ROLES.includes(role)) {
      res.status(400).json({
        message: "Invalid role",
        success: false,
      });
      return;
    }

    let user = await User.findOne({ email, role }).select("+password");

    if (!user || !user.password) {
      res.status(400).json({
        message: "Invalid credentials",
        success: false,
      });
      return;
    }

    const isPassMatched = await bcrypt.compare(password, user.password);
    if (!isPassMatched) {
      res.status(400).json({
        message: "Invalid credentials",
        success: false,
      });
      return;
    }

    getJwtToken(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    if (user.role === "Delivery_Agent") {
      const agent = await DeliveryAgent.findOne({ user: user._id });

      if (!agent) {
        res.status(400).json({
          message: "Account not found",
          success: false,
        });
        return;
      }
      const status = agent.activeOrders.length ? "OnDelivery" : "Available";

      const result = await updateDeliveryAgentStatus(
        user._id.toString(),
        status,
      );
      if (!result.success) {
        res.status(400).json({
          message: result.message,
          success: result.success,
        });
        return;
      }
    }

    const userWithOutPassword = await User.findOne({ email }).select(
      "-password",
    );

    res.status(200).json({
      message: "Login successfully",
      userWithOutPassword,
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

export const logout = async (req: Request, res: Response) => {
  try {
    const user = (await User.findById(req.id)) as IUserDocument;

    if (!user) {
      res.status(400).json({ message: `User not found`, success: false });
      return;
    }

    if (user.role === "Delivery_Agent") {
      const result = await updateDeliveryAgentStatus(req.id, "Offline");
      if (!result.success) {
        res
          .status(400)
          .json({ message: result.message, success: result.success });
        return;
      }
    }

    res.clearCookie("token").json({
      message: "Logged out successfully",
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

async function updateDeliveryAgentStatus(
  userId: string,
  status: DeliveryAgentStatus,
): Promise<{ success: boolean; message?: string }> {
  try {
    let agent = (await DeliveryAgent.findOne({
      user: userId,
    })) as IDeliveryAgentDocument;

    if (!agent) {
      return { success: false, message: "Delivery Agent not found" };
    }

    if (agent.status === "OnDelivery" && status === "Offline") {
      return { success: false, message: "Cannot go offline while on delivery" };
    }

    agent.status = status;
    await agent.save();

    return { success: true };
  } catch (error) {
    console.log("Error occured while updating agent status", error);
    return { message: "Internal server error", success: false };
  }
}

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.id;
    const { fullName, email, contact } = req.body;
    const profilePic = req.file;

    let updates = { fullName, email, contact };
    let user = await User.findById(userId);

    if (!user) {
      res.status(400).json({
        message: `User not found`,
        success: false,
      });
      return;
    }

    if (profilePic) {
      try {
        if (user.profilePic) {
          deleteItemFromCloudinary(user.profilePic);
        }
        const imageUrl = await uploadImageOnCloundinary(profilePic);
        user.profilePic = imageUrl;
      } catch (err) {
        res
          .status(400)
          .json({ message: "Error uploading image", success: false });
        return;
      }
    }

    for (const key in updates) {
      if (updates[key as keyof typeof updates]) {
        (user as any)[key] = updates[key as keyof typeof updates];
      }
    }

    await user.save();

    res.status(200).json({
      message: `Profile updated successfully`,
      user,
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

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        message: "Current and new password are required.",
        success: false,
      });
      return;
    }

    if (currentPassword === newPassword) {
      res.status(400).json({
        message: "New password must be different from the current password.",
        success: false,
      });
      return;
    }

    const user = (await User.findById(req.id).select(
      "password",
    )) as IUserDocument;
    if (!user) {
      res.status(400).json({
        message: "User not found",
        success: false,
      });
      return;
    }

    const isPassMatched = await bcrypt.compare(
      currentPassword,
      user?.password!,
    );

    if (!isPassMatched) {
      res.status(400).json({
        message: `Entered password not matched with actual password`,
        success: false,
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: `Password Changed Successfully.`,
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

export const toggleRestaurantInFavorites = async (
  req: Request,
  res: Response,
) => {
  try {
    const restaurantId = new Types.ObjectId(req.params.id);

    const user = await User.findById(req.id);
    if (!user) {
      res.status(404).json({ message: "User not found", success: false });
      return;
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      res.status(404).json({ message: "Restaurant not found", success: false });
      return;
    }

    const index =
      user.favoriteRestaurants?.findIndex((id) => id.equals(restaurantId)) ??
      -1;

    let message = "";

    if (index !== -1) {
      user.favoriteRestaurants?.splice(index, 1);
      message = `${restaurant.restaurantName} removed from favorites list`;
    } else {
      user.favoriteRestaurants?.push(restaurantId);
      message = `${restaurant.restaurantName} added to favorites list`;
    }

    await user.save();

    res.status(200).json({ message, success: true });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const toggleDishInFavorites = async (req: Request, res: Response) => {
  try {
    const dishId = new Types.ObjectId(req.params.id);

    const user = await User.findById(req.id);
    if (!user) {
      res.status(404).json({ message: "User not found", success: false });
      return;
    }

    const dish = await Dish.findById(dishId);
    if (!dish) {
      res.status(404).json({ message: "Dish not found", success: false });
      return;
    }

    const index =
      user.favoriteDishes?.findIndex((id) => id.equals(dishId)) ?? -1;

    let message = "";

    if (index !== -1) {
      user.favoriteDishes?.splice(index, 1);
      message = `${dish.name} removed from favorites list`;
    } else {
      user.favoriteDishes?.push(dishId);
      message = `${dish.name} added to favorites list`;
    }

    await user.save();

    res.status(200).json({ message, success: true });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export const getUserFavorites = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.id).populate([
      {
        path: "favoriteRestaurants",
        select: "-orders -earnings",
      },
      {
        path: "favoriteDishes",
        populate: {
          path: "restaurant",
          select: "restaurantName address status user",
        },
      },
    ]);
    if (!user) {
      res.status(404).json({ message: "User not found", success: false });
      return;
    }

    res.status(200).json({
      favoriteDishes: user.favoriteDishes || [],
      favoriteRestaurants: user.favoriteRestaurants || [],
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

export const googleAuth = async (req: Request, res: Response) => {
  // same for login and signup
  try {
    const { fullName, email, contact } = req.body;

    let user = await User.findOne({ email });

    let isLogin = user;

    if (!user) {
      user = await User.create({
        fullName,
        email,
        contact,
      });
    }

    getJwtToken(res, user._id);

    let userWithOutPassword = await User.findOne({ email }).select("-password");

    res.status(200).json({
      message: `${isLogin ? "Login" : "SignUp"} successfully`,
      userWithOutPassword,
      success: true,
    });
  } catch (error) {
    console.log("Error occured in google authentication", error);

    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const addAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.id;
    const address = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.addresses.length >= 5) {
      res.status(400).json({ message: "Max 5 addresses allowed" });
      return;
    }

    // First address → make default
    if (user.addresses.length === 0) {
      address.isDefault = true;
    }

    // If new address is default → unset old defaults
    if (address.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    const newAddress = {
      ...address,
      geo: {
        type: "Point",
        coordinates: [address.longitude, address.latitude],
      },
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add address", error });
  }
};

export const editAddress = async (req: Request, res: Response) => {
  try {
    const addressId = req.params.id;
    const updates = req.body;

    const user = await User.findById(req.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      res.status(404).json({ message: "Address not found" });
      return;
    }

    // If setting as default → unset others
    if (updates.isDefault === true) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    Object.assign(address, updates);
    await user.save();

    res.json({
      message: "Address updated successfully",
      addresses: user.addresses,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update address", error });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const addressId = req.params.id;

    const user = await User.findById(req.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      res.status(404).json({ message: "Address not found" });
      return;
    }

    const wasDefault = address.isDefault;

    address.deleteOne();

    // If default deleted → set first as default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({
      message: "Address deleted successfully",
      addresses: user.addresses,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete address", error });
  }
};

export const getAddresses = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.id).select("addresses");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      addresses: user.addresses,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch addresses", error });
  }
};

export const setDefaultAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.id;
    const addressId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      res.status(400).json({
        success: false,
        message: "Invalid address id",
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (!user.addresses || user.addresses.length === 0) {
      res.status(400).json({
        success: false,
        message: "No addresses found",
      });
      return;
    }

    user.addresses.forEach((addr: any) => {
      addr.isDefault = false;
    });

    const address = user.addresses.find(
      (addr: any) => addr._id.toString() === addressId,
    );

    if (!address) {
      res.status(404).json({
        success: false,
        message: "Address not found",
      });
      return;
    }
    address.isDefault = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Set default address error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
