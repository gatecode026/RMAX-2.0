/**
 * The GPS tracker is a standalone product customised per bank, so its bank type is a plain selector rather than a
 * product family. Every other option (Size, Operation, Capacity, Colour…) comes from the database: see lib/catalog.ts.
 */
export const GPS_SLUG = "gps-trackers";
export const GPS_BANKS = ["SBI", "BOB", "BOI", "BOM", "CBI", "PNB", "Others"];

/** Default bank for the GPS tracker; other products have no type. */
export function defaultVariantType(slug: string): string {
  return slug === GPS_SLUG ? GPS_BANKS[0] : "";
}

/** One-line note recording the GPS bank type on a quotation. Family options are stored server-side on the quote. */
export function describeVariant(slug: string, type: string): string {
  return slug === GPS_SLUG ? `Bank type: ${type || GPS_BANKS[0]}` : "";
}
