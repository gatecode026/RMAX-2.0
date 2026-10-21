import { Schema, model, models, type Model } from "mongoose";

export interface IAddress {
  organization: string;
  recipient?: string;
  department?: string;
  street: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IUser {
  name: string;
  email: string;
  organization?: string;
  phone?: string;
  passwordHash: string;
  shippingAddress?: IAddress;
  billingSameAsShipping: boolean;
  billingAddress?: IAddress;
}

export const addressSchema = new Schema<IAddress>(
  {
    organization: { type: String, required: true, trim: true },
    recipient: { type: String, trim: true },
    department: { type: String, trim: true },
    street: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, default: "India", trim: true },
  },
  { _id: false },
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    organization: { type: String, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    shippingAddress: { type: addressSchema },
    billingSameAsShipping: { type: Boolean, default: true },
    billingAddress: { type: addressSchema },
  },
  { timestamps: true },
);

export const User: Model<IUser> = models.User || model<IUser>("User", userSchema);
