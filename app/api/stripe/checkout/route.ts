import Stripe from "stripe";
import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/data";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // ✅ safest: use account default version
  apiVersion: null as any,
});

// Amplify Data (TS-safe)
const client = generateClient({ authMode: "apiKey" }) as any;

export async function POST(req: Request) {
  try {
    const { itemId } = await req.json();

    const { data: item, errors } = await client.models.InventoryItem.get({ id: itemId });

    if (errors?.length || !item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if ((item.status ?? "available") !== "available") {
      return NextResponse.json({ error: "Item is not available" }, { status: 400 });
    }

    const site = process.env.NEXT_PUBLIC_SITE_URL!;
    const unitAmount = Math.max(0, Math.round((item.price ?? 0) * 100));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: unitAmount,
            product_data: {
              name: item.name,
              description: item.description ?? "",
              images: item.image ? [item.image] : [],
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${site}/checkout/success`,
      cancel_url: `${site}/inventory`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: err?.message ?? "Checkout failed" }, { status: 500 });
  }
}
