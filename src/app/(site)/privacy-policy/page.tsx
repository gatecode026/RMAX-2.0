import type { Metadata } from "next";
import { PolicyView } from "@/components/sections/PolicyView";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "A readable draft of the website’s privacy notice, ready for review against the actual data practices before launch.",
};

export default function PrivacyPolicyPage() {
  return <PolicyView slug="privacy-policy" breadcrumb="Privacy Policy" />;
}
