import { Schema, model, models, type Model, type Types } from "mongoose";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/enums";

export { ORDER_STATUSES };
export type { OrderStatus };

export interface IOrderItem {
  product: Types.ObjectId;
  slug: string;
  title: string;
  shortName: string;
  specLine: string;
  unitPrice: number;
  originalPrice: number;
  quantity: number;
  image: string;
}

export interface IOrder {
  reference: string;
  user?: Types.ObjectId;
  contact: { fullName: string; email: string; phone: string };
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    organization: string;
    department: string;
    street: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    notes?: string;
  };
  billing: { sameAsShipping: boolean; organization: string; poReference?: string };
  payment: { method: string; status: string };
  status: OrderStatus;
  timeline: { step: OrderStatus; at?: Date }[];
  termsAcceptedAt: Date;
  isIllustrative: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    reference: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    contact: {
      fullName: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true, trim: true },
    },
    items: [
      new Schema<IOrderItem>(
        {
          product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
          slug: { type: String, required: true },
          title: { type: String, required: true },
          shortName: { type: String, required: true },
          specLine: { type: String, required: true },
          unitPrice: { type: Number, required: true, min: 0 },
          originalPrice: { type: Number, required: true, min: 0 },
          quantity: { type: Number, required: true, min: 1 },
          image: { type: String, required: true },
        },
        { _id: false },
      ),
    ],
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    shippingAddress: {
      organization: { type: String, required: true, trim: true },
      department: { type: String, required: true, trim: true },
      street: { type: String, required: true, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      notes: { type: String, trim: true },
    },
    billing: {
      sameAsShipping: { type: Boolean, default: true },
      organization: { type: String, required: true, trim: true },
      poReference: { type: String, trim: true },
    },
    payment: {
      method: { type: String, required: true },
      status: { type: String, default: "illustrative" },
    },
    status: { type: String, enum: ORDER_STATUSES, default: "preparing", index: true },
    timeline: [
      new Schema(
        { step: { type: String, enum: ORDER_STATUSES, required: true }, at: { type: Date } },
        { _id: false },
      ),
    ],
    termsAcceptedAt: { type: Date, required: true },
    isIllustrative: { type: Boolean, default: true },
  },
  { timestamps: true },
);

orderSchema.index({ user: 1, createdAt: -1 });

export const Order: Model<IOrder> = models.Order || model<IOrder>("Order", orderSchema);
