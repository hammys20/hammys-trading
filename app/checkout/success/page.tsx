// app/checkout/success/page.tsx
import Link from "next/link";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>
        ✅ Payment successful
      </h1>

      <p style={{ opacity: 0.9, marginBottom: 14 }}>
        Thanks! Your checkout completed.
      </p>

      {sp.session_id ? (
        <div
          style={{
            padding: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            background: "rgba(255,255,255,0.03)",
            marginBottom: 16,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 12,
            overflowX: "auto",
          }}
        >
          session_id: {sp.session_id}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link
          href="/inventory"
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          Back to Inventory
        </Link>

        <Link
          href="/"
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          Home
        </Link>
      </div>
    </div>
  );
}
