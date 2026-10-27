import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login | RMAX Solutions",
  description: "Secure administrative login portal for RMAX institutional hygiene management.",
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
