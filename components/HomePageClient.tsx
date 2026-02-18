"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import WhatnotStatus from "@/app/components/WhatnotStatus";
import ScrollLineObserver from "@/components/ScrollLineObserver";

const REVIEWS = [
  {
    quote:
      "Everything arrived perfectly and was packaged great. Would definitely recommend and I will be revisiting for more goodies. Absolutely great streamer with a great personality. Whole thing was just a great time. Did I mention custom drawings and custom psa tagging? Great guy and you can’t go wrong choosing to buy from him.",
    name: "Jordan T.",
    source: "Whatnot Buyer",
  },
  {
    quote:
      "Fair prices, easy communication, and no surprises. One of the smoothest card deals I have made.",
    name: "Melissa R.",
    source: "Repeat Customer",
  },
  {
    quote:
      "My slab game super quick withing like 4 or 5 days so im very impressed. I would purchase from him again, thank you for the sylveon gem mint 10 and huge shout out to lil hammy.",
    name: "Chris A.",
    source: "Live Break Participant",
  },
  {
    quote:
      "Bought a slab that was even better in person. Quick turnaround and professional service.",
    name: "Devon K.",
    source: "Whatnot Customer",
  },
];

export default function HomePageClient() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [activeReview, setActiveReview] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(hover: none) and (pointer: coarse)");
    const update = () => setIsCoarsePointer(media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveReview((prev) => (prev + 1) % REVIEWS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const previousReview = () => {
    setActiveReview((prev) => (prev === 0 ? REVIEWS.length - 1 : prev - 1));
  };

  const nextReview = () => {
    setActiveReview((prev) => (prev + 1) % REVIEWS.length);
  };

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
          src="/hero-cards.jpg"
          alt="Premium Trading Cards"
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
              Premium Trading Cards.
              <br />
              <span style={{ color: "var(--accent)" }}>
                Trusted. Curated. Fair.
              </span>
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
              Hammy’s Trading specializes in high-quality trading card singles,
              slabs, and live breaks — built on transparency, collector trust, and
              real market knowledge.
            </p>

            <div
              data-scroll-line
              className="scrollLine"
              style={{ display: "flex", gap: 14, flexWrap: "wrap" }}
            >
              <Link href="/inventory" className="btn btnPrimary">
                View Inventory
              </Link>

              <Link href="/inventory?category=pokemon" className="btn">
                Browse Pokemon Cards
              </Link>

              <Link href="/inventory?category=sports" className="btn">
                Browse Sports Cards
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ marginBottom: 70 }}>
        <h2 data-scroll-line className="scrollLine" style={{ marginBottom: 18 }}>
          What We Offer
        </h2>

        <div
          className="categoryGrid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 18,
          }}
        >
          {[
            {
              title: "Singles",
              img: "/category-singles.jpg",
              desc: "Raw cards across eras, conditions, and price points.",
            },
            {
              title: "Slabs",
              img: "/category-slabs.jpg",
              desc: "Graded cards from PSA, BGS, and CGC.",
            },
            {
              title: "Live Breaks",
              img: "/category-breaks.jpg",
              desc: "Community-driven live openings with full transparency.",
            },
          ].map((c, idx) => (
            <div
              key={c.title}
              data-scroll-line
              className={`scrollLine categoryCard ${
                !isCoarsePointer && activeCategory === c.title
                  ? "categoryActive"
                  : ""
              }`}
              style={{ "--delay": `${idx * 70}ms` } as React.CSSProperties}
              onClick={
                isCoarsePointer
                  ? undefined
                  : () =>
                      setActiveCategory((prev) =>
                        prev === c.title ? null : c.title
                      )
              }
            >
              <Image
                src={c.img}
                alt={c.title}
                width={560}
                height={360}
                className="categoryImage"
              />
              <div className="categoryFade" />
              <div className="categoryText">
                <div style={{ fontWeight: 900, fontSize: 18 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                  {c.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section
        data-scroll-line
        className="scrollLine trustGrid"
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

      {/* REVIEWS */}
      <section
        data-scroll-line
        className="card scrollLine reviewsSection"
        style={{ padding: 28, marginBottom: 70 }}
      >
        <div className="reviewsHeader">
          <div>
            <div className="reviewsEyebrow">CUSTOMER REVIEWS</div>
            <h2 style={{ margin: "6px 0 0" }}>What collectors are saying</h2>
          </div>

          <div className="reviewsButtons">
            <button
              type="button"
              className="reviewsNavButton"
              onClick={previousReview}
              aria-label="Previous review"
            >
              ←
            </button>
            <button
              type="button"
              className="reviewsNavButton"
              onClick={nextReview}
              aria-label="Next review"
            >
              →
            </button>
          </div>
        </div>

        <div className="reviewsStage">
          {REVIEWS.map((review, idx) => (
            <article
              key={`${review.name}-${idx}`}
              className={`reviewSlide ${idx === activeReview ? "reviewSlideActive" : ""}`}
              aria-hidden={idx !== activeReview}
            >
              <p className="reviewQuote">"{review.quote}"</p>
              <div className="reviewMeta">
                <span className="reviewName">{review.name}</span>
                <span className="reviewSource">{review.source}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="reviewDots" role="tablist" aria-label="Review slideshow">
          {REVIEWS.map((review, idx) => (
            <button
              key={`${review.name}-dot`}
              type="button"
              className={`reviewDot ${idx === activeReview ? "reviewDotActive" : ""}`}
              onClick={() => setActiveReview(idx)}
              aria-label={`Go to review ${idx + 1}`}
              aria-selected={idx === activeReview}
              role="tab"
            />
          ))}
        </div>
      </section>

      {/* WHATNOT (LIVE NOW + COUNTDOWN) */}
      <section
        data-scroll-line
        className="card scrollLine whatnotSection"
        style={{
          padding: 28,
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 24,
          alignItems: "center",
          marginBottom: 60,
        }}
      >
        <div className="whatnotContent">
          <div className="whatnotText">
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

            <h2 style={{ marginTop: 0, marginBottom: 10 }}>
              Join us live on Whatnot
            </h2>

            <p style={{ color: "var(--muted)", maxWidth: 520 }}>
              Real-time pulls, community auctions, and transparent breaks. Follow
              the channel for stream alerts and upcoming shows.
            </p>
          </div>

          <div className="whatnotActions" style={{ marginTop: 18 }}>
            <WhatnotStatus />
          </div>
        </div>

        <div className="whatnotPreview">
          <img
            src="/whatnot-preview.jpg"
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
        <h2 style={{ marginBottom: 10 }}>
          Built for collectors who care about quality.
        </h2>
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
