import { Schema, model, models, type Model } from "mongoose";
import { FAQ_CATEGORIES } from "@/lib/enums";

export interface IFaqItem {
  category: (typeof FAQ_CATEGORIES)[number];
  question: string;
  answer: string;
  sortOrder: number;
}

const faqItemSchema = new Schema<IFaqItem>(
  {
    category: { type: String, enum: FAQ_CATEGORIES, required: true, index: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    sortOrder: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

export const FaqItem: Model<IFaqItem> = models.FaqItem || model<IFaqItem>("FaqItem", faqItemSchema);
