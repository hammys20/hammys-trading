// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Chivo_Mono } from "next/font/google";
import AmplifyProvider from "./amplify-provider";
import HeaderClient from "@/components/HeaderClient";
import { CartProvider } from "@/components/CartProvider";

const chivoMono = Chivo_Mono({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hammy’s Trading",
  description: "Premium Pokémon singles & slabs",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={chivoMono.className}>
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
