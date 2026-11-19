import { Types } from "mongoose";
import { Product } from "@/models/Product";
import { ProductFamily, type IFamilyOption } from "@/models/ProductFamily";
import { variantKeyOf } from "@/lib/catalog";

export const slugifyKey = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

type Fail = { error: string; status: number };

/**
 * Checks a product's family link. Every option of the family needs one of its defined values, and no other live
 * (draft/published) product of the family may use the same combination. Returns the fields to store, or `clear`
 * to make the product standalone. `selfId` excludes the product being edited from the duplicate check.
 */
export async function resolveFamilyLink(
  input: { familyId?: string | null; variantOptions?: Record<string, unknown> | null },
  selfId?: unknown,
): Promise<Fail | { clear: true } | { clear?: false; familyId: Types.ObjectId; variantOptions: Record<string, string>; variantKey: string }> {
  if (!input.familyId) return { clear: true };
  if (!Types.ObjectId.isValid(input.familyId)) return { error: "Invalid family.", status: 400 };
  const family = await ProductFamily.findById(input.familyId).lean();
  if (!family) return { error: "Family not found.", status: 404 };

  const given = input.variantOptions ?? {};
  const variantOptions: Record<string, string> = {};
  for (const o of family.options) {
    const v = typeof given[o.key] === "string" ? (given[o.key] as string) : "";
    if (!v) return { error: `Choose a value for ${o.label}.`, status: 422 };
    if (!o.values.some((x) => x.value === v)) return { error: `"${v}" is not a ${o.label} value of ${family.name}.`, status: 422 };
    variantOptions[o.key] = v;
  }
  const variantKey = variantKeyOf(variantOptions);
  const clash = await Product.findOne(
    { familyId: family._id, variantKey, status: { $in: ["draft", "published"] }, ...(selfId ? { _id: { $ne: selfId } } : {}) },
    { name: 1 },
  ).lean();
  if (clash) return { error: `"${clash.name}" already uses this option combination in ${family.name}.`, status: 409 };
  return { familyId: family._id as Types.ObjectId, variantOptions, variantKey };
}

/** Validates admin-submitted option definitions; value ids are derived from labels when not given. */
export function normaliseOptions(input: unknown): { options: IFamilyOption[] } | { error: string } {
  if (!Array.isArray(input) || input.length === 0) return { error: "Add at least one option (for example Size)." };
  const keys = new Set<string>();
  const options: IFamilyOption[] = [];
  for (const raw of input) {
    const label = String(raw?.label ?? "").trim();
    if (!label) return { error: "Every option needs a name." };
    const key = String(raw?.key ?? "").trim() || slugifyKey(label);
    if (!key || keys.has(key)) return { error: `Option "${label}" is duplicated.` };
    keys.add(key);
    const seen = new Set<string>();
    const values = [];
    for (const rv of Array.isArray(raw?.values) ? raw.values : []) {
      const vl = String(rv?.label ?? "").trim();
      if (!vl) continue;
      const value = String(rv?.value ?? "").trim() || slugifyKey(vl);
      if (!value || seen.has(value)) return { error: `Value "${vl}" is duplicated in ${label}.` };
      seen.add(value);
      values.push({ value, label: vl });
    }
    if (values.length === 0) return { error: `Option "${label}" needs at least one value.` };
    options.push({ key, label, values });
  }
  return { options };
}
