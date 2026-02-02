import Stripe from "stripe";

export const STRIPE_API_VERSION = "2026-01-28.clover";

export function createStripe(secretKey: string) {
  return new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION });
}
