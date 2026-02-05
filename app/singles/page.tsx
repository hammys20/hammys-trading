import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Card Singles",
  description:
    "Shop trading card singles from Hammy’s Trading, including Pokemon and sports cards across eras and price points.",
  keywords: [
    "card singles",
    "pokemon singles",
    "sports card singles",
    "raw cards",
    "trading cards",
    "Hammy’s Trading",
  ],
};

export default function SinglesPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ margin: 0 }}>Singles</h1>
      <p style={{ opacity: 0.85 }}>Browse singles here.</p>
    </main>
  );
}
