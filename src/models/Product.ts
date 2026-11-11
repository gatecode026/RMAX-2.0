import { Schema, model, models, type Model, type Types } from "mongoose";

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
  order?: number;
  active?: boolean;
}

/** One ImageKit-hosted asset with its CDN metadata — the admin media manager's source of truth. */
export interface IProductImage {
  fileId: string;
  url: string;
  filePath: string;
  type: "main" | "front" | "side" | "rear" | "angle" | "gallery" | "variant" | "thumbnail";
  alt?: string;
  isPrimary?: boolean;
  sortOrder?: number;
  width?: number;
  height?: number;
}

export interface IProductVariant {
  name: string;
  sku: string;
  variantCode?: string;
  price: number;
  originalPrice?: number;
  dailyCapacity?: string;
  weight?: string;
  dimensions?: string;
  power?: string;
  colour?: string;
  stock?: number;
  images?: IProductImage[];
  description?: string;
  active: boolean;
}

export interface IProductSpecRow {
  label: string;
  value: string;
  unit?: string;
  order?: number;
  visible?: boolean;
}

export interface IProductFaq {
  question: string;
  answer: string;
  order?: number;
  active?: boolean;
}

export interface IProductWarranty {
  available?: boolean;
  duration?: string;
  type?: string;
  description?: string;
  exclusions?: string;
  installationAvailable?: boolean;
  installationType?: string;
  postWarrantySupport?: string;
  serviceContact?: string;
}

export interface IProductSeo {
  title?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export interface IPriceHistoryEntry {
  price: number;
  originalPrice?: number;
  changedAt: Date;
  changedBy?: string;
}

export interface IStockMovement {
  type: "adjustment" | "order" | "restock";
  change: number;
  resultingQuantity: number;
  reason?: string;
  at: Date;
  by?: string;
}

export type ProductStatus = "draft" | "published" | "archived";
export type StockStatus = "in-stock" | "out-of-stock" | "limited-stock" | "made-to-order" | "enquiry-only";

export interface IProduct {
  /** "incinerator", "automatic-vending", "manual-vending", "push-button-vending", "plastic-waste-machinery", or legacy "pad-vending". Drives existing frontend branching — kept as-is. */
  category: "incinerator" | "pad-vending" | "automatic-vending" | "manual-vending" | "push-button-vending" | "plastic-waste-machinery" | "plastic-waste-management";
  /** Optional link to a ProductCategory document, for the admin-managed category list (PRD §2/§6). Independent of the `category` enum above. */
  categoryId?: Types.ObjectId;
  subcategory?: string;
  productType?: string;
  brandId?: Types.ObjectId;
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
  /** Dynamic specification builder (PRD §4E) — unlimited rows, any product category. */
  techSpecs?: IProductSpecRow[];
  slug: string;
  name: string;
  title: string;
  shortName: string;
  sku?: string;
  productCode?: string;
  model?: string;
  manufacturer?: string;
  countryOfOrigin?: string;
  tags?: string[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  price: number;
  originalPrice: number;
  discountPercent: number;
  gstApplicable?: boolean;
  gstRate?: number;
  taxType?: "inclusive" | "exclusive";
  priceHistory?: IPriceHistoryEntry[];
  image: { src: string; alt: string; width: number; height: number };
  /** Photo used on the Home page "Best sellers" cards. */
  cardImage?: { src: string; alt: string; width: number; height: number };
  /** ImageKit-hosted media library for this product — source of truth for the admin uploader. The single-purpose fields above (image/cardImage/gallery) are kept in sync from this for the existing frontend. */
  images?: IProductImage[];
  variants?: IProductVariant[];
  faqs?: IProductFaq[];
  warranty?: IProductWarranty;
  seo?: IProductSeo;
  relatedProductIds?: Types.ObjectId[];
  /** One-line "who it's for" description (Home page cards). */
  summary?: string;
  /** Overlay badge on the Home page card, e.g. "RECOMMENDED". */
  badge?: { label: string; tone: "light" | "navy" | "green" };
  /** Highlighted card on the Home page (blue spec chips). */
  highlight?: boolean;
  specs: IProductSpecs;
  sortOrder: number;
  stock?: number;
  enableStockManagement?: boolean;
  stockStatus?: StockStatus;
  allowBackorders?: boolean;
  lowStockThreshold?: number;
  stockMovements?: IStockMovement[];
  /** Publication workflow (PRD §4N). Public queries only ever return "published". */
  status: ProductStatus;
  publishedAt?: Date;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
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
const pointDef = [{ _id: false, icon: String, title: String, body: String, order: Number, active: { type: Boolean, default: true } }];

const productWarrantySchema = new Schema<IProductWarranty>(
  {
    available: { type: Boolean, default: true },
    duration: String,
    type: { type: String },
    description: String,
    exclusions: String,
    installationAvailable: Boolean,
    installationType: String,
    postWarrantySupport: String,
    serviceContact: String,
  },
  { _id: false },
);

const productImageSchema = new Schema<IProductImage>(
  {
    fileId: { type: String, required: true },
    url: { type: String, required: true },
    filePath: { type: String, required: true },
    type: { type: String, enum: ["main", "front", "side", "rear", "angle", "gallery", "variant", "thumbnail"], required: true },
    alt: String,
    isPrimary: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    width: Number,
    height: Number,
  },
  { _id: false },
);

const productVariantSchema = new Schema<IProductVariant>(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true },
    variantCode: String,
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    dailyCapacity: String,
    weight: String,
    dimensions: String,
    power: String,
    colour: String,
    stock: { type: Number, default: 0, min: 0 },
    images: [productImageSchema],
    description: String,
    active: { type: Boolean, default: true },
  },
  { _id: false },
);

const productSchema = new Schema<IProduct>(
  {
    category: {
      type: String,
      enum: [
        "incinerator",
        "pad-vending",
        "automatic-vending",
        "manual-vending",
        "push-button-vending",
        "plastic-waste-machinery",
        "plastic-waste-management",
      ],
      default: "incinerator",
      index: true,
    },
    categoryId: { type: Schema.Types.ObjectId, ref: "ProductCategory" },
    subcategory: String,
    productType: String,
    brandId: { type: Schema.Types.ObjectId, ref: "ProductBrand" },
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
    techSpecs: [{ _id: false, label: String, value: String, unit: String, order: Number, visible: { type: Boolean, default: true } }],
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    title: { type: String, required: true },
    shortName: { type: String, required: true },
    sku: { type: String, trim: true, uppercase: true },
    productCode: { type: String, trim: true },
    model: { type: String, trim: true },
    manufacturer: { type: String, trim: true },
    countryOfOrigin: { type: String, trim: true, default: "India" },
    tags: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 50, min: 0, max: 100 },
    gstApplicable: { type: Boolean, default: true },
    gstRate: { type: Number, default: 18, min: 0, max: 100 },
    taxType: { type: String, enum: ["inclusive", "exclusive"], default: "exclusive" },
    priceHistory: [{ _id: false, price: Number, originalPrice: Number, changedAt: Date, changedBy: String }],
    // Not required at the schema level: a draft can be created before any image is uploaded
    // (PRD §4N: "Draft products may have incomplete galleries"). A main image is enforced as a
    // business rule only at publish time — see changeProductStatus in lib/admin/product-actions.ts.
    image: {
      src: { type: String, default: "" },
      alt: { type: String, default: "" },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },
    cardImage: {
      src: String,
      alt: String,
      width: Number,
      height: Number,
    },
    images: [productImageSchema],
    variants: [productVariantSchema],
    faqs: [{ _id: false, question: String, answer: String, order: Number, active: { type: Boolean, default: true } }],
    warranty: { type: productWarrantySchema, default: undefined },
    seo: {
      title: String,
      metaDescription: String,
      focusKeyword: String,
      canonicalUrl: String,
      ogTitle: String,
      ogDescription: String,
      ogImage: String,
    },
    relatedProductIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    summary: { type: String },
    badge: {
      label: String,
      tone: { type: String, enum: ["light", "navy", "green"] },
    },
    highlight: { type: Boolean, default: false },
    specs: { type: specsSchema, required: true },
    sortOrder: { type: Number, default: 0, index: true },
    stock: { type: Number, default: 0 },
    enableStockManagement: { type: Boolean, default: true },
    stockStatus: {
      type: String,
      enum: ["in-stock", "out-of-stock", "limited-stock", "made-to-order", "enquiry-only"],
      default: "in-stock",
    },
    allowBackorders: { type: Boolean, default: false },
    lowStockThreshold: { type: Number, default: 5 },
    stockMovements: [{ _id: false, type: String, change: Number, resultingQuantity: Number, reason: String, at: Date, by: String }],
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft", index: true },
    publishedAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const Product: Model<IProduct> = models.Product || model<IProduct>("Product", productSchema);
