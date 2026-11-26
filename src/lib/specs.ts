import type { IProductSpecs } from "@/models/Product";

/** "1000 W · 9kg · 200–250/day · 4–6 at once" — the one-line spec summary used in cart and orders. */
export function buildSpecLine(specs: Pick<IProductSpecs, "power" | "weight" | "dailyCapacity" | "batchCapacity">): string {
  return cleanSpecLine([specs.power, specs.weight, specs.dailyCapacity, specs.batchCapacity].join(" · "));
}

/** Drops "Not specified" / empty parts — also applied when showing spec lines saved on older orders. */
export function cleanSpecLine(line: string): string {
  return line.split(" · ").map((p) => p.trim()).filter((p) => p && p !== "Not specified").join(" · ");
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
