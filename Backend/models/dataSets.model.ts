import { Schema, model, Document, Types } from 'mongoose';

// 1. Price Calculation Tiers Schema
export interface IPriceTier extends Document {
  minOrders: number;
  maxOrders: number | null;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const priceTierSchema = new Schema<IPriceTier>({
  minOrders: {
    type: Number,
    required: true,
    min: 0
  },
  maxOrders: {
    type: Number,
    default: null,
    min: 0
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
}, {
  timestamps: true
});

// Compound index for efficient range queries
priceTierSchema.index({ minOrders: 1, maxOrders: 1 });
export const PriceTier = model<IPriceTier>('PriceTier', priceTierSchema);
