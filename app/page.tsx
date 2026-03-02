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

      {/* ── What You Get ── */}
      <section className="px-6 py-20 bg-gray-50" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-3">
              Everything You Get — Free During Beta
            </h2>
            <p className="text-gray-500 text-base max-w-lg mx-auto">
              We&apos;re looking for{" "}
              <span className="text-[#e8a838] font-semibold">
                10 local businesses
              </span>{" "}
              to try ReviewMill at no cost. You get the full product. We get your feedback.
            </p>
          </div>

          <div className="bg-[#1a1a2e] rounded-2xl p-8 md:p-12 relative shadow-lg">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-[#e8a838] text-[#1a1a2e] text-xs font-bold px-4 py-1 rounded-full tracking-wide uppercase">
                Free Beta — No Credit Card
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-4">
              <div>
                <div className="text-2xl mb-3">👁️</div>
                <h3 className="text-base font-bold text-white mb-2">24/7 Monitoring</h3>
                <ul className="flex flex-col gap-2 text-sm text-white/70">
                  {[
                    "Google, Yelp & Facebook reviews",
                    "Instant email alerts",
                    "Weekly summary report",
                    "Never miss a review again",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-[#e8a838] mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-2xl mb-3">✍️</div>
                <h3 className="text-base font-bold text-white mb-2">AI-Drafted Responses</h3>
                <ul className="flex flex-col gap-2 text-sm text-white/70">
                  {[
                    "Professional replies in seconds",
                    "Matched to your brand voice",
                    "Edit before posting",
                    "One-tap approve from your phone",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-[#e8a838] mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-2xl mb-3">📊</div>
                <h3 className="text-base font-bold text-white mb-2">Reputation Insights</h3>
                <ul className="flex flex-col gap-2 text-sm text-white/70">
                  {[
                    "Sentiment trends over time",
                    "Response rate tracking",
                    "Competitor benchmarking",
                    "Monthly reputation report",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-[#e8a838] mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10 text-center">
              <a
                href="#waitlist"
                className="inline-block bg-[#e8a838] hover:bg-[#d4922a] text-[#1a1a2e] font-bold py-3 px-8 rounded-xl transition-colors text-sm"
              >
                Join the Beta — It&apos;s Free
              </a>
              <p className="text-white/40 text-xs mt-3">
                Limited to 10 spots. No credit card. No commitment.
              </p>
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
