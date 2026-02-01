import { headers } from "next/headers";
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import crypto from "crypto";
import { generateClient } from "aws-amplify/data";
import { configureAmplify } from "@/lib/amplify-server";

function getStripeSecretKey() {
  return (
    process.env.STRIPE_SECRET_KEY ??
    process.env.AMPLIFY_STRIPE_SECRET_KEY ??
    process.env.AWS_STRIPE_SECRET_KEY ??
    process.env.STRIPE_SECRET
  );
}

function getSesRegion() {
  return process.env.SES_REGION ?? process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION ?? "us-east-1";
}

function formatAddress(addr?: Stripe.Address | null) {
  if (!addr) return "Not provided";
  const parts = [
    addr.line1,
    addr.line2,
    addr.city,
    addr.state,
    addr.postal_code,
    addr.country,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "Not provided";
}

function generateConfirmationNumber() {
  return `HT-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const from = process.env.SES_FROM_EMAIL ?? "hammys.trading@gmail.com";
  const client = new SESClient({ region: getSesRegion() });

  await client.send(
    new SendEmailCommand({
      Source: from,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: {
          Text: { Data: text, Charset: "UTF-8" },
          Html: { Data: html, Charset: "UTF-8" },
        },
      },
    })
  );
}

configureAmplify();
const dataClient = generateClient({ authMode: "apiKey" as const }) as any;

async function markItemsSold(itemIds: string[]) {
  const unique = Array.from(new Set(itemIds.filter(Boolean)));
  await Promise.all(
    unique.map((id) =>
      dataClient.models.InventoryItem.update({
        id,
        status: "sold",
      })
    )
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const sig = (await headers()).get("stripe-signature");

    if (!sig) {
      return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
    }

    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Missing STRIPE_WEBHOOK_SECRET" },
        { status: 500 }
      );
    }

    const stripeSecretKey = getStripeSecretKey();
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY env var" },
        { status: 500 }
      );
    }

    // ✅ Must match your installed Stripe types
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2026-01-28.clover",
    });

    const event = stripe.webhooks.constructEvent(body, sig, secret);

    // ✅ TODO: handle events you care about (safe default for now)
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status !== "paid") break;

        const confirmation = generateConfirmationNumber();
        const buyerEmail = session.customer_details?.email ?? session.customer_email ?? "";
        const shipping = formatAddress(
          (session as any).shipping_details?.address ??
            session.customer_details?.address
        );
        const buyerName = session.customer_details?.name ?? "Customer";
        const itemIds: string[] = [];
        if (session.metadata?.itemId) itemIds.push(session.metadata.itemId);
        if (session.metadata?.itemIds) {
          try {
            const parsed = JSON.parse(session.metadata.itemIds);
            if (Array.isArray(parsed)) itemIds.push(...parsed.map(String));
          } catch {}
        }

        const subject = "Purchase Confirmation";
        const text = `Thank you for your purchase, ${buyerName}!\n\nConfirmation Number: ${confirmation}\n\nShipping Address: ${shipping}\n\nTracking and shipment information will be provided soon.`;
        const html = `<p>Thank you for your purchase, <strong>${buyerName}</strong>!</p><p><strong>Confirmation Number:</strong> ${confirmation}</p><p><strong>Shipping Address:</strong> ${shipping}</p><p>Tracking and shipment information will be provided soon.</p>`;

        if (itemIds.length > 0) {
          await markItemsSold(itemIds);
        }

        if (buyerEmail) {
          await sendEmail({ to: buyerEmail, subject, text, html });
        }

        await sendEmail({
          to: "hammys.trading@gmail.com",
          subject: `Purchase Confirmation - ${confirmation}`,
          text: `New purchase received.\n\nConfirmation Number: ${confirmation}\n\nBuyer Email: ${buyerEmail || "Not provided"}\nShipping Address: ${shipping}`,
          html: `<p><strong>New purchase received.</strong></p><p><strong>Confirmation Number:</strong> ${confirmation}</p><p><strong>Buyer Email:</strong> ${buyerEmail || "Not provided"}</p><p><strong>Shipping Address:</strong> ${shipping}</p>`,
        });
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    const message = err?.message ?? String(err);
    console.error("Webhook error:", message);
    return NextResponse.json(
      { error: "Webhook error", message },
      { status: 400 }
    );
  }
}
