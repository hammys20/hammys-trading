// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import AmplifyProvider from "./amplify-provider";
import HeaderClient from "@/components/HeaderClient";

export const metadata: Metadata = {
  title: "Hammy’s Trading",
  description: "Premium Pokémon singles & slabs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AmplifyProvider>
          <HeaderClient />

          {/* ✅ Global page container so you don’t hit the edges */}
          <main
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "24px 16px",
              minHeight: "calc(100vh - 72px)",
            }}
          >
            {children}
          </main>
        </AmplifyProvider>
      </body>
    </html>
  );
}
