import { Schema, model, models, type Model } from "mongoose";

export interface ICartItem {
  /** Product slug (stable across re-seeds, unlike ObjectIds). */
  slug: string;
  quantity: number;
}

export interface ICart {
  /** Opaque token stored in an httpOnly cookie — carts are per browser, not per account. */
  token: string;
  items: ICartItem[];
}

const cartSchema = new Schema<ICart>(
  {
    token: { type: String, required: true, unique: true, index: true },
    items: [
      new Schema<ICartItem>(
        {
          slug: { type: String, required: true },
          quantity: { type: Number, required: true, min: 1, max: 999, default: 1 },
        },
        { _id: false },
      ),
    ],
  },
  { timestamps: true },
);

// Abandoned carts expire after 30 days of inactivity (ASSUMED).
cartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export const Cart: Model<ICart> = models.Cart || model<ICart>("Cart", cartSchema);
