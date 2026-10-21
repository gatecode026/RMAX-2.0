const inr = new Intl.NumberFormat("en-IN");

/** 4500 → "₹4,500" */
export function formatINR(amount: number): string {
  return `₹${inr.format(amount)}`;
}

/** Date → "08 Oct 2026" (UTC so server and client agree) */
export function formatDate(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = d.toLocaleString("en-GB", { month: "short", timeZone: "UTC" });
  return `${day} ${month} ${d.getUTCFullYear()}`;
}

export function pluralItems(n: number): string {
  return `${n} ${n === 1 ? "item" : "items"}`;
}
