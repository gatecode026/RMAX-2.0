import { Schema, model, models, type Model } from "mongoose";

export interface IProductBrand {
  name: string;
  slug: string;
  description?: string;
  logo?: { src: string; alt?: string };
  sortOrder: number;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const productBrandSchema = new Schema<IProductBrand>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    logo: { src: String, alt: String },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const ProductBrand: Model<IProductBrand> =
  models.ProductBrand || model<IProductBrand>("ProductBrand", productBrandSchema);
