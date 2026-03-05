import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSession } from "@/lib/session";
import { getBusinessByEmail } from "@/lib/db";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 }
    );
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await getBusinessByEmail(session.email);
  if (!business?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No Stripe customer found" },
      { status: 404 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: business.stripe_customer_id,
    return_url: `${baseUrl}/settings/billing`,
  });

  return NextResponse.redirect(portalSession.url, 303);
}
