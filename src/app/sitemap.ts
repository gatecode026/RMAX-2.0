import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

const ROUTES = [
  "/",
  "/compare-models",
  "/institutional-quote",
  "/help",
  "/cart",
  "/checkout",
  "/login",
  "/create-account",
  "/forgot-password",
  "/contact-us",
  "/about-us",
  "/shipping-exchanges-warranty",
  "/privacy-policy",
  "/terms-and-conditions",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" || path === "/compare-models" ? 1 : 0.6,
  }));
}
