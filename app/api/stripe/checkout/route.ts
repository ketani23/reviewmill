import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSession } from "@/lib/session";
import { getBusinessByEmail } from "@/lib/db";

const PRICE_IDS: Record<string, string | undefined> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID,
  growth: process.env.STRIPE_GROWTH_PRICE_ID,
  scale: process.env.STRIPE_SCALE_PRICE_ID,
};

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 }
    );
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/api/auth/google", req.url));
  }

  // Support both JSON body (fetch) and form data (HTML form POST)
  let plan: string | null = null;
  const contentType = req.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const body = await req.json();
      plan = body.plan;
    } else {
      const form = await req.formData();
      plan = form.get("plan") as string | null;
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!plan || !PRICE_IDS[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json(
      { error: `Price ID for plan "${plan}" not configured` },
      { status: 503 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // Prevent duplicate subscriptions — check if business already has an active one
  try {
    const business = await getBusinessByEmail(session.email);
    if (business?.stripe_subscription_id) {
      const existingSub = await stripe.subscriptions.retrieve(business.stripe_subscription_id);
      if (existingSub && ["active", "trialing"].includes(existingSub.status)) {
        return NextResponse.json(
          { error: "You already have an active subscription. Manage it from Settings → Billing." },
          { status: 409 }
        );
      }
    }
  } catch {
    // If check fails, allow checkout to proceed (Stripe will handle dedup via customer_email)
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL not configured" }, { status: 503 });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: session.email,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { trial_period_days: 14 },
    success_url: `${baseUrl}/dashboard?upgraded=true`,
    cancel_url: `${baseUrl}/pricing`,
    metadata: { owner_email: session.email, plan },
  });

  return NextResponse.redirect(checkoutSession.url!, 303);
}
