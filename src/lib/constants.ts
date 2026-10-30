export const SITE_NAME = "RMAX Solutions";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const FOOTER_SUPPORT = [
  { label: "Help & FAQs", href: "/help" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "My Account", href: "/account" },
] as const;

export const FOOTER_POLICIES = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Shipping, Exchanges & Warranty", href: "/shipping-exchanges-warranty" },
] as const;

export const FOOTER_TAGLINE = "Advanced hygiene devices and products.";
/** Footer copy on the Home design. */
export const HOME_FOOTER_TAGLINE = "Indian manufacturer & OEM supplier.";
export const HOME_FOOTER_STRIP = ["RMAX Solutions", "Smart hygiene & automation", "B2B and institutional supply"] as const;

export const FOOTER_STRIP = [
  "RMAX Solutions",
  "HYGIENE TECHNOLOGY",
  "Free shipping",
  "Exchange only",
  "In-house manufacturing",
] as const;

/** Indian states and union territories for the checkout "State" select. */
export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
] as const;

export const LAST_ORDER_COOKIE = "rmax_last_order";
