export default function PowerPacksPage() {
  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px 48px" }}>
      <div style={{ display: "grid", gap: 14, marginBottom: 22 }}>
        <h1 style={{ margin: 0 }}>PowerPacks</h1>
        <p style={{ margin: 0, opacity: 0.85, lineHeight: 1.6 }}>
          GameStop PowerPacks are digital packs that reveal a real PSA-graded card. You
          can ship the card home, take an instant buyback, or keep it secured in your PSA
          Vault account and chase the next big hit.
        </p>
        <p style={{ margin: 0, opacity: 0.8, lineHeight: 1.6 }}>
          Choose your card category and level, rip it digitally, and decide whether to
          keep, sell, or ship your card.
        </p>
        <a
          href="https://powerpacks.gamestop.com/"
          target="_blank"
          rel="noreferrer"
          className="btn btnPrimary"
          style={{ width: "fit-content" }}
        >
          Visit GameStop PowerPacks
        </a>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <h2 style={{ margin: 0 }}>PowerPacks visuals</h2>
        <p style={{ margin: 0, opacity: 0.8 }}>
          Visuals pulled directly from the PowerPacks site.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          <img
            src="https://powerpacks.gamestop.com/_next/image?q=75&url=%2Fassets%2Fcanvas%2Fscene%2Fimages%2FArcade-Loop_STATIC.jpg&w=3840"
            alt="PowerPacks arcade scene"
            style={{
              width: "100%",
              height: 220,
              objectFit: "cover",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          />
          <img
            src="https://powerpacks.gamestop.com/_next/image?q=75&url=%2Fassets%2Fcanvas%2Fscene%2Fimages%2Fselection-loop.jpg&w=3840"
            alt="PowerPacks selection scene"
            style={{
              width: "100%",
              height: 220,
              objectFit: "cover",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          />
        </div>
      </div>
    </main>
  );
}
