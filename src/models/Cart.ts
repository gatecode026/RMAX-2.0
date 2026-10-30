import { Schema, model, models, type Model, type Types } from "mongoose";

export interface ICartItem {
  /** Product slug (stable across re-seeds, unlike ObjectIds). */
  slug: string;
  quantity: number;
}

export interface ICart {
  /**
   * Owning Customer account id. Carts are strictly per-account, never per-browser — there is
   * no guest/anonymous cart. Only the Customer identity (never Admin or Manager) can own one.
   */
  customerId: Types.ObjectId;
  items: ICartItem[];
}

const cartSchema = new Schema<ICart>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
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

// Saved carts for inactive accounts expire after 90 days (a customer's own cart is restored on
// every login up to that point — see lib/cart.ts).
cartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export const Cart: Model<ICart> = models.Cart || model<ICart>("Cart", cartSchema);
