import mongoose, { Types } from "mongoose";
import { IOrderDocument } from "./order.model";

export type TransactionUserType = "Customer" | "Restaurant" | "Delivery";
export type TransactionStatus = "Pending" | "Paid";

export type TransactionReason = "Order_Delivered" | "Order_Cancel_Refund";

export interface TransactionType {
  userId: Types.ObjectId;
  userType: TransactionUserType;

  orderId: Types.ObjectId | IOrderDocument;

  amount: number;

  reason: TransactionReason;

  status: TransactionStatus;

  recievedAt: Date;
  paidAt?: Date;
}

export interface ITrancationDocument extends TransactionType, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new mongoose.Schema<ITrancationDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:function(this:any){
        return this.userType === "Restaurant" ? "Restaurant":"User"
      },
      required: true,
    },
    userType: {
      type: String,
      enum: ["Customer", "Restaurant", "Delivery"],
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      enum: ["Order_Delivered", "Order_Cancel_Refund"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Paid"],
      required: true,
    },
    recievedAt: {
      type: Date,
      required: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

transactionSchema.index({ orderId: 1, userId: 1 }, { unique: true });


export const Transaction = mongoose.model<ITrancationDocument>("Transaction",transactionSchema);



/*
| Amount        | Owner                            |
| ------------- | -------------------------------- |
| `dish.cp`     | Restaurant cost                  |
| `dish.sp`     | Customer price                   |
| `sp - cp`     | **Platform margin**              |
| `shippingFee` | Delivery agent                   |
| `gst`         | Govt                             |
| `grandTotal`  | ❌ Nobody (just collected amount) |

appFee + (sp - cp) for platform revenue

Restaurant earnings as Σ(cp)

Delivery earnings as shippingFee

*/