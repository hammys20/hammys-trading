import Stripe from "stripe";
import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/data";

// ✅ Don't force a fake apiVersion — Stripe will use a valid default
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const client = generateClient({ authMode: "apiKey" }) as any;

export async function POST(req: Request) {
  try {
    const { itemId } = await req.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      "http://localhost:3000";

    // Pull item from Amplify Data
    const res = await client.models.InventoryItem.get({ id: itemId });

    const item = res?.data;
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const price = Number(item.price ?? 0);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Item has no valid price" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(price * 100),
            product_data: {
              name: String(item.name ?? "Item"),
              description: item.description ? String(item.description) : undefined,
              images: item.image ? [String(item.image)] : [],
            },
          },
          quantity: 1,
        },
      ],
      // ✅ match your routes
      success_url: `${siteUrl}/checkout/success`,
      cancel_url: `${siteUrl}/inventory`,
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
