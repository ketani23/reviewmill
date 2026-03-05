import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSession } from "@/lib/session";

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
  if (contentType.includes("application/json")) {
    const body = await req.json();
    plan = body.plan;
  } else {
    const form = await req.formData();
    plan = form.get("plan") as string | null;
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

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
