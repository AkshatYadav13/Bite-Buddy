import mongoose, { Document,Types } from "mongoose";
import { IRestaurantDocument } from "./restaurant.model";
import { priceChart } from "../utils/dataSet";

export interface IDish {
    restaurant: Types.ObjectId | IRestaurantDocument;
    name: string;
    description: string;
    imageUrl: string;
    category: string;
    isVeg: boolean;
    tags: string[];
    sellingPrice:number
    costPrice:number

    avgRating: number;
    ratingTotal: number;
    ratingCount: number;
    isAvailable: boolean;
    totalUnitsSold:number
    orderCount:number
}

export interface IDishDocument extends IDish, Document {
    _id:Types.ObjectId
    createdAt: Date;
    updatedAt: Date;
}

const dishSchema = new mongoose.Schema<IDishDocument>({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    sellingPrice: {
        type: Number,
        required: true,
        min: 0
    },
    costPrice: {
        type: Number,
        required: true,
        min: 0
    },
    imageUrl: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    avgRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    ratingTotal: {
        type: Number,
        default: 0
    },
    ratingCount: {
        type: Number,
        default: 0
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isVeg: {
        type: Boolean,
        required: true
    },
    tags:{
        type:[String],
        default:[]
    },
    totalUnitsSold: {
        type: Number,
        default:0
    },
    orderCount: {
        type: Number,
        default:0
    },

}, { timestamps: true });

// Indexes for Dish
dishSchema.index({ restaurant: 1 });
dishSchema.index({ category: 1 });
dishSchema.index({ isAvailable: 1 });
dishSchema.index({ avgRating: -1 });
dishSchema.index({ sellingPrice: 1 });
dishSchema.index({ isVeg: 1 });

dishSchema.pre("save",function(next){
    if(this.isModified("ratingTotal") || this.isModified("ratingCount")){
        this.avgRating = this.ratingCount > 0 ? Math.floor((this.ratingTotal/this.ratingCount)*10)/10 : 0
    }

    if (this.isModified("orderCount") || this.isModified("costPrice")) {
        const tier = priceChart.find(t =>
        this.orderCount >= t.minOrders &&
        (t.maxOrders === null || this.orderCount <= t.maxOrders)
        );
        if (tier) {
            this.sellingPrice = this.costPrice + tier.priceAdjustment;
        }
    }
    next();
})



export const Dish = mongoose.model<IDishDocument>('Dish', dishSchema);


