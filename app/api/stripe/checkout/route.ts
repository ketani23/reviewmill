import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSession } from "@/lib/session";
import { getBusinessByEmail } from "@/lib/db";
import { checkOrigin } from "@/lib/csrf";

const PRICE_IDS: Record<string, string | undefined> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID,
  growth: process.env.STRIPE_GROWTH_PRICE_ID,
  scale: process.env.STRIPE_SCALE_PRICE_ID,
};

export async function POST(req: NextRequest) {
  const csrfError = checkOrigin(req);
  if (csrfError) return csrfError;

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 }
    );
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized", redirect: "/api/auth/google" },
      { status: 401 }
    );
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

  const VALID_PLANS = ["starter", "growth", "scale"] as const;
  if (!plan || !VALID_PLANS.includes(plan as typeof VALID_PLANS[number])) {
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
      try {
        const existingSub = await stripe.subscriptions.retrieve(business.stripe_subscription_id);
        if (existingSub && ["active", "trialing"].includes(existingSub.status)) {
          return NextResponse.json(
            { error: "You already have an active subscription. Manage it from Settings → Billing." },
            { status: 409 }
          );
        }
      } catch (stripeErr: unknown) {
        // Stripe 404 = subscription no longer exists (deleted/stale), safe to proceed
        const isNotFound = stripeErr && typeof stripeErr === "object" && "statusCode" in stripeErr && (stripeErr as { statusCode: number }).statusCode === 404;
        if (!isNotFound) {
          console.error("[STRIPE] Failed to verify existing subscription:", stripeErr);
          return NextResponse.json(
            { error: "Unable to verify subscription status. Please try again." },
            { status: 503 }
          );
        }
        // Stale ID — proceed with new checkout
        console.warn(`[STRIPE] Stale subscription ID ${business.stripe_subscription_id} — allowing new checkout`);
      }
    }
  } catch (err) {
    // DB lookup failed — fail closed
    console.error("[STRIPE] Failed to check business for existing subscription:", err);
    return NextResponse.json(
      { error: "Unable to verify subscription status. Please try again." },
      { status: 503 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL not configured" }, { status: 503 });
  }

  let checkoutSession: Stripe.Checkout.Session;
  try {
    checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: session.email,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 14 },
      success_url: `${baseUrl}/dashboard?upgraded=true`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: { owner_email: session.email, plan },
    });
  } catch (err) {
    console.error("[STRIPE] checkout.sessions.create failed:", err);
    return NextResponse.json(
      { error: "Unable to create checkout session. Please try again." },
      { status: 503 }
    );
  }

  return NextResponse.redirect(checkoutSession.url!, 303);
}
