import { Schema, model, models, type Model } from "mongoose";

export interface IProductCategory {
  name: string;
  slug: string;
  description?: string;
  image?: { src: string; alt?: string };
  sortOrder: number;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const productCategorySchema = new Schema<IProductCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    image: { src: String, alt: String },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const ProductCategory: Model<IProductCategory> =
  models.ProductCategory || model<IProductCategory>("ProductCategory", productCategorySchema);
