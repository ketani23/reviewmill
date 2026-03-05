import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getBusinessByStripeCustomerId,
  updateBusinessStripe,
} from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 }
    );
  }

  const stripe = new Stripe(secret);
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", msg);
    return NextResponse.json({ error: `Webhook error: ${msg}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const ownerEmail =
          (session.metadata?.owner_email as string | undefined) ??
          session.customer_email ??
          null;
        const plan = (session.metadata?.plan as string | undefined) ?? "starter";

        if (!ownerEmail) break;

        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null;

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null;

        // Fetch trial end date from the subscription
        let trialEndsAt: string | null = null;
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          if (sub.trial_end) {
            trialEndsAt = new Date(sub.trial_end * 1000).toISOString();
          }
        }

        // Update by email (easiest since we stored it in metadata)
        const { createSupabaseClient } = await import("@/lib/supabase-server");
        const supabase = createSupabaseClient();
        await supabase
          .from("businesses")
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan,
            trial_ends_at: trialEndsAt,
          })
          .eq("owner_email", ownerEmail);

        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        const business = await getBusinessByStripeCustomerId(customerId);
        if (!business) break;

        const planItem = sub.items.data[0];
        // Derive plan from price nickname or metadata if set, fallback to current
        const planName =
          (planItem?.price?.nickname?.toLowerCase() as
            | "starter"
            | "growth"
            | "scale"
            | undefined) ?? business.plan;

        const trialEndsAt = sub.trial_end
          ? new Date(sub.trial_end * 1000).toISOString()
          : null;

        await updateBusinessStripe(business.owner_email, {
          plan: planName,
          stripe_subscription_id: sub.id,
          trial_ends_at: trialEndsAt,
        });

        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        const business = await getBusinessByStripeCustomerId(customerId);
        if (!business) break;

        await updateBusinessStripe(business.owner_email, {
          plan: "free",
          stripe_subscription_id: null,
          trial_ends_at: null,
        });

        break;
      }

      default:
        // Ignore unhandled events
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json(
      { error: "Internal webhook error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
