import Stripe from "stripe";
import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/data";
import { configureAmplify } from "@/lib/amplify-server";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

// Let Stripe SDK choose its default API version.
// (Setting a bogus version = 500)
const stripe = new Stripe(stripeSecretKey ?? "", {});

configureAmplify();

const client = generateClient({ authMode: "apiKey" }) as any;

export async function POST(req: Request) {
  try {
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY env var" },
        { status: 500 }
      );
    }
    if (!siteUrl) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_SITE_URL env var" },
        { status: 500 }
      );
    }

    const { itemId } = await req.json();

    const { data: item, errors } = await client.models.InventoryItem.get({ id: itemId });

    if (errors?.length || !item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const price = Number(item.price ?? 0);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Invalid item price" }, { status: 400 });
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
                images: item.image ? [String(item.image)] : undefined,
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
    return NextResponse.json(
      { error: err?.message ?? "Checkout failed" },
      { status: 500 }
    );
  }
}
