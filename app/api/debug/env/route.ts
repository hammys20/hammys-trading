import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    stripeSecretKeyPresent: Boolean(process.env.STRIPE_SECRET_KEY),
    nextPublicSiteUrlPresent: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    stripeEnvKeys: Object.keys(process.env).filter((k) => k.includes("STRIPE")),
    stripeFallbacks: {
      STRIPE_SECRET_KEY: Boolean(process.env.STRIPE_SECRET_KEY),
      AMPLIFY_STRIPE_SECRET_KEY: Boolean(process.env.AMPLIFY_STRIPE_SECRET_KEY),
      AWS_STRIPE_SECRET_KEY: Boolean(process.env.AWS_STRIPE_SECRET_KEY),
      STRIPE_SECRET: Boolean(process.env.STRIPE_SECRET),
    },
  });
}
