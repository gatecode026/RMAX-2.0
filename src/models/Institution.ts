import { Schema, model, models, type Model } from "mongoose";

export interface IInstitution {
  name: string;
  type: string;
  city: string;
  state: string;
  contactPerson: string;
  email: string;
  phone: string;
  unitsInstalled: number;
  status: "Active" | "Pending" | "Inactive";
}

const institutionSchema = new Schema<IInstitution>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, default: "School" },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: "", trim: true },
    contactPerson: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    unitsInstalled: { type: Number, default: 1 },
    status: { type: String, enum: ["Active", "Pending", "Inactive"], default: "Active", index: true },
  },
  { timestamps: true }
);

export const Institution: Model<IInstitution> =
  models.Institution || model<IInstitution>("Institution", institutionSchema);
