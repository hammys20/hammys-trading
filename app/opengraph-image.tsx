import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadLogo() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(new URL("/hammys-logo.png", siteUrl));
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image() {
  const logo = await loadLogo();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
          background:
            "radial-gradient(1200px 600px at 10% -10%, #ffe9c5 0%, rgba(255,233,197,0) 60%), linear-gradient(135deg, #0e0f12 0%, #1c1f26 60%, #13151a 100%)",
          color: "white",
          letterSpacing: "-0.02em",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          {logo ? (
            <img
              src={logo as unknown as string}
              width={64}
              height={64}
              style={{ borderRadius: 12 }}
              alt=""
            />
          ) : null}
          Hammy’s Trading
        </div>

        <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.05 }}>
          Premium trading cards
          <br />
          Trusted. Curated. Fair.
        </div>

        <div style={{ fontSize: 24, opacity: 0.85 }}>
          Singles · Slabs · Live breaks
        </div>
      </div>
    ),
    size
  );
}
