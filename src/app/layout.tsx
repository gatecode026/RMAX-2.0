import type { Metadata, Viewport } from "next";
import { Manrope, Montserrat, Plus_Jakarta_Sans } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
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
import { SpeedInsights } from "@vercel/speed-insights/next";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf9f5" },
    { media: "(prefers-color-scheme: dark)", color: "#fbf9f5" },
  ],
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${montserrat.variable} ${manrope.variable} ${jakarta.variable}`}
      style={{ colorScheme: "light" }}
    >
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </head>
      <body className="flex min-h-dvh flex-col" style={{ colorScheme: "light" }}>
        <GlobalModalScrollLock />
        <ToastProvider>
          <AuthModalProvider>
            {children}
            <CustomerAuthModal />
          </AuthModalProvider>
        </ToastProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
