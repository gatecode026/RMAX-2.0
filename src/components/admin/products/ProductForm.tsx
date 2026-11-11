"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Eye,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import ProductImageUploader, { type UploadedProductImage, primaryImage } from "./ProductImageUploader";

// ---------------------------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------------------------

interface SpecRow {
  label: string;
  value: string;
  unit?: string;
}

interface PointRow {
  title: string;
  body: string;
  icon?: string;
}

interface FaqRow {
  question: string;
  answer: string;
}

interface VariantRow {
  name: string;
  sku: string;
  price: number;
  originalPrice?: number;
  dailyCapacity?: string;
  weight?: string;
  power?: string;
  colour?: string;
  stock?: number;
  active: boolean;
}

export interface ProductFormInitial {
  _id?: string;
  name?: string;
  title?: string;
  shortName?: string;
  slug?: string;
  sku?: string;
  productCode?: string;
  model?: string;
  manufacturer?: string;
  countryOfOrigin?: string;
  tags?: string[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  category?: string;
  categoryId?: string;
  subcategory?: string;
  productType?: string;
  brandId?: string;
  summary?: string;
  intro?: string;
  overview?: string;
  price?: number;
  originalPrice?: number;
  gstApplicable?: boolean;
  gstRate?: number;
  taxType?: "inclusive" | "exclusive";
  image?: { src: string; alt?: string };
  images?: UploadedProductImage[];
  variants?: VariantRow[];
  techSpecs?: SpecRow[];
  features?: PointRow[];
  applications?: PointRow[];
  faqs?: FaqRow[];
  warranty?: {
    available?: boolean;
    duration?: string;
    type?: string;
    description?: string;
    exclusions?: string;
    installationAvailable?: boolean;
    installationType?: string;
    postWarrantySupport?: string;
    serviceContact?: string;
  };
  seo?: {
    title?: string;
    metaDescription?: string;
    focusKeyword?: string;
    canonicalUrl?: string;
    ogImage?: string;
  };
  specs?: {
    dailyCapacity?: string;
    batchCapacity?: string;
    power?: string;
    weight?: string;
    colours?: string;
    cycleDuration?: string;
    chamber?: string;
    maintenance?: string;
    warranty?: string;
    delivery?: string;
  };
  stock?: number;
  enableStockManagement?: boolean;
  stockStatus?: string;
  allowBackorders?: boolean;
  lowStockThreshold?: number;
  relatedProductIds?: string[];
  status?: "draft" | "published" | "archived";
}

interface CategoryOption {
  _id: string;
  name: string;
}
interface BrandOption {
  _id: string;
  name: string;
}
interface RelatedOption {
  _id: string;
  name: string;
  slug: string;
}

// ---------------------------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------------------------

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-[#0B2450]">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, required, children, hint, error }: { label: string; required?: boolean; children: React.ReactNode; hint?: string; error?: string }) {
  return (
    <div>
      <label className={cn("block text-xs font-semibold uppercase tracking-wider mb-1.5", error ? "text-red-600" : "text-slate-700")}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-red-600">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>
      )}
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#10469B] focus:outline-none";
const inputInvalidCls = "w-full rounded-lg border border-red-300 bg-red-50/40 px-3.5 py-2.5 text-sm text-slate-800 focus:border-red-500 focus:outline-none";

function TextInput({ invalid, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input {...props} className={cn(invalid ? inputInvalidCls : inputCls, props.className)} />;
}
function TextArea({ invalid, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea {...props} className={cn(invalid ? inputInvalidCls : inputCls, props.className)} />;
}
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-5.5 w-10 shrink-0 rounded-full transition-colors", checked ? "bg-[#10469B]" : "bg-slate-200")}
      >
        <span className={cn("absolute top-0.5 size-4.5 rounded-full bg-white shadow transition-[left] duration-200", checked ? "left-5" : "left-0.5")} />
      </button>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
  );
}

// ---------------------------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------------------------

export function ProductForm({ mode, initial }: { mode: "create" | "edit"; initial?: ProductFormInitial }) {
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();

  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [sku, setSku] = useState(initial?.sku || "");
  const [productCode, setProductCode] = useState(initial?.productCode || "");
  const [category, setCategory] = useState(initial?.category || "incinerator");
  const [subcategory, setSubcategory] = useState(initial?.subcategory || "");
  const [productType, setProductType] = useState(initial?.productType || "");
  const [model, setModel] = useState(initial?.model || "");
  const [summary, setSummary] = useState(initial?.summary || "");
  const [overview, setOverview] = useState(initial?.overview || "");
  const [manufacturer, setManufacturer] = useState(initial?.manufacturer || "");
  const [countryOfOrigin, setCountryOfOrigin] = useState(initial?.countryOfOrigin || "India");
  const [tags, setTags] = useState((initial?.tags || []).join(", "));
  const [isFeatured, setIsFeatured] = useState(Boolean(initial?.isFeatured));
  const [isNewArrival, setIsNewArrival] = useState(Boolean(initial?.isNewArrival));

  const [images, setImages] = useState<UploadedProductImage[]>(initial?.images || []);

  const [price, setPrice] = useState(initial?.price ?? 0);
  const [originalPrice, setOriginalPrice] = useState(initial?.originalPrice ?? 0);
  const [gstApplicable, setGstApplicable] = useState(initial?.gstApplicable ?? true);
  const [gstRate, setGstRate] = useState(initial?.gstRate ?? 18);
  const [taxType, setTaxType] = useState<"inclusive" | "exclusive">(initial?.taxType || "exclusive");

  const [variants, setVariants] = useState<VariantRow[]>(initial?.variants || []);
  const [techSpecs, setTechSpecs] = useState<SpecRow[]>(initial?.techSpecs || []);
  const [features, setFeatures] = useState<PointRow[]>(initial?.features || []);
  const [applications, setApplications] = useState<PointRow[]>(initial?.applications || []);
  const [faqs, setFaqs] = useState<FaqRow[]>(initial?.faqs || []);

  const [warrantyAvailable, setWarrantyAvailable] = useState(initial?.warranty?.available ?? true);
  const [warrantyDuration, setWarrantyDuration] = useState(initial?.warranty?.duration || "1 year");
  const [warrantyType, setWarrantyType] = useState(initial?.warranty?.type || "Piece-to-piece replacement");
  const [warrantyDescription, setWarrantyDescription] = useState(initial?.warranty?.description || "");
  const [warrantyExclusions, setWarrantyExclusions] = useState(initial?.warranty?.exclusions || "Physical damage non-returnable");
  const [installationAvailable, setInstallationAvailable] = useState(Boolean(initial?.warranty?.installationAvailable));
  const [installationType, setInstallationType] = useState(initial?.warranty?.installationType || "");
  const [postWarrantySupport, setPostWarrantySupport] = useState(initial?.warranty?.postWarrantySupport || "Repairing parts & service available");
  const [serviceContact, setServiceContact] = useState(initial?.warranty?.serviceContact || "");

  const [stock, setStock] = useState(initial?.stock ?? 0);
  const [enableStockManagement, setEnableStockManagement] = useState(initial?.enableStockManagement ?? true);
  const [stockStatus, setStockStatus] = useState(initial?.stockStatus || "in-stock");
  const [allowBackorders, setAllowBackorders] = useState(Boolean(initial?.allowBackorders));
  const [lowStockThreshold, setLowStockThreshold] = useState(initial?.lowStockThreshold ?? 5);

  const [dailyCapacity, setDailyCapacity] = useState(initial?.specs?.dailyCapacity || "");
  const [batchCapacity, setBatchCapacity] = useState(initial?.specs?.batchCapacity || "Not specified");
  const [power, setPower] = useState(initial?.specs?.power || "");
  const [weight, setWeight] = useState(initial?.specs?.weight || "");

  const [seoTitle, setSeoTitle] = useState(initial?.seo?.title || "");
  const [seoDescription, setSeoDescription] = useState(initial?.seo?.metaDescription || "");
  const [seoKeyword, setSeoKeyword] = useState(initial?.seo?.focusKeyword || "");

  const [relatedProductIds, setRelatedProductIds] = useState<string[]>(initial?.relatedProductIds || []);
  const [relatedOptions, setRelatedOptions] = useState<RelatedOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [brandOptions, setBrandOptions] = useState<BrandOption[]>([]);
  const [categoryId, setCategoryId] = useState(initial?.categoryId || "");
  const [brandId, setBrandId] = useState(initial?.brandId || "");

  const [status, setStatus] = useState<"draft" | "published" | "archived">(initial?.status || "draft");
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    fetch("/api/admin/products?pageSize=100&status=published")
      .then((r) => r.json())
      .then((j) => j.success && setRelatedOptions(j.products.map((p: { _id: string; name: string; slug: string }) => ({ _id: p._id, name: p.name, slug: p.slug }))))
      .catch(() => {});
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((j) => j.success && setCategoryOptions(j.categories))
      .catch(() => {});
    fetch("/api/admin/brands")
      .then((r) => r.json())
      .then((j) => j.success && setBrandOptions(j.brands))
      .catch(() => {});
  }, []);

  const derivedSlug = useMemo(() => {
    if (slugTouched) return slug;
    return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }, [name, slug, slugTouched]);

  function buildPayload(nextStatus: "draft" | "published" | "archived") {
    const main = primaryImage(images);
    return {
      name,
      title: name,
      shortName: name,
      slug: derivedSlug,
      sku: sku || undefined,
      productCode: productCode || undefined,
      model: model || undefined,
      manufacturer: manufacturer || undefined,
      countryOfOrigin,
      category,
      categoryId: categoryId || undefined,
      subcategory: subcategory || undefined,
      productType: productType || undefined,
      brandId: brandId || undefined,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      isFeatured,
      isNewArrival,
      summary,
      overview,
      intro: summary,
      price: Number(price) || 0,
      originalPrice: Number(originalPrice) || Number(price) || 0,
      gstApplicable,
      gstRate: Number(gstRate) || 0,
      taxType,
      image: main
        ? { src: main.url, alt: main.alt || name, width: main.width || 600, height: main.height || 600 }
        : { src: "", alt: name, width: 600, height: 600 },
      cardImage: main ? { src: main.url, alt: main.alt || name, width: main.width || 600, height: main.height || 600 } : undefined,
      images,
      gallery: images
        .filter((i) => i.type === "gallery" || i.type !== "main")
        .map((i) => ({ src: i.url, thumb: i.url, alt: i.alt || name, kind: "image" as const })),
      variants: variants.map((v) => ({ ...v, variantCode: v.sku })),
      techSpecs: techSpecs.map((s, idx) => ({ ...s, order: idx, visible: true })),
      features: features.map((f, idx) => ({ icon: f.icon || "cog", title: f.title, body: f.body, order: idx, active: true })),
      applications: applications.map((a, idx) => ({ icon: a.icon || "institution", title: a.title, body: a.body, order: idx, active: true })),
      faqs: faqs.map((f, idx) => ({ ...f, order: idx, active: true })),
      warranty: {
        available: warrantyAvailable,
        duration: warrantyDuration,
        type: warrantyType,
        description: warrantyDescription,
        exclusions: warrantyExclusions,
        installationAvailable,
        installationType,
        postWarrantySupport,
        serviceContact,
      },
      seo: { title: seoTitle || name, metaDescription: seoDescription || summary, focusKeyword: seoKeyword },
      relatedProductIds,
      specs: {
        dailyCapacity: dailyCapacity || "Not specified",
        batchCapacity: batchCapacity || "Not specified",
        power: power || "Not specified",
        weight: weight || "Not specified",
        colours: "Standard",
        cycleDuration: "Not specified",
        chamber: "Not specified",
        maintenance: "Not specified",
        warranty: warrantyDuration,
        delivery: "3–5 days · Free shipping",
      },
      stock: Number(stock) || 0,
      enableStockManagement,
      stockStatus,
      allowBackorders,
      lowStockThreshold: Number(lowStockThreshold) || 0,
      status: nextStatus,
    };
  }

  async function handleSave(nextStatus: "draft" | "published") {
    // Clear previous errors only — never touch the entered field values here. The form must
    // keep exactly what the user typed until they successfully submit, refresh, or navigate
    // away; a failed save (client-side or server-side) should never reset it.
    setFormError(null);
    const nextFieldErrors: Record<string, string> = {};
    if (!name.trim()) nextFieldErrors.name = "Product name is required.";
    if (!Number.isFinite(price) || price < 0) nextFieldErrors.price = "Enter a valid, non-negative price.";
    if (nextStatus === "published" && !primaryImage(images)) nextFieldErrors.image = "A main product image is required before publishing.";
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) {
      const msg = "Please fix the highlighted fields before saving.";
      setFormError(msg);
      toastError("Product Not Submitted", msg);
      return;
    }

    setSaving(nextStatus === "published" ? "publish" : "draft");
    try {
      const payload = buildPayload(nextStatus);
      const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${initial?._id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to save product");

      toastSuccess(nextStatus === "published" ? "Product published." : "Draft saved.");
      setStatus(nextStatus);
      router.push("/admin/products");
      router.refresh();
    } catch (e) {
      // Server-side failure (validation, duplicate SKU/slug, DB error, …) — surfaced inline
      // exactly as it came back from the API. The form keeps every field the user entered so
      // they can fix and resubmit without retyping anything.
      const msg = e instanceof Error ? e.message : "Failed to save product";
      setFormError(msg);
      toastError("Product Not Submitted", msg);
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="pb-24">
      {formError && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Basic Information">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Product Name" required error={fieldErrors.name}>
                <TextInput
                  invalid={Boolean(fieldErrors.name)}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="Napkin Incinerator Machine (Pro)"
                />
              </Field>
              <Field label="Product Slug" required hint="Auto-generated from the name — edit if you need a different URL.">
                <TextInput
                  value={derivedSlug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                />
              </Field>
              <Field label="SKU" hint="Leave blank to auto-generate a unique SKU.">
                <TextInput value={sku} onChange={(e) => setSku(e.target.value.toUpperCase())} placeholder="RMAXPRO-1234" />
              </Field>
              <Field label="Product Code">
                <TextInput value={productCode} onChange={(e) => setProductCode(e.target.value)} />
              </Field>
              <Field label="Brand">
                <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className={inputCls}>
                  <option value="">— None —</option>
                  {brandOptions.map((b) => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Category" required>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                  <option value="incinerator">Incinerator</option>
                  <option value="automatic-vending">Automatic Vending</option>
                  <option value="manual-vending">Manual Vending</option>
                  <option value="push-button-vending">Push Button Vending</option>
                  <option value="pad-vending">Pad Vending (legacy)</option>
                </select>
              </Field>
              <Field label="Product Category (managed)" hint="Optional link to a Categories entry.">
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
                  <option value="">— None —</option>
                  {categoryOptions.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Subcategory">
                <TextInput value={subcategory} onChange={(e) => setSubcategory(e.target.value)} />
              </Field>
              <Field label="Product Type">
                <TextInput value={productType} onChange={(e) => setProductType(e.target.value)} />
              </Field>
              <Field label="Model Name">
                <TextInput value={model} onChange={(e) => setModel(e.target.value)} />
              </Field>
              <Field label="Manufacturer">
                <TextInput value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} placeholder="RMAX Solutions" />
              </Field>
              <Field label="Country of Origin">
                <TextInput value={countryOfOrigin} onChange={(e) => setCountryOfOrigin(e.target.value)} />
              </Field>
            </div>
            <Field label="Short Description" required>
              <TextArea rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="One-line summary shown on product cards" />
            </Field>
            <Field label="Full Product Description">
              <TextArea rows={4} value={overview} onChange={(e) => setOverview(e.target.value)} />
            </Field>
            <Field label="Tags" hint="Comma-separated">
              <TextInput value={tags} onChange={(e) => setTags(e.target.value)} placeholder="hygiene, institutional, automatic" />
            </Field>
            <div className="flex flex-wrap gap-6">
              <Toggle checked={isFeatured} onChange={setIsFeatured} label="Featured Product" />
              <Toggle checked={isNewArrival} onChange={setIsNewArrival} label="New Arrival" />
            </div>
          </Section>

          <div>
            <ProductImageUploader
              images={images}
              onChange={(next) => {
                setImages(next);
                if (fieldErrors.image) setFieldErrors((prev) => ({ ...prev, image: "" }));
              }}
              productSlug={derivedSlug}
            />
            {fieldErrors.image && (
              <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-red-600">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                {fieldErrors.image}
              </p>
            )}
          </div>

          <Section title="Pricing">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Selling Price (₹)" required error={fieldErrors.price}>
                <TextInput
                  invalid={Boolean(fieldErrors.price)}
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => {
                    setPrice(Number(e.target.value));
                    if (fieldErrors.price) setFieldErrors((prev) => ({ ...prev, price: "" }));
                  }}
                />
              </Field>
              <Field label="Regular Price / M.R.P. (₹)">
                <TextInput type="number" min={0} value={originalPrice} onChange={(e) => setOriginalPrice(Number(e.target.value))} />
              </Field>
              <Field label="GST Rate (%)">
                <TextInput type="number" min={0} max={100} value={gstRate} onChange={(e) => setGstRate(Number(e.target.value))} disabled={!gstApplicable} />
              </Field>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <Toggle checked={gstApplicable} onChange={setGstApplicable} label="GST Applicable" />
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                Tax type:
                <select value={taxType} onChange={(e) => setTaxType(e.target.value as "inclusive" | "exclusive")} className="rounded-lg border border-slate-200 px-2 py-1 text-sm">
                  <option value="exclusive">Exclusive</option>
                  <option value="inclusive">Inclusive</option>
                </select>
              </label>
            </div>
            {originalPrice > price && price > 0 && (
              <p className="text-xs font-semibold text-emerald-700">
                {Math.round(((originalPrice - price) / originalPrice) * 100)}% discount · Customer pays{" "}
                {gstApplicable && taxType === "exclusive" ? `₹${Math.round(price * (1 + gstRate / 100)).toLocaleString("en-IN")} (incl. GST)` : `₹${price.toLocaleString("en-IN")}`}
              </p>
            )}
          </Section>

          <Section title="Variants" subtitle="Optional — leave empty for a standalone product with no variants.">
            <RepeatingList
              rows={variants}
              onChange={setVariants}
              empty={{ name: "", sku: "", price: 0, active: true }}
              addLabel="Add Variant"
              renderRow={(row, update) => (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <TextInput placeholder="Variant name (e.g. Basic)" value={row.name} onChange={(e) => update({ ...row, name: e.target.value })} />
                  <TextInput placeholder="Variant SKU" value={row.sku} onChange={(e) => update({ ...row, sku: e.target.value.toUpperCase() })} />
                  <TextInput type="number" placeholder="Price" value={row.price} onChange={(e) => update({ ...row, price: Number(e.target.value) })} />
                  <TextInput placeholder="Colour" value={row.colour || ""} onChange={(e) => update({ ...row, colour: e.target.value })} />
                  <TextInput placeholder="Daily capacity" value={row.dailyCapacity || ""} onChange={(e) => update({ ...row, dailyCapacity: e.target.value })} />
                  <TextInput placeholder="Weight" value={row.weight || ""} onChange={(e) => update({ ...row, weight: e.target.value })} />
                  <TextInput placeholder="Power" value={row.power || ""} onChange={(e) => update({ ...row, power: e.target.value })} />
                  <TextInput type="number" placeholder="Stock" value={row.stock || 0} onChange={(e) => update({ ...row, stock: Number(e.target.value) })} />
                </div>
              )}
            />
          </Section>

          <Section title="Technical Specifications" subtitle="Unlimited rows — works for any product category.">
            <div className="grid grid-cols-1 gap-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-lg bg-slate-50 p-3">
                <Field label="Daily Capacity (shown as a highlight tile)"><TextInput value={dailyCapacity} onChange={(e) => setDailyCapacity(e.target.value)} placeholder="200-250/day" /></Field>
                <Field label="Power (shown as a highlight tile)"><TextInput value={power} onChange={(e) => setPower(e.target.value)} placeholder="1000 W" /></Field>
                <Field label="Weight (shown as a highlight tile)"><TextInput value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="9kg" /></Field>
                <Field label="Batch Capacity (shown as a highlight tile)"><TextInput value={batchCapacity} onChange={(e) => setBatchCapacity(e.target.value)} placeholder="4-6 at once" /></Field>
              </div>
            </div>
            <RepeatingList
              rows={techSpecs}
              onChange={setTechSpecs}
              empty={{ label: "", value: "" }}
              addLabel="Add Specification"
              renderRow={(row, update) => (
                <div className="grid grid-cols-3 gap-2">
                  <TextInput placeholder="Name (e.g. Voltage)" value={row.label} onChange={(e) => update({ ...row, label: e.target.value })} />
                  <TextInput placeholder="Value (e.g. 220)" value={row.value} onChange={(e) => update({ ...row, value: e.target.value })} />
                  <TextInput placeholder="Unit (e.g. V)" value={row.unit || ""} onChange={(e) => update({ ...row, unit: e.target.value })} />
                </div>
              )}
            />
          </Section>

          <Section title="Key Features">
            <RepeatingList
              rows={features}
              onChange={setFeatures}
              empty={{ title: "", body: "" }}
              addLabel="Add Feature"
              renderRow={(row, update) => (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <TextInput placeholder="Feature title" value={row.title} onChange={(e) => update({ ...row, title: e.target.value })} />
                  <TextInput placeholder="Short description" value={row.body} onChange={(e) => update({ ...row, body: e.target.value })} />
                </div>
              )}
            />
          </Section>

          <Section title="Applications" subtitle="Where this product is used.">
            <RepeatingList
              rows={applications}
              onChange={setApplications}
              empty={{ title: "", body: "" }}
              addLabel="Add Application"
              renderRow={(row, update) => (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <TextInput placeholder="e.g. Hospitals" value={row.title} onChange={(e) => update({ ...row, title: e.target.value })} />
                  <TextInput placeholder="Short description" value={row.body} onChange={(e) => update({ ...row, body: e.target.value })} />
                </div>
              )}
            />
          </Section>

          <Section title="Warranty & Support">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Warranty Duration"><TextInput value={warrantyDuration} onChange={(e) => setWarrantyDuration(e.target.value)} /></Field>
              <Field label="Warranty Type"><TextInput value={warrantyType} onChange={(e) => setWarrantyType(e.target.value)} /></Field>
            </div>
            <Field label="Warranty Description"><TextArea rows={2} value={warrantyDescription} onChange={(e) => setWarrantyDescription(e.target.value)} /></Field>
            <Field label="Warranty Exclusions"><TextArea rows={2} value={warrantyExclusions} onChange={(e) => setWarrantyExclusions(e.target.value)} /></Field>
            <div className="flex flex-wrap items-center gap-6">
              <Toggle checked={warrantyAvailable} onChange={setWarrantyAvailable} label="Warranty Available" />
              <Toggle checked={installationAvailable} onChange={setInstallationAvailable} label="Installation Available" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Installation Type"><TextInput value={installationType} onChange={(e) => setInstallationType(e.target.value)} /></Field>
              <Field label="Post-Warranty Support"><TextInput value={postWarrantySupport} onChange={(e) => setPostWarrantySupport(e.target.value)} /></Field>
              <Field label="Service Contact"><TextInput value={serviceContact} onChange={(e) => setServiceContact(e.target.value)} placeholder="mukesh@rmaxelectro.com" /></Field>
            </div>
          </Section>

          <Section title="Related Products">
            <div className="flex flex-wrap gap-2">
              {relatedOptions.map((p) => {
                const active = relatedProductIds.includes(p._id);
                return (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() =>
                      setRelatedProductIds((prev) => (active ? prev.filter((id) => id !== p._id) : [...prev, p._id]))
                    }
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                      active ? "border-[#10469B] bg-blue-50 text-[#10469B]" : "border-slate-200 text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    {p.name}
                  </button>
                );
              })}
              {relatedOptions.length === 0 && <p className="text-xs text-slate-400">No other published products yet to relate to.</p>}
            </div>
          </Section>

          <Section title="FAQs">
            <RepeatingList
              rows={faqs}
              onChange={setFaqs}
              empty={{ question: "", answer: "" }}
              addLabel="Add FAQ"
              renderRow={(row, update) => (
                <div className="space-y-2">
                  <TextInput placeholder="Question" value={row.question} onChange={(e) => update({ ...row, question: e.target.value })} />
                  <TextArea rows={2} placeholder="Answer" value={row.answer} onChange={(e) => update({ ...row, answer: e.target.value })} />
                </div>
              )}
            />
          </Section>

          <Section title="SEO Settings">
            <Field label="SEO Title" hint="Defaults to the product name."><TextInput value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={name} /></Field>
            <Field label="Meta Description" hint="Defaults to the short description."><TextArea rows={2} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder={summary} /></Field>
            <Field label="Focus Keyword"><TextInput value={seoKeyword} onChange={(e) => setSeoKeyword(e.target.value)} /></Field>
          </Section>
        </div>

        {/* Right column: stock + publishing */}
        <div className="space-y-6">
          <Section title="Stock & Inventory">
            <Field label="Stock Quantity"><TextInput type="number" min={0} value={stock} onChange={(e) => setStock(Number(e.target.value))} /></Field>
            <Field label="Stock Status">
              <select value={stockStatus} onChange={(e) => setStockStatus(e.target.value)} className={inputCls}>
                <option value="in-stock">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="limited-stock">Limited Stock</option>
                <option value="made-to-order">Made to Order</option>
                <option value="enquiry-only">Enquiry Only</option>
              </select>
            </Field>
            <Field label="Low Stock Threshold"><TextInput type="number" min={0} value={lowStockThreshold} onChange={(e) => setLowStockThreshold(Number(e.target.value))} /></Field>
            <div className="flex flex-col gap-3">
              <Toggle checked={enableStockManagement} onChange={setEnableStockManagement} label="Enable Stock Management" />
              <Toggle checked={allowBackorders} onChange={setAllowBackorders} label="Allow Backorders" />
            </div>
          </Section>

          <div className="sticky top-4 rounded-xl border border-[#E5EBF4] bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-[#0B2450]">Publish</h2>
            <p className="text-xs text-slate-500">
              Current status: <span className="font-semibold capitalize">{status}</span>
              {status !== "published" && " — not visible to customers."}
            </p>
            <button
              type="button"
              onClick={() => handleSave("draft")}
              disabled={saving !== null}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {saving === "draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save as Draft
            </button>
            {mode === "edit" && initial?.slug && (
              <a
                href={`/products/${derivedSlug}`}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Eye className="h-4 w-4" />
                Preview Product
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <button
              type="button"
              onClick={() => handleSave("published")}
              disabled={saving !== null}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#10469B] px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#0B2450] disabled:opacity-50"
            >
              {saving === "publish" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Publish Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Generic repeating-row list (specs, features, applications, faqs, variants)
// ---------------------------------------------------------------------------------------------

function RepeatingList<T>({
  rows,
  onChange,
  empty,
  addLabel,
  renderRow,
}: {
  rows: T[];
  onChange: (rows: T[]) => void;
  empty: T;
  addLabel: string;
  renderRow: (row: T, update: (next: T) => void) => React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      {rows.map((row, idx) => (
        <div key={idx} className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
          <div className="flex-1">{renderRow(row, (next) => onChange(rows.map((r, i) => (i === idx ? next : r))))}</div>
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, i) => i !== idx))}
            className="mt-1 shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
            title="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, empty])}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-[#10469B] hover:text-[#10469B]"
      >
        <Plus className="h-3.5 w-3.5" />
        {addLabel}
      </button>
    </div>
  );
}
