import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";

export const metadata: Metadata = {
  title: "Premium Trading Cards",
  description:
    "Shop premium trading card singles, slabs, and live breaks from Hammy’s Trading. Trusted, curated, and fairly priced for collectors.",
};

export default function HomePage() {
  return <HomePageClient />;
}
