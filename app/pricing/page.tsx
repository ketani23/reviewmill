import { getSession } from "@/lib/session";
import { getBusinessByEmail } from "@/lib/db";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    description: "Perfect for single-location businesses.",
    features: [
      "1 location",
      "50 reviews / month",
      "Email notifications",
      "AI-drafted responses",
      "14-day free trial",
    ],
    priceIdEnv: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", // used for display only; actual price ID is server-side
    cta: "Start Free Trial",
    highlight: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: 79,
    description: "For growing businesses with multiple locations.",
    features: [
      "3 locations",
      "Unlimited reviews",
      "Priority AI responses",
      "Analytics dashboard",
      "14-day free trial",
    ],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: 199,
    description: "For enterprise teams that need it all.",
    features: [
      "10 locations",
      "Unlimited reviews",
      "Custom brand voice",
      "Dedicated support",
      "API access",
      "14-day free trial",
    ],
    cta: "Start Free Trial",
    highlight: false,
  },
];

export default async function PricingPage() {
  const session = await getSession();
  let currentPlan = "free";

  if (session) {
    try {
      const business = await getBusinessByEmail(session.email);
      if (business) currentPlan = business.plan;
    } catch {
      // ignore
    }
  }

  const stripeEnabled = !!process.env.STRIPE_SECRET_KEY;

  return (
    <div className="min-h-screen bg-white text-[#1a1a2e]">
      {/* Nav */}
      <nav className="bg-[#1a1a2e] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a
            href="/"
            className="text-white font-bold text-lg tracking-tight hover:opacity-90 transition-opacity"
          >
            Review<span className="text-[#e8a838]">Guard</span>
          </a>
          <div className="flex items-center gap-4">
            <a
              href="/pricing"
              className="text-[#e8a838] text-sm font-medium"
            >
              Pricing
            </a>
            {session ? (
              <a
                href="/dashboard"
                className="bg-[#e8a838] hover:bg-[#d4922a] text-[#1a1a2e] font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Dashboard
              </a>
            ) : (
              <a
                href="/api/auth/google"
                className="bg-[#e8a838] hover:bg-[#d4922a] text-[#1a1a2e] font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Sign In
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-[#1a1a2e] px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-block bg-[#e8a838]/20 text-[#e8a838] text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5">
            Simple pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Start free. Upgrade when ready.
          </h1>
          <p className="text-white/60 text-lg">
            Every plan includes a 14-day free trial. No credit card required to start.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-8 flex flex-col shadow-sm ${
                  plan.highlight
                    ? "bg-[#1a1a2e] border-[#e8a838] shadow-lg"
                    : "bg-white border-gray-200"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-[#e8a838] text-[#1a1a2e] text-xs font-bold px-4 py-1 rounded-full tracking-wide uppercase">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h2
                    className={`text-xl font-bold mb-1 ${
                      plan.highlight ? "text-white" : "text-[#1a1a2e]"
                    }`}
                  >
                    {plan.name}
                  </h2>
                  <p
                    className={`text-sm mb-5 ${
                      plan.highlight ? "text-white/60" : "text-gray-500"
                    }`}
                  >
                    {plan.description}
                  </p>
                  <div className="flex items-end gap-1">
                    <span
                      className={`text-4xl font-extrabold ${
                        plan.highlight ? "text-white" : "text-[#1a1a2e]"
                      }`}
                    >
                      ${plan.price}
                    </span>
                    <span
                      className={`text-sm mb-1.5 ${
                        plan.highlight ? "text-white/50" : "text-gray-400"
                      }`}
                    >
                      /month
                    </span>
                  </div>
                </div>

                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <span
                        className={`mt-0.5 font-bold ${
                          plan.highlight ? "text-[#e8a838]" : "text-[#e8a838]"
                        }`}
                      >
                        ✓
                      </span>
                      <span
                        className={
                          plan.highlight ? "text-white/80" : "text-gray-600"
                        }
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <CheckoutButton
                  plan={plan.id}
                  label={isCurrent ? "Current Plan" : plan.cta}
                  disabled={isCurrent || !stripeEnabled}
                  highlight={plan.highlight}
                />
              </div>
            );
          })}
        </div>

        {!stripeEnabled && (
          <p className="text-center text-sm text-gray-400 mt-6">
            Stripe not configured — checkout is disabled in this environment.
          </p>
        )}
      </section>

      {/* FAQ-style reassurance */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#1a1a2e] mb-3">
            14 days free on every plan
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            No credit card required to start your trial. Cancel anytime. If you
            upgrade mid-trial, your billing starts after the trial ends.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <span className="text-[#e8a838] font-bold">✓</span> No setup fees
            </span>
            <span className="flex items-center gap-2">
              <span className="text-[#e8a838] font-bold">✓</span> Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <span className="text-[#e8a838] font-bold">✓</span> Secure billing via Stripe
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#252545] px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="text-white/80">
            <span className="font-bold text-white">
              Review<span className="text-[#e8a838]">Guard</span>
            </span>{" "}
            — AI Review Management
          </div>
          <div className="text-white/50 text-center">
            <a
              href="mailto:hello@rook.xyz"
              className="text-white/70 hover:text-[#e8a838] transition-colors"
            >
              hello@rook.xyz
            </a>
          </div>
          <div className="text-white/40">Powered by Rook AI</div>
        </div>
      </footer>
    </div>
  );
}

// Client component for the checkout button
function CheckoutButton({
  plan,
  label,
  disabled,
  highlight,
}: {
  plan: string;
  label: string;
  disabled: boolean;
  highlight: boolean;
}) {
  if (disabled) {
    return (
      <button
        disabled
        className={`w-full py-3 px-6 rounded-xl text-sm font-semibold opacity-50 cursor-not-allowed ${
          highlight
            ? "bg-[#e8a838] text-[#1a1a2e]"
            : "bg-[#1a1a2e] text-white"
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <form action="/api/stripe/checkout" method="POST">
      <input type="hidden" name="plan" value={plan} />
      <button
        type="submit"
        className={`w-full py-3 px-6 rounded-xl text-sm font-semibold transition-colors ${
          highlight
            ? "bg-[#e8a838] hover:bg-[#d4922a] text-[#1a1a2e]"
            : "bg-[#1a1a2e] hover:bg-[#252545] text-white"
        }`}
      >
        {label}
      </button>
    </form>
  );
}
