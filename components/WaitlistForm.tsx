"use client";

import { useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

export default function WaitlistForm() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    business_name: "",
    email: "",
    platform: "google",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        setFormState("error");
        return;
      }

      setFormState("success");
    } catch {
      setErrorMessage("Network error. Please try again.");
      setFormState("error");
    }
  };

  if (formState === "success") {
    return (
      <div className="rounded-2xl bg-white/10 border border-white/20 p-8 text-center backdrop-blur-sm">
        <div className="text-4xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-white mb-2">
          You&apos;re on the list!
        </h3>
        <p className="text-white/80">
          We&apos;ll reach out soon with early access details.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-md mx-auto">
      <input
        type="text"
        placeholder="Business name"
        required
        value={formData.business_name}
        onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
        className="w-full rounded-xl px-4 py-3 text-[#1a1a2e] bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e8a838] text-base"
      />
      <input
        type="email"
        placeholder="your@email.com"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="w-full rounded-xl px-4 py-3 text-[#1a1a2e] bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e8a838] text-base"
      />
      <select
        value={formData.platform}
        onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
        className="w-full rounded-xl px-4 py-3 text-[#1a1a2e] bg-white focus:outline-none focus:ring-2 focus:ring-[#e8a838] text-base"
      >
        <option value="google">Google Reviews</option>
        <option value="yelp">Yelp</option>
        <option value="both">Both Google &amp; Yelp</option>
      </select>

      {formState === "error" && (
        <p className="text-red-300 text-sm text-center">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={formState === "loading"}
        className="w-full rounded-xl bg-[#e8a838] hover:bg-[#d4922a] disabled:opacity-60 disabled:cursor-not-allowed text-[#1a1a2e] font-bold py-3 px-6 text-base transition-colors cursor-pointer"
      >
        {formState === "loading" ? "Joining…" : "Join the Beta — Free"}
      </button>

      <p className="text-white/60 text-xs text-center">
        No credit card required. Cancel anytime.
      </p>
    </form>
  );
}
