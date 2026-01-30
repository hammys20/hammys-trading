import Stripe from "stripe";
import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/data";

// Force Node runtime (Stripe requires Node APIs)
export const runtime = "nodejs";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY env var");
}

// ✅ Do NOT set a fake apiVersion
const stripe = new Stripe(stripeSecretKey);

const client = generateClient({ authMode: "apiKey" }) as any;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const itemId = body?.itemId as string | undefined;

    if (!itemId) {
      return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
    }

    const { data: item, errors } = await client.models.InventoryItem.get({ id: itemId });

    if (errors?.length || !item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const price = Number(item.price ?? 0);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Item price is missing/invalid" }, { status: 400 });
    }

    // Use deployed site URL if present, otherwise derive from request
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      new URL(req.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(price * 100),
            product_data: {
              name: String(item.name ?? "Item"),
              description: item.description ? String(item.description) : undefined,
              images:
                typeof item.image === "string" && item.image.startsWith("http")
                  ? [item.image]
                  : [],
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/checkout/success`,
      cancel_url: `${origin}/inventory`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Checkout failed" },
      { status: 500 }
    );
  }
}
