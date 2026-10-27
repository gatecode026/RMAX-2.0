import { Schema, model, models, type Model, type Types } from "mongoose";
import {
  INSTITUTION_TYPES,
  LEAD_STATUSES,
  LEAD_PRIORITIES,
  LEAD_SOURCES,
  type LeadStatus,
  type LeadPriority,
  type LeadSource,
} from "@/lib/enums";

export interface ILeadActivity {
  _id?: Types.ObjectId;
  type: "status_change" | "assignment" | "call" | "note" | "email" | "followup_scheduled" | "followup_completed";
  description: string;
  metadata?: Record<string, unknown>;
  performedBy?: Types.ObjectId;
  performedByName: string;
  createdAt: Date;
}

export interface ILead {
  leadNumber: string;
  name: string;
  institution: string;
  institutionType?: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  assignedManager?: Types.ObjectId | null;
  assignedManagerName?: string | null;
  assignedAt?: Date | null;
  assignedBy?: Types.ObjectId | null;
  createdBy?: Types.ObjectId | null;
  preferredModel?: string;
  quantity?: number;
  estimatedValue?: number;
  city?: string;
  state?: string;
  notes?: string;
  lastContactedAt?: Date | null;
  nextFollowUpAt?: Date | null;
  activities: ILeadActivity[];
  isArchived: boolean;
  isDuplicateWarning?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const activitySchema = new Schema<ILeadActivity>(
  {
    type: {
      type: String,
      enum: ["status_change", "assignment", "call", "note", "email", "followup_scheduled", "followup_completed"],
      required: true,
    },
    description: { type: String, required: true, trim: true },
    metadata: { type: Schema.Types.Mixed },
    performedBy: { type: Schema.Types.ObjectId, ref: "User" },
    performedByName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const leadSchema = new Schema<ILead>(
  {
    leadNumber: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    institutionType: { type: String, enum: [...INSTITUTION_TYPES, "Other"], default: "Other" },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    source: { type: String, enum: LEAD_SOURCES, default: "website", index: true },
    status: { type: String, enum: LEAD_STATUSES, default: "new", index: true },
    priority: { type: String, enum: LEAD_PRIORITIES, default: "medium", index: true },
    assignedManager: { type: Schema.Types.ObjectId, ref: "User", index: true, default: null },
    assignedManagerName: { type: String, trim: true, default: null },
    assignedAt: { type: Date },
    assignedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    preferredModel: { type: String, trim: true, default: "pro" },
    quantity: { type: Number, default: 1, min: 1 },
    estimatedValue: { type: Number, default: 0, min: 0 },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    notes: { type: String, trim: true },
    lastContactedAt: { type: Date },
    nextFollowUpAt: { type: Date, index: true },
    activities: [activitySchema],
    isArchived: { type: Boolean, default: false, index: true },
    isDuplicateWarning: { type: Boolean, default: false },
  },
  { timestamps: true },
);

leadSchema.index({ assignedManager: 1, status: 1 });
leadSchema.index({ email: 1, phone: 1 });
leadSchema.index({ createdAt: -1 });

export const Lead: Model<ILead> = models.Lead || model<ILead>("Lead", leadSchema);
