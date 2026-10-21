import { Schema, model, models, type Model } from "mongoose";
import { INSTITUTION_TYPES, QUOTE_MODELS } from "@/lib/enums";

export interface IQuoteRequest {
  organizationName: string;
  institutionType: (typeof INSTITUTION_TYPES)[number];
  contactPerson: string;
  role?: string;
  email: string;
  phone?: string;
  preferredModel: (typeof QUOTE_MODELS)[number];
  quantity: number;
  expectedDailyUsage: string;
  deliveryCityPostal: string;
  useCase: string;
  installationRequirements: string;
  consent: boolean;
  status: "new" | "contacted" | "closed";
}

const quoteRequestSchema = new Schema<IQuoteRequest>(
  {
    organizationName: { type: String, required: true, trim: true },
    institutionType: { type: String, enum: INSTITUTION_TYPES, required: true },
    contactPerson: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true },
    preferredModel: { type: String, enum: QUOTE_MODELS, required: true },
    quantity: { type: Number, required: true, min: 1 },
    expectedDailyUsage: { type: String, required: true, trim: true },
    deliveryCityPostal: { type: String, required: true, trim: true },
    useCase: { type: String, required: true, trim: true },
    installationRequirements: { type: String, required: true, trim: true },
    consent: { type: Boolean, required: true, validate: (v: boolean) => v === true },
    status: { type: String, enum: ["new", "contacted", "closed"], default: "new", index: true },
  },
  { timestamps: true },
);

export const QuoteRequest: Model<IQuoteRequest> =
  models.QuoteRequest || model<IQuoteRequest>("QuoteRequest", quoteRequestSchema);
