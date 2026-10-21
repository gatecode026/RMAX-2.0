import type { IProductSpecs } from "@/models/Product";

const hyphen = (s: string) => s.replace(/–/g, "-");

/** "80–100/day" → "80-100 / day" (as written on the Home cards) */
export function perDay(range: string): string {
  return hyphen(range).replace(/\s*\/\s*day$/i, "") + " / day";
}

/** "80–100/day" → "80-100" */
export function capacityRange(range: string): string {
  return hyphen(range).replace(/\s*\/\s*day$/i, "");
}

/** The four spec chips on a Home card: power, weight, daily capacity, and batch size (or colours when no batch size is given). */
export function specChips(specs: Pick<IProductSpecs, "power" | "weight" | "dailyCapacity" | "batchCapacity" | "colours">): string[] {
  const fourth = specs.batchCapacity && specs.batchCapacity !== "Not specified" ? specs.batchCapacity : specs.colours;
  return [specs.power, specs.weight, perDay(specs.dailyCapacity), hyphen(fourth)];
}

/** "Dr. Ananya Rao" → "AR"; "Balbir Singhania" → "BS" */
export function initials(name: string): string {
  const words = name.replace(/\b(Dr|Mr|Mrs|Ms|Prof)\.?\s+/i, "").split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}
