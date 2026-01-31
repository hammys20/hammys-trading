import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    stripeSecretKeyPresent: Boolean(process.env.STRIPE_SECRET_KEY),
    nextPublicSiteUrlPresent: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
  });
}
