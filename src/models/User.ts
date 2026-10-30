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

import { USER_ROLES, USER_STATUSES, type UserRole, type UserStatus } from "@/lib/enums";

export interface IUser {
  name: string;
  email: string;
  organization?: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  lastLoginAt?: Date;
  shippingAddress?: IAddress;
  billingSameAsShipping: boolean;
  billingAddress?: IAddress;
  tokenVersion: number;
  failedLoginAttempts: number;
  lockedUntil?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
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
    email: { type: String, required: true, index: true, lowercase: true, trim: true },
    organization: { type: String, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: "customer", index: true },
    status: { type: String, enum: USER_STATUSES, default: "active", index: true },
    department: { type: String, trim: true },
    lastLoginAt: { type: Date },
    shippingAddress: { type: addressSchema },
    billingSameAsShipping: { type: Boolean, default: true },
    billingAddress: { type: addressSchema },
    tokenVersion: { type: Number, default: 0 },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
  },
  { timestamps: true },
);

// One account per (email, role): the same email may have at most one Admin, one Manager and
// one Customer identity, each with its own independent password hash.
userSchema.index({ email: 1, role: 1 }, { unique: true });

// Prevent duplicate accounts sharing a phone number WITHIN the same role (ignoring empty/unset
// phones). Scoped by role — not global — for the same reason as the email index above: the
// same real person may legitimately hold an Admin identity and a Manager identity (or a
// Customer identity) that share a phone number, each with its own independent password.
userSchema.index(
  { phone: 1, role: 1 },
  {
    unique: true,
    partialFilterExpression: { phone: { $type: "string", $gt: "" } },
  },
);

export const User: Model<IUser> = models.User || model<IUser>("User", userSchema);
