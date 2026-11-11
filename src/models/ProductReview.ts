import { Schema, model, models, type Model, type Types } from "mongoose";

export type ReviewApprovalStatus = "pending" | "approved" | "rejected" | "hidden";

export interface IProductReview {
  product: Types.ObjectId;
  productSlug: string;
  customerName: string;
  customerId?: Types.ObjectId;
  rating: number;
  title?: string;
  description: string;
  verifiedPurchase: boolean;
  status: ReviewApprovalStatus;
  moderatedBy?: Types.ObjectId;
  moderatedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const productReviewSchema = new Schema<IProductReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    productSlug: { type: String, required: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    verifiedPurchase: { type: Boolean, default: false },
    // Never auto-approved — an admin must explicitly approve before a review is public (PRD: "Never create fake reviews or ratings").
    status: { type: String, enum: ["pending", "approved", "rejected", "hidden"], default: "pending", index: true },
    moderatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    moderatedAt: Date,
  },
  { timestamps: true },
);

export const ProductReview: Model<IProductReview> =
  models.ProductReview || model<IProductReview>("ProductReview", productReviewSchema);
