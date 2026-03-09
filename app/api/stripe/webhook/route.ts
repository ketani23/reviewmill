import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getBusinessByStripeCustomerId,
  updateBusinessStripe,
} from "@/lib/db";

export const runtime = "nodejs";

const VALID_PLANS = ["starter", "growth", "scale"] as const;
type Plan = typeof VALID_PLANS[number];

/** Match a Stripe price ID against configured env vars to derive a plan name. */
function planFromPriceId(priceId: string): Plan | null {
  if (priceId && priceId === process.env.STRIPE_STARTER_PRICE_ID) return "starter";
  if (priceId && priceId === process.env.STRIPE_GROWTH_PRICE_ID) return "growth";
  if (priceId && priceId === process.env.STRIPE_SCALE_PRICE_ID) return "scale";
  return null;
}

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

        if (!ownerEmail) break;

        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null;

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null;

        // Determine plan — prefer metadata, fall back to price ID, last resort 'starter'
        const rawPlanMeta = session.metadata?.plan as string | undefined;
        let plan: Plan;
        let trialEndsAt: string | null = null;

        if (rawPlanMeta && VALID_PLANS.includes(rawPlanMeta as Plan)) {
          plan = rawPlanMeta as Plan;
        } else {
          plan = "free"; // will be overridden below if price ID matches
        }

        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          if (sub.trial_end) {
            trialEndsAt = new Date(sub.trial_end * 1000).toISOString();
          }

          // If plan wasn't determined from metadata, try to derive from price ID
          if (!rawPlanMeta || !VALID_PLANS.includes(rawPlanMeta as Plan)) {
            const priceId = sub.items.data[0]?.price?.id ?? "";
            const derivedPlan = planFromPriceId(priceId);
            if (derivedPlan) {
              plan = derivedPlan;
            } else {
              console.warn(
                `[STRIPE] WARN: checkout.session.completed — could not determine plan ` +
                `from metadata (plan=${rawPlanMeta}) or price ID (${priceId}); ` +
                `defaulting to 'free'. Check STRIPE_*_PRICE_ID env vars.`
              );
              // plan remains 'free' — fail-safe, don't grant paid access on config errors
            }
          }
        }

        // Update by email (easiest since we stored it in metadata)
        const { createSupabaseClient } = await import("@/lib/supabase-server");
        const supabase = createSupabaseClient();
        const { data: updateData, error: updateError } = await supabase
          .from("businesses")
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan,
            trial_ends_at: trialEndsAt,
          })
          .eq("owner_email", ownerEmail)
          .select("id");

        if (updateError) {
          console.error("Failed to persist checkout session to DB:", updateError);
          return NextResponse.json(
            { error: "Failed to update billing state" },
            { status: 500 }
          );
        }

        if (!updateData || updateData.length === 0) {
          // Log but acknowledge the event (200) to prevent Stripe from retrying forever.
          // The business row may not exist yet if auth DB write failed — retrying won't help.
          console.error(`[STRIPE] checkout.session.completed: no business row found for ${ownerEmail} — acknowledging to stop retries`);
        }

        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;

        const business = await getBusinessByStripeCustomerId(customerId);
        if (!business) break;

        // HIGH: Only grant paid access for genuinely active subscriptions.
        // past_due / unpaid / incomplete_expired / canceled → downgrade to free.
        const ACTIVE_STATUSES = ["active", "trialing"] as const;
        if (!ACTIVE_STATUSES.includes(sub.status as typeof ACTIVE_STATUSES[number])) {
          console.warn(
            `[STRIPE] subscription.updated: status=${sub.status} is not active/trialing — downgrading to free`
          );
          await updateBusinessStripe(business.owner_email, {
            plan: "free",
            stripe_subscription_id: sub.id,
            trial_ends_at: null,
          });
          break;
        }

        const planItem = sub.items.data[0];
        const priceId = planItem?.price?.id ?? "";
        // Try price metadata first, then nickname, then price ID env var match, then keep existing
        const rawPlan = (planItem?.price?.metadata?.plan as string | undefined)
          ?? planItem?.price?.nickname?.toLowerCase().trim();
        let planName: Plan;
        if (rawPlan && VALID_PLANS.includes(rawPlan as Plan)) {
          planName = rawPlan as Plan;
        } else {
          const derived = planFromPriceId(priceId);
          if (derived) {
            planName = derived;
          } else {
            planName = business.plan as Plan;
            console.warn(`[STRIPE] subscription.updated: could not derive plan from metadata=${JSON.stringify(planItem?.price?.metadata)}, nickname=${planItem?.price?.nickname}, priceId=${priceId} — keeping existing: ${business.plan}`);
          }
        }

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
