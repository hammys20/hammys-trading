// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Chivo_Mono } from "next/font/google";
import AmplifyProvider from "./amplify-provider";
import HeaderClient from "@/components/HeaderClient";
import { CartProvider } from "@/components/CartProvider";
import Script from "next/script";

const chivoMono = Chivo_Mono({
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : undefined;
const socialProfiles = [
  process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
  process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK,
  process.env.NEXT_PUBLIC_SOCIAL_TIKTOK,
  process.env.NEXT_PUBLIC_SOCIAL_X,
  process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE,
  "https://www.whatnot.com/user/hammys_trading",
].filter(Boolean) as string[];

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Hammy’s Trading",
    template: "%s | Hammy’s Trading",
  },
  description:
    "Premium trading card singles, slabs, and live breaks. Trusted, curated, and fairly priced for collectors.",
  applicationName: "Hammy’s Trading",
  keywords: [
    "trading cards",
    "pokemon cards",
    "sports cards",
    "card singles",
    "graded cards",
    "slabs",
    "live breaks",
    "collectibles",
    "Hammy’s Trading",
  ],
  openGraph: {
    type: "website",
    siteName: "Hammy’s Trading",
    title: "Hammy’s Trading",
    description:
      "Premium trading card singles, slabs, and live breaks. Trusted, curated, and fairly priced for collectors.",
    locale: "en_US",
    url: siteUrl,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Hammy’s Trading",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hammy’s Trading",
    description:
      "Premium trading card singles, slabs, and live breaks. Trusted, curated, and fairly priced for collectors.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/hammys-logo.png" }],
    apple: [{ url: "/hammys-logo.png" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Store", "Organization"],
    name: "Hammy’s Trading",
    url: siteUrl?.toString(),
    image: siteUrl ? new URL("/hero-cards.png", siteUrl).toString() : undefined,
    logo: siteUrl ? new URL("/hammys-logo.png", siteUrl).toString() : undefined,
    description:
      "Premium trading card singles, slabs, and live breaks. Trusted, curated, and fairly priced for collectors.",
    sameAs: socialProfiles.length > 0 ? socialProfiles : undefined,
  };

  return (
    <html lang="en">
      <body className={chivoMono.className}>
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AmplifyProvider>
          <CartProvider>
            <HeaderClient />

            {/* ✅ Global page container so you don’t hit the edges */}
            <main
              className="siteMain"
              style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: "24px 16px",
                minHeight: "calc(100vh - 72px)",
              }}
            >
              <div className="container">{children}</div>
            </main>
            <footer
              style={{
                borderTop: "1px solid rgba(255,255,255,0.08)",
                padding: "18px 16px 26px",
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                <img
                  src="/payment-secure.svg"
                  alt="Payment secure"
                  style={{ height: 36, width: "auto" }}
                />
                <img
                  src="/stripe-logo.svg"
                  alt="Stripe"
                  style={{ height: 36, width: "auto" }}
                />
              </div>
              © 2026 Hammy&apos;s Trading. All rights reserved.
            </footer>
          </CartProvider>
        </AmplifyProvider>
      </body>
    </html>
  );
}
