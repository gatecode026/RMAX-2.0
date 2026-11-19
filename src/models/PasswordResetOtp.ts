import { Schema, model, models, type Model, type Types } from "mongoose";

/**
 * One-time password for resetting an account's password. The code itself is never stored: only
 * an HMAC of it, bound to the account. Single use (`usedAt`), short expiry, capped wrong guesses
 * (`attempts`) and a resend cooldown (`lastSentAt`) are all enforced from this record.
 */
export interface IPasswordResetOtp {
  user: Types.ObjectId;
  email: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  lastSentAt: Date;
  usedAt?: Date;
}

const schema = new Schema<IPasswordResetOtp>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    email: { type: String, required: true, lowercase: true, index: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, required: true },
    usedAt: { type: Date },
  },
  { timestamps: true },
);
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // expired codes disappear on their own

export const PasswordResetOtp: Model<IPasswordResetOtp> = models.PasswordResetOtp || model<IPasswordResetOtp>("PasswordResetOtp", schema);
