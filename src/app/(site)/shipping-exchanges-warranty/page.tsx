import type { Metadata } from "next";
import { PolicyView } from "@/components/sections/PolicyView";

export const metadata: Metadata = {
  title: "Shipping, Exchanges & Warranty",
  description: "Free shipping. Exchange only. 1 year warranty. Read the supplied policy essentials and the proposed support process.",
};

export default function ShippingExchangesWarrantyPage() {
  return <PolicyView slug="shipping-exchanges-warranty" breadcrumb="Shipping, Exchanges & Warranty" />;
}
