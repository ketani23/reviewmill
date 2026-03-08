import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getBusinessByEmail } from "@/lib/db";
import { AppHeader } from "@/components/AppHeader";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  growth: "Growth",
  scale: "Scale",
};

const PLAN_PRICES: Record<string, string> = {
  free: "$0",
  starter: "$29/mo",
  growth: "$79/mo",
  scale: "$199/mo",
};

export default async function BillingPage() {
  const session = await getSession();
  if (!session) redirect("/api/auth/google");

  let business = null;
  try {
    business = await getBusinessByEmail(session.email);
  } catch {
    // render gracefully with nulls
  }

  const plan = business?.plan ?? "free";
  const planLabel = PLAN_LABELS[plan] ?? plan;
  const planPrice = PLAN_PRICES[plan] ?? "";
  const trialEndsAt = business?.trial_ends_at
    ? new Date(business.trial_ends_at)
    : null;
  const isOnTrial =
    trialEndsAt != null && trialEndsAt > new Date() && plan !== "free";
  const hasStripeCustomer = !!business?.stripe_customer_id;
  const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        email={session.email}
        businessName={business?.business_name ?? undefined}
        currentPage="settings"
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e]">Billing</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your subscription and billing details.
            </p>
          </div>
          <a
            href="/settings"
            className="text-sm text-gray-500 hover:text-[#1a1a2e] transition-colors"
          >
            ← Settings
          </a>
        </div>

        <div className="space-y-6">
          {/* Current Plan */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#1a1a2e]">
                Current Plan
              </h2>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xl font-bold text-[#1a1a2e]">
                      {planLabel}
                    </span>
                    {plan !== "free" && (
                      <span className="text-sm font-medium text-gray-500">
                        {planPrice}
                      </span>
                    )}
                    {isOnTrial && (
                      <span className="bg-[#e8a838]/20 text-[#d4922a] text-xs font-bold px-2.5 py-1 rounded-full">
                        Trial
                      </span>
                    )}
                  </div>

                  {isOnTrial && trialEndsAt && (
                    <p className="text-sm text-gray-500">
                      Free trial ends{" "}
                      <strong>
                        {trialEndsAt.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </strong>
                      . Your card will be charged after that.
                    </p>
                  )}

                  {!isOnTrial && plan !== "free" && (
                    <p className="text-sm text-gray-500">
                      Active subscription — manage below.
                    </p>
                  )}

                  {plan === "free" && (
                    <p className="text-sm text-gray-500">
                      You&apos;re on the free plan.{" "}
                      <a
                        href="/pricing"
                        className="text-[#e8a838] hover:underline font-medium"
                      >
                        Upgrade to unlock more features.
                      </a>
                    </p>
                  )}
                </div>

                <a
                  href="/pricing"
                  className="text-sm font-semibold text-[#1a1a2e] bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors"
                >
                  {plan === "free" ? "View Plans" : "Change Plan"}
                </a>
              </div>
            </div>
          </section>

          {/* Manage Subscription */}
          {hasStripeCustomer && (
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-[#1a1a2e]">
                  Manage Subscription
                </h2>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm text-gray-500 mb-4">
                  Update your payment method, view invoices, or cancel your
                  subscription through the Stripe customer portal.
                </p>
                {stripeConfigured ? (
                  <form action="/api/stripe/portal" method="POST">
                    <button
                      type="submit"
                      className="bg-[#1a1a2e] hover:bg-[#252545] text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-colors"
                    >
                      Manage Subscription
                    </button>
                  </form>
                ) : (
                  <p className="text-sm text-gray-400">
                    Stripe is not configured in this environment.
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Upgrade CTA for free users */}
          {plan === "free" && (
            <section className="bg-[#1a1a2e] rounded-2xl p-6 text-center">
              <h3 className="text-white font-bold text-lg mb-2">
                Ready to upgrade?
              </h3>
              <p className="text-white/60 text-sm mb-5">
                Start a 14-day free trial — no credit card required.
              </p>
              <a
                href="/pricing"
                className="inline-block bg-[#e8a838] hover:bg-[#d4922a] text-[#1a1a2e] font-bold text-sm py-2.5 px-6 rounded-xl transition-colors"
              >
                View Pricing
              </a>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
