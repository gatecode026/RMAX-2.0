import { Schema, model, models, type Model } from "mongoose";

export interface IServiceRequest {
  ticketId: string;
  institution: string;
  location: string;
  serviceType: "Installation" | "Routine Maintenance" | "Emergency Repair" | "Filter Replacement" | "Inspection";
  model: string;
  status: "Completed" | "In Progress" | "Scheduled" | "Pending";
  priority: "High" | "Medium" | "Low";
  scheduledDate: string;
  technician: string;
  contactPerson?: string;
  phone?: string;
  notes?: string;
}

const serviceRequestSchema = new Schema<IServiceRequest>(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    institution: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    serviceType: {
      type: String,
      enum: ["Installation", "Routine Maintenance", "Emergency Repair", "Filter Replacement", "Inspection"],
      default: "Installation",
    },
    model: { type: String, default: "Pro-Max" },
    status: {
      type: String,
      enum: ["Completed", "In Progress", "Scheduled", "Pending"],
      default: "Pending",
      index: true,
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    scheduledDate: { type: String, default: "" },
    technician: { type: String, default: "Unassigned" },
    contactPerson: { type: String, default: "" },
    phone: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const ServiceRequest: Model<IServiceRequest> =
  models.ServiceRequest || model<IServiceRequest>("ServiceRequest", serviceRequestSchema);
