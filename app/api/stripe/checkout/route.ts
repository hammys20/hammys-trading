// app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/data";
import { configureAmplify } from "@/lib/amplify-server";
import { createStripe } from "@/lib/stripe";

// Configure Amplify for server usage BEFORE generateClient()
configureAmplify();

const client = generateClient({ authMode: "apiKey" as const }) as any;
const PENDING_WINDOW_MS = 2 * 60 * 1000;

export const runtime = "nodejs";

function getPendingUntilMs(value: unknown): number | null {
  if (!value) return null;
  const parsed = new Date(String(value)).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(req: Request) {
  try {
    const { itemId } = (await req.json()) as { itemId?: string };

    if (!itemId) {
      return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
    }

    const site = process.env.NEXT_PUBLIC_SITE_URL;
    const stripeSecretKey =
      process.env.STRIPE_SECRET_KEY ??
      process.env.AMPLIFY_STRIPE_SECRET_KEY ??
      process.env.AWS_STRIPE_SECRET_KEY ??
      process.env.STRIPE_SECRET;
    if (!stripeSecretKey) {
      console.error("Stripe env debug", {
        stripeSecretKeyPresent: false,
        nextPublicSiteUrlPresent: !!process.env.NEXT_PUBLIC_SITE_URL,
        stripeEnvKeys: Object.keys(process.env).filter((k) =>
          k.toLowerCase().includes("stripe")
        ),
      });
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY env var" },
        { status: 500 }
      );
    }
    if (!site) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_SITE_URL env var" },
        { status: 500 }
      );
    }

    // Create Stripe client only after we've validated env vars.
    const stripe = createStripe(stripeSecretKey);

    // Fetch item server-side (prevents client spoofing price)
    const res = await client.models.InventoryItem.get({ id: itemId });
    const item = res?.data;

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Optional: enforce only available items can be purchased
    const status = (item.status ?? "available").toString().toLowerCase();
    if (status === "pending") {
      const pendingUntilMs = getPendingUntilMs((item as any).pendingUntil);
      if (pendingUntilMs && pendingUntilMs > Date.now()) {
        return NextResponse.json(
          { error: "Item is pending (reserved)" },
          { status: 400 }
        );
      }
      await client.models.InventoryItem.update({
        id: itemId,
        status: "available",
        pendingUntil: null,
      });
    } else if (status !== "available") {
      return NextResponse.json(
        { error: `Item is not available (status: ${status})` },
        { status: 400 }
      );
    }

    const price = typeof item.price === "number" ? item.price : Number(item.price);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: "Item has no valid price" },
        { status: 400 }
      );
    }

    // Stripe expects cents
    const unit_amount = Math.round(price * 100);

    const primaryImage =
      (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null) ??
      item.image ??
      undefined;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      metadata: {
        itemId,
      },
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount,
            product_data: {
              name: item.name ?? "Item",
              metadata: {
                itemId,
              },
              images: primaryImage ? [primaryImage] : undefined,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${site}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/item/${encodeURIComponent(itemId)}`,
    });

    try {
      const pendingUntil = new Date(Date.now() + PENDING_WINDOW_MS).toISOString();
      await client.models.InventoryItem.update({
        id: itemId,
        status: "pending",
        pendingUntil,
      });
    } catch (err) {
      console.error("Failed to set pending status:", err);
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Checkout failed" },
      { status: 500 }
    );
  }
}
