import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Graded Slabs",
  description:
    "Browse graded trading card slabs from Hammy’s Trading, including PSA, BGS, and CGC graded collectibles.",
  keywords: [
    "graded cards",
    "slabs",
    "PSA",
    "BGS",
    "CGC",
    "trading cards",
    "Hammy’s Trading",
  ],
};

export default function SlabsPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ margin: 0 }}>Slabs</h1>
      <p style={{ opacity: 0.85 }}>Browse slabs here.</p>
    </main>
  );
}
