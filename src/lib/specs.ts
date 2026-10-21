import type { IProductSpecs } from "@/models/Product";

/** "1000 W · 9kg · 200–250/day · 4–6 at once" — the one-line spec summary used in cart and orders. */
export function buildSpecLine(specs: Pick<IProductSpecs, "power" | "weight" | "dailyCapacity" | "batchCapacity">): string {
  const parts = [specs.power, specs.weight, specs.dailyCapacity];
  if (specs.batchCapacity && specs.batchCapacity !== "Not specified") parts.push(specs.batchCapacity);
  return parts.join(" · ");
}

export const SPEC_ROWS = [
  { key: "dailyCapacity", label: "Daily capacity" },
  { key: "batchCapacity", label: "Batch capacity" },
  { key: "power", label: "Power" },
  { key: "weight", label: "Weight" },
  { key: "colours", label: "Colours" },
  { key: "cycleDuration", label: "Cycle duration" },
  { key: "chamber", label: "Chamber" },
  { key: "maintenance", label: "Maintenance" },
  { key: "warranty", label: "Warranty" },
  { key: "delivery", label: "Delivery" },
] as const satisfies ReadonlyArray<{ key: keyof IProductSpecs; label: string }>;
