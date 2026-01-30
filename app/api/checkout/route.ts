import Stripe from "stripe";
import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/data";

export const runtime = "nodejs"; // important for Stripe on some deploys

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // ✅ Do NOT set an invalid apiVersion. Let Stripe default, or set a real one you know works.
  // apiVersion: "2024-06-20",
});

const client = generateClient({ authMode: "apiKey" }) as any;

export async function POST(req: Request) {
  try {
    const { itemId } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
    }

    const { data: item, errors } = await client.models.InventoryItem.get({ id: itemId });

    if (errors?.length || !item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const price = typeof item.price === "number" ? item.price : 0;
    if (!price || price <= 0) {
      return NextResponse.json({ error: "Item has no valid price" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      return NextResponse.json({ error: "Missing NEXT_PUBLIC_SITE_URL" }, { status: 500 });
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
      success_url: `${siteUrl}/checkout/success`,
      cancel_url: `${siteUrl}/inventory`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: err?.message ?? "Checkout failed" }, { status: 500 });
  }
}
