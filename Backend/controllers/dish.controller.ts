import { Request, Response } from "express";
import {
  deleteItemFromCloudinary,
  uploadImageOnCloundinary,
} from "../utils/cloudinary";
import { Dish, IDishDocument } from "../models/dish.model";
import { IRestaurantDocument, Restaurant } from "../models/restaurant.model";
import { Types } from "mongoose";
import { priceChart } from "../utils/dataSet";
import { buildSortQuery } from "../utils/utilityFunctions";

export const addDish = async (req: Request, res: Response) => {
  try {
    const { name, description, costPrice, isVeg, tags, category } = req.body;
    const image = req.file;
    const userId = req.id;

    const restaurant = (await Restaurant.findOne({
      user: userId,
    })) as IRestaurantDocument;
    if (!restaurant) {
      res.status(400).json({
        message: "You haven't registered a restaurant yet",
        success: false,
      });
      return;
    }

    if (!image) {
      res.status(400).json({
        message: `Image is required`,
        success: false,
      });
      return;
    }

    let imageUrl;
    try {
      imageUrl = await uploadImageOnCloundinary(image);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Error uploading image", success: false });
      return;
    }

    const sellingPrice = costPrice + priceChart[0].priceAdjustment;

    const newDish = (await Dish.create({
      restaurant: restaurant._id,
      name,
      sellingPrice,
      costPrice: Number(costPrice),
      tags: tags.split(","),
      isVeg,
      category,
      description,
      imageUrl,
    })) as IDishDocument;

    restaurant.totalDishes+=1
    await restaurant.save();

    res.status(200).json({
      message: `Dish added successfully`,
      newDish,
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

export const editDish = async (req: Request, res: Response) => {
  try {
    const dishId = req.params.id;
    const { name, description, costPrice, isVeg, tags, category } = req.body;
    const image = req.file;

    const updates = {
      name,
      description,
      costPrice: Number(costPrice),
      isVeg,
      category,
    };

    const dish = await Dish.findById(dishId);

    if (!dish) {
      res.status(400).json({
        message: `Dish not found`,
        success: false,
      });
      return;
    }

    if (image) {
      dish.imageUrl && deleteItemFromCloudinary(dish.imageUrl);
      const imageUrl = await uploadImageOnCloundinary(image);
      dish.imageUrl = imageUrl;
    }

    for (const key in updates) {
      if (updates[key as keyof typeof updates]) {
        (dish as any)[key] = updates[key as keyof typeof updates];
      }
    }
    if (tags) {
      dish.tags = tags.split(",");
    }

    await dish.save();

    res.status(200).json({
      message: `Dish details updated successfully`,
      dish,
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

export const updateDishRating = async (req: Request, res: Response) => {
  try {
    const { rating, id } = req.params;

    const dish = await Dish.findById(id).populate("restaurant");
    if (!dish) {
      res.status(400).json({
        message: "Dish not found",
        success: false,
      });
      return;
    }

    const restaurant = await Restaurant.findById(dish.restaurant);
    if (restaurant?.user.toString() === req.id) {
      res.status(400).json({
        message: "You can't rate your own restaurant dish",
        success: false,
      });
      return;
    }

    dish.ratingTotal += Number(rating);

    dish.ratingCount += 1;
    await dish.save();

    res.status(200).json({
      message: `Successfully rated rating for ${dish.name}.`,
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

export const toggleDishAvailabilty = async (req: Request, res: Response) => {
  try {
    const dishId = req.params.id;

    const dish = (await Dish.findById(dishId).populate(
      "restaurant"
    )) as IDishDocument;

    if (!dish) {
      res.status(400).json({
        message: `Dish not found`,
        success: false,
      });
      return;
    }
    const restaurant = (await Restaurant.findById(
      dish.restaurant
    )) as IRestaurantDocument;

    if (!(restaurant.user as Types.ObjectId).equals(req.id)) {
      res.status(400).json({
        message: `You are not allowed to access this action`,
        success: false,
      });
      return;
    }
    dish.isAvailable = !dish.isAvailable;
    await dish.save();

    res.status(200).json({
      message: `Dish is now ${dish.isAvailable ? "available" : "unavailable"}.`,
      updatedDish: dish,
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

export const getAllDishes = async (req: Request, res: Response) => {
  try {
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
    
    const filterQuery: any = {};
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
      dishes,
      pagination:{
        currentPage:page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getSimilarDishes = async (req: Request, res: Response) => {
  try {
    const dishId = req.params.id;

    const currentDish = await Dish.findById(dishId);
    if (!currentDish) {
      res.status(404).json({ success: false, message: "Dish not found" });
      return;
    }

    const similarDishes = await Dish.find({
      _id: { $ne: dishId },
      isAvailable: true,
      isVeg: currentDish.isVeg,
      $or: [
        { category: currentDish.category },
        { tags: { $in: currentDish.tags } },
        { name: { $regex: currentDish.name.split(" ")[0], $options: "i" } },
      ],
    })
      .limit(8)
      .sort({ avgRating: -1 })
      .populate({
        path: "restaurant",
        select: "restaurantName address status user",
      });

    res.status(200).json({
      success: true,
      similarDishes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getDishDetails = async (req: Request, res: Response) => {
  try {
    const dishId = req.params.id;

    const dish = await Dish.findById(dishId).populate({
        path: "restaurant",
        select: "restaurantName address status user",
      });

    if (!dish) {
      res.status(404).json({ success: false, message: "Dish not found" });
      return;
    }

    res.status(200).json({
      success: true,
      dish
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getDishesByCategory = async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);
    const skip = (page - 1) * limit;

    const { categoryName } = req.params;

    const filters: any = {
      $or: [
        { category: { $regex: `^${categoryName}$`, $options: "i" } },
        { tags: { $in: [categoryName] } }
      ]
    };

    const dishes = await Dish.find(filters)
      .skip(skip)
      .limit(limit)
      .populate({
        path: "restaurant",
        select: "restaurantName address status user"
      });

    if (dishes.length === 0) {
      res.status(404).json({ success: false, message: "No dishes found for this category." });
      return
    }

    const totalCount = await Dish.countDocuments(filters);

    res.status(200).json({
      success: true,
      dishes,
      pagination:{
        currentPage:page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


