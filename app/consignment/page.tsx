export default function ConsignmentPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ display: "grid", gap: 18 }}>
        <div
          style={{
            width: "100%",
            height: "clamp(260px, 38vw, 520px)",
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.12)",
            backgroundImage:
              "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0.25) 65%, rgba(0,0,0,0.85) 100%), url('/consignment.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-label="Consignment"
        />
        <div>
          <h1 style={{ margin: 0 }}>Consignment</h1>
          <p style={{ opacity: 0.85, marginTop: 10, lineHeight: 1.6 }}>
            We offer trusted consignment opportunities for collectors who want more
            exposure without the hassle. Get your cards in front of serious buyers with a
            low fee, safe handling, and transparent communication every step of the way.
          </p>
        </div>

        <div
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 16,
            padding: 16,
            display: "grid",
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 800 }}>Contact</div>
          <div>
            Email:{" "}
            <a href="mailto:hammys.trading@gmail.com">hammys.trading@gmail.com</a>
          </div>
          <div>
            Phone:{" "}
            <a href="tel:+13013730320">1-301-373-0320</a> (Call or Text)
          </div>
        </div>
      </div>
    </main>
  );
}
