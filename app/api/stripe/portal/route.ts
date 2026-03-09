import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSession } from "@/lib/session";
import { getBusinessByEmail } from "@/lib/db";
import { checkOrigin } from "@/lib/csrf";

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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL not configured" }, { status: 503 });
  }

  let portalSession: Stripe.BillingPortal.Session;
  try {
    portalSession = await stripe.billingPortal.sessions.create({
      customer: business.stripe_customer_id,
      return_url: `${baseUrl}/settings/billing`,
    });
  } catch (err) {
    console.error("[STRIPE] billingPortal.sessions.create failed:", err);
    return NextResponse.json(
      { error: "Unable to open billing portal. Please try again." },
      { status: 503 }
    );
  }

  return NextResponse.redirect(portalSession.url, 303);
}
