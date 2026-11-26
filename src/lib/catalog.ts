/**
 * Data-driven catalogue grouping. Pure functions (safe on server and client): the database keeps one Product
 * per sellable option; a ProductFamily defines the options and each member stores its own values. Nothing here
 * knows about incinerators, vending machines or any other specific product.
 */
import type { IFamilyOption } from "@/models/ProductFamily";

export interface FamilyDTO {
  _id: string;
  name: string;
  slug: string;
  options: IFamilyOption[];
  defaultProduct?: string;
  sortOrder?: number;
}

/** The fields of a product the grouping logic needs. */
export interface Member {
  _id: string;
  slug: string;
  sortOrder?: number;
  familyId?: string;
  variantOptions?: Record<string, string>;
  techSpecs?: { label: string; value: string; unit?: string; visible?: boolean }[];
  price?: number;
  stockStatus?: string;
}

export interface GroupCardMeta {
  title: string;
  /** e.g. "3 options"; omitted when the family has a single published member. */
  badge?: string;
  chips: string[];
  /** Number of published members. */
  count: number;
}

/** Canonical "key=value|key=value" string (keys sorted) used to detect duplicate option combinations. */
export function variantKeyOf(opts: Record<string, string> | undefined): string {
  return Object.keys(opts ?? {})
    .sort()
    .map((k) => `${k}=${opts![k]}`)
    .join("|");
}

const bySort = (a: Member, b: Member) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.slug.localeCompare(b.slug);

/** Published members of a family that carry option values. */
export function membersOf<T extends Member>(family: FamilyDTO, published: T[]): T[] {
  return published.filter((p) => p.familyId === family._id && p.variantOptions && Object.keys(p.variantOptions).length > 0).sort(bySort);
}

/** The family's default member when published, else the first published member (deterministic). */
export function defaultMember<T extends Member>(family: FamilyDTO, members: T[]): T | undefined {
  return members.find((m) => m._id === family.defaultProduct) ?? members[0];
}

function chipsFor(family: FamilyDTO, members: Member[]): string[] {
  const out: string[] = [];
  for (const o of family.options) {
    const present = o.values.filter((v) => members.some((m) => m.variantOptions?.[o.key] === v.value));
    if (!present.length) continue;
    // Value only (no option label); a unit shared by every value is shown once: "25 Pads · 50 Pads" → "25 · 50 Pads".
    const labels = present.map((v) => v.label);
    const unit = labels[0].split(" ").slice(1).pop();
    const shared = labels.length > 1 && unit && labels.every((l) => l.split(" ").length === 2 && l.endsWith(` ${unit}`));
    out.push(shared ? `${labels.map((l) => l.split(" ")[0]).join(" · ")} ${unit}` : labels.join(" · "));
  }
  // Free slots: other documented specs of the members (e.g. "Wall-mounted", "1 year"); a spec that differs between members is joined, if short.
  const taken = new Set(family.options.map((o) => o.label.toLowerCase()));
  for (const r of members[0]?.techSpecs ?? []) {
    if (out.length >= 4) break;
    if (r.visible === false || !r.label || !r.value || taken.has(r.label.toLowerCase())) continue;
    const found = members.map((m) => m.techSpecs?.find((x) => x.label === r.label && x.visible !== false && x.value));
    if (found.some((x) => !x)) continue; // not documented on every member
    const text = [...new Set(found.map((x) => specText(x!)))].join(" · ");
    if (text.length <= 28 && !out.includes(text)) out.push(text);
  }
  return out.slice(0, 4);
}

/**
 * Storefront cards: one per standalone product, one per family with at least one published member.
 * `listed` is what the visitor currently sees (after search / category filters), `published` is the whole
 * published catalogue (used for the family's totals). The card opens the family's default member when it is in
 * `listed`, otherwise the first listed member — so a search that matches one specific variant opens that variant.
 */
export function buildCards<T extends Member>(listed: T[], published: T[], families: FamilyDTO[]): (T & { group?: GroupCardMeta })[] {
  const famById = new Map(families.map((f) => [f._id, f]));
  const out: (T & { group?: GroupCardMeta })[] = [];
  const seen = new Set<string>();
  for (const p of listed) {
    const fam = p.familyId && p.variantOptions && Object.keys(p.variantOptions).length ? famById.get(p.familyId) : undefined;
    if (!fam) {
      out.push(p);
      continue;
    }
    if (seen.has(fam._id)) continue;
    seen.add(fam._id);
    const all = membersOf(fam, published);
    const inList = listed.filter((x) => x.familyId === fam._id && x.variantOptions && Object.keys(x.variantOptions).length).sort(bySort);
    const rep = defaultMember(fam, inList) ?? p;
    out.push({
      ...rep,
      group: { title: fam.name, badge: all.length > 1 ? `${all.length} options` : undefined, chips: chipsFor(fam, all), count: all.length },
    });
  }
  return out;
}

export interface PickerOption {
  value: string;
  label: string;
  active: boolean;
  /** Product to open for this value (nearest available combination); null = no published product has this value. */
  slug: string | null;
  price?: number;
  stockStatus?: string;
}
export interface PickerGroup {
  key: string;
  label: string;
  options: PickerOption[];
}

/** Family of a product, if it belongs to one that exists. */
export function familyOf(product: Member, families: FamilyDTO[]): FamilyDTO | undefined {
  return product.familyId && product.variantOptions ? families.find((f) => f._id === product.familyId) : undefined;
}

/**
 * Option dropdowns for a family product. Changing one option keeps the others when that combination exists;
 * when it doesn't, the nearest published combination (most other options in common) is opened, so every
 * published product stays reachable. A value no published product has is disabled (slug null).
 */
export function pickerGroups<T extends Member>(product: T, family: FamilyDTO, published: T[]): PickerGroup[] {
  const members = membersOf(family, published);
  const cur = product.variantOptions ?? {};
  return family.options.map((o) => ({
    key: o.key,
    label: o.label,
    options: o.values.map((v) => {
      const cands = members.filter((m) => m.variantOptions?.[o.key] === v.value);
      const score = (m: T) => family.options.filter((x) => x.key !== o.key && m.variantOptions?.[x.key] === cur[x.key]).length;
      const best = [...cands].sort((a, b) => score(b) - score(a) || Number(b._id === family.defaultProduct) - Number(a._id === family.defaultProduct))[0];
      const active = cur[o.key] === v.value;
      const target = active ? product : best;
      return {
        value: v.value,
        label: v.label,
        active,
        slug: active ? product.slug : best?.slug ?? null,
        price: target?.price,
        stockStatus: target?.stockStatus,
      };
    }),
  }));
}

/** "Vending Machine · Manual · 50 Pads" — the exact option, saved with quotes/orders. Empty options are skipped. */
export function variantLabel(product: Member, family: FamilyDTO | undefined): string | null {
  if (!family) return null;
  const parts = family.options.map((o) => o.values.find((v) => v.value === product.variantOptions?.[o.key])?.label).filter(Boolean);
  return parts.length ? [family.name, ...parts].join(" · ") : null;
}

/** Spec text for tiles/chips: the unit is appended only to bare numbers ("1000" → "1000 W"), never repeated when the value already carries it ("10–12 kg"). */
export function specText(r: { value: string; unit?: string }): string {
  return /[a-z]/i.test(r.value) ? r.value : [r.value, r.unit].filter(Boolean).join(" ");
}
