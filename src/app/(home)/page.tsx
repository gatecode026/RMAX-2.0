import type { Metadata } from "next";
import { BestSellers } from "@/components/home/BestSellers";
import { HomeHero } from "@/components/home/HomeHero";
import { Testimonials } from "@/components/home/Testimonials";
import { getHomeStats, getProducts, getReviewSummary, getTestimonials } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Smart hygiene. Built for your institutions.",
  description:
    "RMAX Solutions is an Indian manufacturer and OEM supplier of sanitary waste disposal, pad vending systems and smart service hardware.",
};

export default async function HomePage() {
  const [products, stats, reviews, testimonials] = await Promise.all([
    getProducts(),
    getHomeStats(),
    getReviewSummary(),
    getTestimonials(),
  ]);
  // The hero card features the highest-capacity model (Pro-Max).
  const featured = products.find((p) => p.slug === "pro-max") ?? products[products.length - 1];

  return (
    <>
      <HomeHero featured={featured} stats={stats} />
      <BestSellers products={products} />
      <Testimonials items={testimonials} reviews={reviews} />
    </>
  );
}
