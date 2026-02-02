import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/data";
import { configureAmplify } from "@/lib/amplify-server";
import { createStripe } from "@/lib/stripe";

configureAmplify();

const client = generateClient({ authMode: "apiKey" }) as any;

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

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

    const stripe = createStripe(stripeSecretKey);
    const { itemId } = await req.json();

    const { data: item, errors } = await client.models.InventoryItem.get({ id: itemId });

    if (errors?.length || !item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const price = Number(item.price ?? 0);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Invalid item price" }, { status: 400 });
    }

    const primaryImage =
      (Array.isArray((item as any)?.images) && (item as any).images.length > 0
        ? (item as any).images[0]
        : null) ??
      (item as any)?.image ??
      undefined;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(price * 100),
              product_data: {
                name: String(item.name ?? "Item"),
                images: primaryImage ? [String(primaryImage)] : undefined,
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
