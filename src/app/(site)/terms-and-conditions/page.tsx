import type { Metadata } from "next";
import { PolicyView } from "@/components/sections/PolicyView";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Proposed website terms covering products, orders and support. Business and legal review is required before publication.",
};

export default function TermsAndConditionsPage() {
  return <PolicyView slug="terms-and-conditions" breadcrumb="Terms & Conditions" />;
}
