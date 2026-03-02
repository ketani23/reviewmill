"use client";

import { useState } from "react";

const faqs = [
  {
    q: "How does it work?",
    a: "ReviewMill connects to your Google, Yelp, and Facebook business profiles and monitors for new reviews around the clock. When a new review comes in, our AI reads it and drafts a professional, personalized response. You get a notification and can approve or edit the response with one tap — right from your phone.",
  },
  {
    q: "Is it safe to connect my business accounts?",
    a: "Yes. We use official OAuth integrations with read/write permissions limited to reviews only. We never have access to your passwords, financial data, or anything unrelated to review management. Your credentials are encrypted and never stored in plain text.",
  },
  {
    q: "What platforms do you support?",
    a: "We currently support Google Business Profile, Yelp, and Facebook. We're working on adding TripAdvisor and Nextdoor. Let us know which platform matters most to your business!",
  },
  {
    q: "Can I edit the responses before they go out?",
    a: "Absolutely. Every response is sent to you for review before it goes live. You can approve it as-is, tweak the wording, or write your own from scratch. You're always in control. (On the Full Autopilot plan, you can optionally let responses post automatically, but you can always turn that off.)",
  },
  {
    q: "How is this different from just using ChatGPT?",
    a: "ChatGPT requires you to copy-paste each review, write a prompt, and then manually post the response. ReviewMill does all of that automatically — it watches for new reviews, drafts responses that match your brand voice, and lets you approve in seconds. It's the difference between a tool and a workflow.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="border border-gray-200 rounded-2xl overflow-hidden"
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span className="font-semibold text-[#1a1a2e] text-base pr-4">
              {faq.q}
            </span>
            <span className="text-[#e8a838] text-xl flex-shrink-0 font-light">
              {open === i ? "−" : "+"}
            </span>
          </button>
          {open === i && (
            <div className="px-6 pb-5 pt-1 bg-white">
              <p className="text-gray-600 leading-relaxed text-sm">{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
