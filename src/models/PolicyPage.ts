import { Schema, model, models, type Model } from "mongoose";

export interface IPolicySection {
  id: string;
  title: string;
  body: string;
}

export interface IPolicyPage {
  slug: string;
  eyebrow: string;
  title: string;
  lead: string;
  draftNotice: { title: string; body: string };
  sections: IPolicySection[];
}

const policyPageSchema = new Schema<IPolicyPage>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    eyebrow: { type: String, required: true },
    title: { type: String, required: true },
    lead: { type: String, required: true },
    draftNotice: {
      title: { type: String, required: true },
      body: { type: String, required: true },
    },
    sections: [
      new Schema<IPolicySection>(
        {
          id: { type: String, required: true },
          title: { type: String, required: true },
          body: { type: String, required: true },
        },
        { _id: false },
      ),
    ],
  },
  { timestamps: true },
);

export const PolicyPage: Model<IPolicyPage> =
  models.PolicyPage || model<IPolicyPage>("PolicyPage", policyPageSchema);
