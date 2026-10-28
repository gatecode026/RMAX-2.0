import type { Metadata, Viewport } from "next";
import { Manrope, Montserrat, Plus_Jakarta_Sans } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["800"],
  display: "swap",
});

/** Headline face used on the Home page design. */
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Advanced hygiene devices and products`, template: `%s | ${SITE_NAME}` },
  description: "Sanitary napkin incinerators — Basic, Pro and Pro-Max. Free shipping, exchange only, 1 year warranty.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: "Advanced hygiene devices and products.",
    images: [{ url: "/images/logo.png", width: 476, height: 84, alt: SITE_NAME }],
  },
};

import { ToastProvider } from "@/components/ui/Toast";
import { AuthModalProvider } from "@/context/AuthModalContext";
import { CustomerAuthModal } from "@/components/auth/CustomerAuthModal";
import { GlobalModalScrollLock } from "@/components/ui/GlobalModalScrollLock";

export const viewport: Viewport = { themeColor: "#fbf9f5" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${manrope.variable} ${jakarta.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <GlobalModalScrollLock />
        <ToastProvider>
          <AuthModalProvider>
            {children}
            <CustomerAuthModal />
          </AuthModalProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
