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
            "radial-gradient(1200px 600px at 90% -10%, #ffd39f 0%, rgba(255,211,159,0) 60%), linear-gradient(135deg, #101014 0%, #1d1f2a 60%, #12141a 100%)",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 26,
            fontWeight: 700,
          }}
        >
          {logo ? (
            <img
              src={logo as unknown as string}
              width={60}
              height={60}
              style={{ borderRadius: 12 }}
              alt=""
            />
          ) : null}
          Hammy’s Trading
        </div>

        <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.05 }}>
          Inventory
        </div>

        <div style={{ fontSize: 24, opacity: 0.85 }}>
          Pokemon · Sports · Graded · Sealed
        </div>
      </div>
    ),
    size
  );
}
