import { Schema, model, models, type Model, type Types } from "mongoose";
import { INSTITUTION_TYPES, QUOTE_MODELS } from "@/lib/enums";

export interface IQuoteRequest {
  _id?: Types.ObjectId;
  quoteNumber?: string;
  organizationName: string;
  institutionType: (typeof INSTITUTION_TYPES)[number];
  contactPerson: string;
  role?: string;
  email: string;
  phone: string;
  preferredModel: (typeof QUOTE_MODELS)[number];
  quantity: number;
  expectedDailyUsage: string;
  deliveryCityPostal: string;
  useCase?: string;
  installationRequirements?: string;
  consent: boolean;
  status: "new" | "in_review" | "quote_sent" | "approved" | "declined" | "closed" | "contacted";
  quotedAmount?: number;
  notes?: string;
  user?: Types.ObjectId | null;
  assignedManager?: Types.ObjectId | null;
  assignedManagerName?: string;
  validUntil?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const quoteRequestSchema = new Schema<IQuoteRequest>(
  {
    quoteNumber: { type: String, trim: true, index: true },
    organizationName: { type: String, required: true, trim: true },
    institutionType: { type: String, enum: INSTITUTION_TYPES, required: true },
    contactPerson: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    preferredModel: { type: String, enum: QUOTE_MODELS, required: true },
    quantity: { type: Number, required: true, min: 1 },
    expectedDailyUsage: { type: String, required: true, trim: true },
    deliveryCityPostal: { type: String, required: true, trim: true },
    useCase: { type: String, trim: true, default: "Institutional sanitary disposal", required: false },
    installationRequirements: { type: String, trim: true, default: "Standard installation", required: false },
    consent: { type: Boolean, required: true },
    status: {
      type: String,
      enum: ["new", "in_review", "quote_sent", "approved", "declined", "closed", "contacted"],
      default: "new",
      index: true,
    },
    quotedAmount: { type: Number, default: 0 },
    notes: { type: String, trim: true },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    assignedManager: { type: Schema.Types.ObjectId, ref: "User", default: null },
    assignedManagerName: { type: String, trim: true },
    validUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

quoteRequestSchema.index({ createdAt: -1 });

if ((models as Record<string, any>).QuoteRequest) {
  delete (models as Record<string, any>).QuoteRequest;
}

export const QuoteRequest: Model<IQuoteRequest> =
  models.QuoteRequest || model<IQuoteRequest>("QuoteRequest", quoteRequestSchema);
