import { Schema, model, models, type Model } from "mongoose";

export interface IProductSpecs {
  dailyCapacity: string;
  batchCapacity: string;
  power: string;
  weight: string;
  colours: string;
  cycleDuration: string;
  chamber: string;
  maintenance: string;
  warranty: string;
  delivery: string;
}

export interface IImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface IGalleryItem {
  src: string;
  thumb: string;
  alt: string;
  kind: "image" | "video";
}

export type DetailIcon =
  | "flame" | "settings" | "leaf" | "wrench"
  | "school" | "hospital" | "office" | "institution" | "shield" | "truck" | "cog";

export interface IDetailPoint {
  icon: DetailIcon;
  title: string;
  body: string;
}

export interface IProduct {
  /** "incinerator", "automatic-vending", "manual-vending", "push-button-vending", or legacy "pad-vending". */
  category: "incinerator" | "pad-vending" | "automatic-vending" | "manual-vending" | "push-button-vending";
  /** Colour filter keys: blue, pink, off-white, red. */
  colours: string[];
  /** Portrait photo used by the "detail" card style on the listing page. */
  portraitImage?: IImage;
  /** Narrow (270×311) card photo for the listing page's first row. */
  listImage?: IImage;
  /** Printed M.R.P. shown on the detail page (can differ from the launch "original price"). */
  mrp?: number;
  /** Extra summary chips for products without the standard power/weight/capacity specs. */
  chips?: string[];
  /** Detail page content. */
  intro?: string;
  overview?: string;
  overviewImage?: IImage;
  gallery?: IGalleryItem[];
  features?: IDetailPoint[];
  applications?: IDetailPoint[];
  techSpecs?: { label: string; value: string }[];
  slug: string;
  name: string;
  title: string;
  shortName: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  image: { src: string; alt: string; width: number; height: number };
  /** Photo used on the Home page "Best sellers" cards. */
  cardImage?: { src: string; alt: string; width: number; height: number };
  /** One-line "who it's for" description (Home page cards). */
  summary?: string;
  /** Overlay badge on the Home page card, e.g. "RECOMMENDED". */
  badge?: { label: string; tone: "light" | "navy" | "green" };
  /** Highlighted card on the Home page (blue spec chips). */
  highlight?: boolean;
  specs: IProductSpecs;
  sortOrder: number;
  stock?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const specsSchema = new Schema<IProductSpecs>(
  {
    dailyCapacity: { type: String, required: true },
    batchCapacity: { type: String, required: true },
    power: { type: String, required: true },
    weight: { type: String, required: true },
    colours: { type: String, required: true },
    cycleDuration: { type: String, required: true },
    chamber: { type: String, required: true },
    maintenance: { type: String, required: true },
    warranty: { type: String, required: true },
    delivery: { type: String, required: true },
  },
  { _id: false },
);

const imageDef = { src: String, alt: String, width: Number, height: Number };
const pointDef = [{ _id: false, icon: String, title: String, body: String }];

const productSchema = new Schema<IProduct>(
  {
    category: { type: String, enum: ["incinerator", "pad-vending"], default: "incinerator", index: true },
    colours: { type: [String], default: [] },
    portraitImage: imageDef,
    listImage: imageDef,
    mrp: { type: Number, min: 0 },
    chips: { type: [String], default: undefined },
    intro: String,
    overview: String,
    overviewImage: imageDef,
    gallery: [{ _id: false, src: String, thumb: String, alt: String, kind: { type: String, enum: ["image", "video"] } }],
    features: pointDef,
    applications: pointDef,
    techSpecs: [{ _id: false, label: String, value: String }],
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    title: { type: String, required: true },
    shortName: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 50, min: 0, max: 100 },
    image: {
      src: { type: String, required: true },
      alt: { type: String, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
    },
    cardImage: {
      src: String,
      alt: String,
      width: Number,
      height: Number,
    },
    summary: { type: String },
    badge: {
      label: String,
      tone: { type: String, enum: ["light", "navy", "green"] },
    },
    highlight: { type: Boolean, default: false },
    specs: { type: specsSchema, required: true },
    sortOrder: { type: Number, default: 0, index: true },
    stock: { type: Number, default: 25 },
  },
  { timestamps: true },
);

export const Product: Model<IProduct> = models.Product || model<IProduct>("Product", productSchema);
