import { Schema, model, models, type Model, type Types } from "mongoose";

/** One selectable value of a family option, e.g. { value: "50", label: "50 Pads" }. */
export interface IFamilyOptionValue {
  value: string;
  label: string;
}

/** One option of a family, e.g. Size / Operation / Capacity / Colour. Array order = display order. */
export interface IFamilyOption {
  key: string;
  label: string;
  values: IFamilyOptionValue[];
}

/**
 * A group of products sold as one storefront card (Incinerator, Vending Machine…). Members are ordinary Product
 * records pointing back with `familyId` + `variantOptions` ({ [option.key]: value }). A product with no family
 * is a standalone product and is unaffected.
 */
export interface IProductFamily {
  name: string;
  slug: string;
  options: IFamilyOption[];
  /** Product opened first from the family card; falls back to the first published member. */
  defaultProduct?: Types.ObjectId;
  sortOrder: number;
}

const familySchema = new Schema<IProductFamily>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    options: [
      {
        _id: false,
        key: { type: String, required: true, trim: true },
        label: { type: String, required: true, trim: true },
        values: [{ _id: false, value: { type: String, required: true, trim: true }, label: { type: String, required: true, trim: true } }],
      },
    ],
    defaultProduct: { type: Schema.Types.ObjectId, ref: "Product" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const ProductFamily: Model<IProductFamily> = models.ProductFamily || model<IProductFamily>("ProductFamily", familySchema);
