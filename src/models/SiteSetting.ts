import { Schema, model, models, type Model } from "mongoose";

/** Small keyed documents for editable site content (Home stats, review summary). */
export interface ISiteSetting {
  key: string;
  value: unknown;
}

const siteSettingSchema = new Schema<ISiteSetting>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

export const SiteSetting: Model<ISiteSetting> =
  models.SiteSetting || model<ISiteSetting>("SiteSetting", siteSettingSchema);
