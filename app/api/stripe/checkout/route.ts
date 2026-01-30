// app/api/stripe/checkout/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/data";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // ✅ Don’t pin to a made-up version; Stripe will use your account’s default API version
  apiVersion: "2024-06-20",
} as any);

// Amplify Data client (public read)
const client = generateClient({ authMode: "apiKey" }) as any;

export async function POST(req: Request) {
  try {
    const { itemId } = await req.json();

    const { data: item, errors } = await client.models.InventoryItem.get({ id: itemId });

    if (errors?.length || !item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const price = Number(item.price ?? 0);
    if (!price || price <= 0) {
      return NextResponse.json({ error: "Item has no valid price" }, { status: 400 });
    }

    if ((item.status ?? "available") !== "available") {
      return NextResponse.json({ error: "Item is not available" }, { status: 400 });
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
    if (!siteUrl) {
      return NextResponse.json({ error: "NEXT_PUBLIC_SITE_URL is missing" }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(price * 100),
            product_data: {
              name: item.name,
              description: item.description ?? "",
              images: item.image ? [item.image] : [],
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/inventory`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: err?.message ?? "Checkout failed" }, { status: 500 });
  }
}
