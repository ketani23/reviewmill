import WaitlistForm from "@/components/WaitlistForm";
import FAQ from "@/components/FAQ";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#1a1a2e]">
      {/* ── Nav ── */}
      <nav className="bg-[#1a1a2e] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-white font-bold text-lg tracking-tight">
            Review<span className="text-[#e8a838]">Mill</span>
          </span>
          <a
            href="#waitlist"
            className="bg-[#e8a838] hover:bg-[#d4922a] text-[#1a1a2e] font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Join Beta
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-[#1a1a2e] px-6 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block bg-[#e8a838]/20 text-[#e8a838] text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
            Built for local businesses in Bergen County, NJ
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-5">
            Never Miss a Customer{" "}
            <span className="text-[#e8a838]">Review</span> Again
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto mb-10 leading-relaxed">
            AI monitors your reviews 24/7 and drafts perfect responses in
            seconds. You just approve.
          </p>

          <div id="waitlist">
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* ── Social Proof Strip ── */}
      <section className="bg-[#e8a838]/10 border-y border-[#e8a838]/20 px-6 py-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-6 text-sm text-[#1a1a2e]/70 font-medium">
          <span>★ Google Reviews</span>
          <span className="hidden sm:inline text-[#e8a838]">•</span>
          <span>★ Yelp</span>
          <span className="hidden sm:inline text-[#e8a838]">•</span>
          <span>★ Facebook</span>
          <span className="hidden sm:inline text-[#e8a838]">•</span>
          <span>Free during beta</span>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="px-6 py-20 bg-white" id="how-it-works">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-3">
              How It Works
            </h2>
            <p className="text-gray-500 text-base max-w-md mx-auto">
              Set up once. ReviewMill handles the rest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "We watch your reviews",
                body: "ReviewMill monitors Google, Yelp, and Facebook 24/7. The moment a new review lands, we catch it — so you never find out days later.",
                icon: "👀",
              },
              {
                step: "02",
                title: "We draft your response",
                body: "Our AI writes a professional, on-brand reply in seconds — tailored to the sentiment and content of the review. No copy-pasting, no prompt engineering.",
                icon: "✍️",
              },
              {
                step: "03",
                title: "You approve with one tap",
                body: "You get a notification on your phone. Review the drafted response, make any edits you like, and hit send. Done in under a minute.",
                icon: "✅",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <div className="text-xs font-bold tracking-widest text-[#e8a838] uppercase mb-2">
                  Step {item.step}
                </div>
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="px-6 py-20 bg-gray-50" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-3">
              Simple, Honest Pricing
            </h2>
            <p className="text-gray-500 text-base max-w-md mx-auto">
              All plans are{" "}
              <span className="text-[#e8a838] font-semibold">
                completely free during beta
              </span>
              . Lock in your rate before we launch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Monitor & Alert */}
            <div className="bg-white border border-gray-200 rounded-2xl p-7 flex flex-col">
              <div className="mb-6">
                <h3 className="text-base font-bold text-[#1a1a2e] mb-1">
                  Monitor &amp; Alert
                </h3>
                <div className="flex items-end gap-1 mb-3">
                  <span className="text-4xl font-extrabold text-[#1a1a2e]">
                    $29
                  </span>
                  <span className="text-gray-400 text-sm mb-1">/mo</span>
                </div>
                <p className="text-gray-500 text-sm">
                  Get notified instantly when a new review arrives. Perfect for
                  owners who want to write their own responses.
                </p>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-gray-600 mb-8 flex-grow">
                {[
                  "24/7 review monitoring",
                  "Instant email + SMS alerts",
                  "Google, Yelp, Facebook",
                  "Weekly summary report",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-[#e8a838] mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#waitlist"
                className="block text-center bg-gray-100 hover:bg-gray-200 text-[#1a1a2e] font-semibold py-3 px-5 rounded-xl transition-colors text-sm"
              >
                Join Beta — Free
              </a>
            </div>

            {/* Monitor + Draft — POPULAR */}
            <div className="bg-[#1a1a2e] border-2 border-[#e8a838] rounded-2xl p-7 flex flex-col relative shadow-lg">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-[#e8a838] text-[#1a1a2e] text-xs font-bold px-4 py-1 rounded-full tracking-wide uppercase">
                  Most Popular
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-base font-bold text-white mb-1">
                  Monitor + Draft
                </h3>
                <div className="flex items-end gap-1 mb-3">
                  <span className="text-4xl font-extrabold text-white">
                    $49
                  </span>
                  <span className="text-white/50 text-sm mb-1">/mo</span>
                </div>
                <p className="text-white/60 text-sm">
                  Everything in Monitor &amp; Alert, plus AI-drafted responses
                  you approve before they post.
                </p>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-white/80 mb-8 flex-grow">
                {[
                  "Everything in Monitor & Alert",
                  "AI-drafted responses",
                  "Approve or edit before posting",
                  "Brand voice customization",
                  "Response analytics",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-[#e8a838] mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#waitlist"
                className="block text-center bg-[#e8a838] hover:bg-[#d4922a] text-[#1a1a2e] font-bold py-3 px-5 rounded-xl transition-colors text-sm"
              >
                Join Beta — Free
              </a>
            </div>

            {/* Full Autopilot */}
            <div className="bg-white border border-gray-200 rounded-2xl p-7 flex flex-col">
              <div className="mb-6">
                <h3 className="text-base font-bold text-[#1a1a2e] mb-1">
                  Full Autopilot
                </h3>
                <div className="flex items-end gap-1 mb-3">
                  <span className="text-4xl font-extrabold text-[#1a1a2e]">
                    $99
                  </span>
                  <span className="text-gray-400 text-sm mb-1">/mo</span>
                </div>
                <p className="text-gray-500 text-sm">
                  Fully automated review responses with your oversight. Set it
                  and forget it.
                </p>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-gray-600 mb-8 flex-grow">
                {[
                  "Everything in Monitor + Draft",
                  "Auto-post responses",
                  "Priority alert for negative reviews",
                  "Monthly strategy call",
                  "Dedicated support",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-[#e8a838] mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#waitlist"
                className="block text-center bg-gray-100 hover:bg-gray-200 text-[#1a1a2e] font-semibold py-3 px-5 rounded-xl transition-colors text-sm"
              >
                Join Beta — Free
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 py-20 bg-white" id="faq">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 text-base">
              Still have questions?{" "}
              <a
                href="mailto:hello@rook.xyz"
                className="text-[#e8a838] hover:underline"
              >
                Email us
              </a>
              .
            </p>
          </div>
          <FAQ />
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="bg-[#1a1a2e] px-6 py-20">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to stop losing customers to ignored reviews?
          </h2>
          <p className="text-white/60 text-base mb-10">
            Join the beta. It&apos;s free. No credit card needed.
          </p>
          <WaitlistForm />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#252545] px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="text-white/80">
            <span className="font-bold text-white">
              Review<span className="text-[#e8a838]">Mill</span>
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
