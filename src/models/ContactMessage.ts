import { Schema, model, models, type Model } from "mongoose";
import { CONTACT_MODELS, ENQUIRY_TYPES } from "@/lib/enums";

export interface IContactMessage {
  name: string;
  email: string;
  phone: string;
  enquiryType: (typeof ENQUIRY_TYPES)[number];
  model?: (typeof CONTACT_MODELS)[number];
  orderReference?: string;
  message: string;
  consent: boolean;
  status: "new" | "answered" | "closed";
  createdAt?: Date;
  updatedAt?: Date;
}

const contactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    enquiryType: { type: String, enum: ENQUIRY_TYPES, required: true, index: true },
    model: { type: String, enum: CONTACT_MODELS },
    orderReference: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    consent: { type: Boolean, required: true, validate: (v: boolean) => v === true },
    status: { type: String, enum: ["new", "answered", "closed"], default: "new", index: true },
  },
  { timestamps: true },
);

export const ContactMessage: Model<IContactMessage> =
  models.ContactMessage || model<IContactMessage>("ContactMessage", contactMessageSchema);
