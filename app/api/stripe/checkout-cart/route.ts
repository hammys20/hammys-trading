// app/api/stripe/checkout-cart/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { generateClient } from "aws-amplify/data";
import { configureAmplify } from "@/lib/amplify-server";

configureAmplify();

const client = generateClient({ authMode: "apiKey" as const }) as any;
const PENDING_WINDOW_MS = 2 * 60 * 1000;

function getPendingUntilMs(value: unknown): number | null {
  if (!value) return null;
  const parsed = new Date(String(value)).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

type CartInput = { id: string; qty: number };

export async function POST(req: Request) {
  try {
    const { items } = (await req.json()) as { items?: CartInput[] };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
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

    const merged = new Map<string, number>();
    for (const it of items) {
      const qty = Number(it?.qty ?? 0);
      if (!it?.id || !Number.isFinite(qty) || qty <= 0) continue;
      merged.set(it.id, (merged.get(it.id) ?? 0) + qty);
    }

    if (merged.size === 0) {
      return NextResponse.json({ error: "Invalid cart items" }, { status: 400 });
    }

    const stripe = new Stripe(stripeSecretKey);

    const fetched = await Promise.all(
      Array.from(merged.entries()).map(async ([id, qty]) => {
        const res = await client.models.InventoryItem.get({ id });
        return { id, qty, item: res?.data ?? null };
      })
    );

    for (const f of fetched) {
      if (!f.item) {
        return NextResponse.json({ error: `Item not found: ${f.id}` }, { status: 404 });
      }
      const status = (f.item.status ?? "available").toString().toLowerCase();
      if (status === "pending") {
        const pendingUntilMs = getPendingUntilMs((f.item as any).pendingUntil);
        if (pendingUntilMs && pendingUntilMs > Date.now()) {
          return NextResponse.json(
            { error: `Item is pending (reserved): ${f.item.name ?? f.id}` },
            { status: 400 }
          );
        }
        await client.models.InventoryItem.update(
          {
            id: f.id,
            status: "available",
            pendingUntil: null,
          },
          { authMode: "iam" as const }
        );
      } else if (status !== "available") {
        return NextResponse.json(
          { error: `Item not available: ${f.item.name ?? f.id}` },
          { status: 400 }
        );
      }
      const price = typeof f.item.price === "number" ? f.item.price : Number(f.item.price);
      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json(
          { error: `Invalid price for item: ${f.item.name ?? f.id}` },
          { status: 400 }
        );
      }
    }

    const line_items = fetched.map((f) => {
      const price = typeof f.item.price === "number" ? f.item.price : Number(f.item.price);
      return {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(price * 100),
          product_data: {
            name: f.item.name ?? "Item",
            metadata: {
              itemId: f.id,
            },
          },
        },
        quantity: f.qty,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      metadata: {
        itemIds: JSON.stringify(Array.from(merged.keys())),
      },
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      line_items,
      success_url: `${site}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/cart`,
    });

    try {
      const pendingUntil = new Date(Date.now() + PENDING_WINDOW_MS).toISOString();
      await Promise.all(
        Array.from(merged.keys()).map((id) =>
          client.models.InventoryItem.update(
            {
              id,
              status: "pending",
              pendingUntil,
            },
            { authMode: "iam" as const }
          )
        )
      );
    } catch (err) {
      console.error("Failed to set pending status for cart:", err);
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe cart checkout error:", err);
    return NextResponse.json(
      { error: err?.message ?? "Checkout failed" },
      { status: 500 }
    );
  }
}
