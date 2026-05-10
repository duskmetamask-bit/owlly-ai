/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) return null;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const StripeMod = require("stripe") as typeof Stripe;
  return new StripeMod(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
  });
}

// Map Stripe subscription statuses to our enum
function mapSubscriptionStatus(status: string): "free" | "active" | "cancelled" | "past_due" {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "canceled":
      return "cancelled";
    case "past_due":
      return "past_due";
    default:
      return "free";
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return new Response("Stripe not configured", { status: 500 });
  }
  try {
    stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook signature verification failed:", message);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  return new Response("OK", { status: 200 });
}