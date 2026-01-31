import Link from "next/link";
import Image from "next/image";
import WhatnotStatus from "./components/WhatnotStatus";
import ScrollLineObserver from "@/components/ScrollLineObserver";

export default function HomePage() {
  return (
    <div>
      <ScrollLineObserver />
      {/* HERO */}
      <section
        data-scroll-line
        className="scrollLine heroSection"
        style={{
          padding: "80px 0 60px",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 40,
          alignItems: "center",
        }}
      >
        <Image
          src="/hero-cards.png"
          alt="Premium Pokémon Cards"
          width={1200}
          height={700}
          priority
          className="heroImage"
        />
        <div className="heroInner">
          <div>
          <h1
            data-scroll-line
            className="scrollLine"
            style={{
              fontSize: 44,
              lineHeight: 1.1,
              letterSpacing: -0.5,
              marginBottom: 16,
            }}
          >
            Premium Pokémon Cards.
            <br />
            <span style={{ color: "var(--accent)" }}>Trusted. Curated. Fair.</span>
          </h1>

          <p
            data-scroll-line
            className="scrollLine"
            style={{
              fontSize: 18,
              color: "var(--muted)",
              maxWidth: 520,
              marginBottom: 28,
            }}
          >
            Hammy’s Trading specializes in high-quality Pokémon singles, slabs,
            and live breaks — built on transparency, collector trust, and real
            market knowledge.
          </p>

          <div
            data-scroll-line
            className="scrollLine"
            style={{ display: "flex", gap: 14 }}
          >
            <Link href="/inventory" className="btn btnPrimary">
              View Inventory
            </Link>

            <Link href="/inventory" className="btn">
              Browse All Cards
            </Link>
          </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section
        data-scroll-line
        className="scrollLine"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 18,
          marginBottom: 70,
        }}
      >
        {[
          {
            title: "Collector First",
            text: "Every card is described honestly with condition clearly stated. No surprises.",
          },
          {
            title: "Market-Driven Pricing",
            text: "Prices reflect real comps, not hype. Fair for buyers and sellers.",
          },
          {
            title: "Fast & Secure Shipping",
            text: "Cards ship quickly and safely — protected like they’re our own.",
          },
        ].map((f, idx) => (
          <div
            key={f.title}
            data-scroll-line
            className="card scrollLine"
            style={{ padding: 18, "--delay": `${idx * 60}ms` } as React.CSSProperties}
          >
            <div style={{ fontWeight: 900, marginBottom: 8 }}>{f.title}</div>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>{f.text}</div>
          </div>
        ))}
      </section>

      {/* CATEGORIES */}
      <section style={{ marginBottom: 70 }}>
        <h2 data-scroll-line className="scrollLine" style={{ marginBottom: 18 }}>
          What We Offer
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 18,
          }}
        >
          {[
            {
              title: "Singles",
              img: "/category-singles.png",
              desc: "Raw cards across eras, conditions, and price points.",
            },
            {
              title: "Slabs",
              img: "/category-slabs.png",
              desc: "Graded cards from PSA, BGS, and CGC.",
            },
            {
              title: "Live Breaks",
              img: "/category-breaks.png",
              desc: "Community-driven live openings with full transparency.",
            },
          ].map((c, idx) => (
            <div
              key={c.title}
              data-scroll-line
              className="card scrollLine imageCard"
              style={{ overflow: "hidden", "--delay": `${idx * 70}ms` } as React.CSSProperties}
            >
              <Image
                src={c.img}
                alt={c.title}
                width={400}
                height={260}
                style={{ width: "100%", height: "auto", objectFit: "cover" }}
              />
              <div className="imageCardBody" style={{ padding: 14 }}>
                <div style={{ fontWeight: 900 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                  {c.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHATNOT (LIVE NOW + COUNTDOWN) */}
      <section
        data-scroll-line
        className="card scrollLine"
        style={{
          padding: 28,
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 24,
          alignItems: "center",
          marginBottom: 60,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 0.6,
              color: "var(--accent)",
              marginBottom: 6,
            }}
          >
            LIVE BREAKS
          </div>

          <h2 style={{ marginTop: 0, marginBottom: 10 }}>Join us live on Whatnot</h2>

          <p style={{ color: "var(--muted)", maxWidth: 520 }}>
            Real-time pulls, community auctions, and transparent breaks. Follow the channel for stream
            alerts and upcoming shows.
          </p>

          <div style={{ marginTop: 18 }}>
            <WhatnotStatus />
          </div>
        </div>

        <div
          style={{
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid var(--border)",
            background: "var(--surface)",
          }}
        >
          <img
            src="/whatnot-preview.png"
            alt="Hammy’s Trading on Whatnot"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </section>

      {/* CTA */}
      <section
        data-scroll-line
        className="card scrollLine"
        style={{ padding: 30, textAlign: "center", marginBottom: 40 }}
      >
        <h2 style={{ marginBottom: 10 }}>Built for collectors who care about quality.</h2>
        <p style={{ color: "var(--muted)", marginBottom: 18 }}>
          Browse the inventory or join us live — no fluff, no games.
        </p>

        <Link href="/inventory" className="btn btnPrimary">
          Explore Inventory
        </Link>
      </section>
    </div>
  );
}
