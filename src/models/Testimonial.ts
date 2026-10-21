import { Schema, model, models, type Model } from "mongoose";

export interface ITestimonial {
  name: string;
  /** "Principle, Singhaniya School, Jaipur" — role and organisation as displayed. */
  role: string;
  quote: string;
  rating: number;
  /** Month shown on the card, e.g. "October 2025". */
  dateLabel: string;
  /** The large testimonial at the top of the section. */
  featured: boolean;
  /** Product badge + photo, featured testimonial only. */
  product?: string;
  /** Shown on this product's detail page (slug). */
  forProduct?: string;
  image?: { src: string; alt: string; width: number; height: number };
  sortOrder: number;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    quote: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    dateLabel: { type: String, required: true },
    featured: { type: Boolean, default: false, index: true },
    product: { type: String },
    forProduct: { type: String, index: true },
    image: { src: String, alt: String, width: Number, height: Number },
    sortOrder: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

export const Testimonial: Model<ITestimonial> =
  models.Testimonial || model<ITestimonial>("Testimonial", testimonialSchema);
