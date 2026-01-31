// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import AmplifyProvider from "./amplify-provider";
import HeaderClient from "@/components/HeaderClient";
import { CartProvider } from "@/components/CartProvider";

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
      <body>
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
              © 2026 Hammy&apos;s Trading. All rights reserved.
            </footer>
          </CartProvider>
        </AmplifyProvider>
      </body>
    </html>
  );
}
