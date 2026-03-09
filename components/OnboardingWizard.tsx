"use client";

import { useState } from "react";
import { AppHeader } from "./AppHeader";
import { BUSINESS_TYPES, VOICE_TONES } from "@/lib/constants";

type Props = {
  email: string;
  defaultName: string;
};

export function OnboardingWizard({ email, defaultName }: Props) {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState(defaultName);
  const [businessType, setBusinessType] = useState("");
  const [voiceTone, setVoiceTone] = useState("friendly");
  const [customInstructions, setCustomInstructions] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canProceedStep1 = businessName.trim().length > 0 && businessType !== "";

  async function handleFinish() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/business/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName.trim(),
          business_type: businessType,
          voice_tone: voiceTone,
          custom_instructions: customInstructions.trim(),
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      window.location.href = "/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader email={email} currentPage="onboarding" />

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-12">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map((n) => (
            <div key={n} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= n
                    ? "bg-[#1a1a2e] text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {step > n ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                ) : (
                  n
                )}
              </div>
              <span
                className={`text-sm font-medium hidden sm:inline ${
                  step >= n ? "text-[#1a1a2e]" : "text-gray-400"
                }`}
              >
                {n === 1 ? "Business Info" : "Brand Voice"}
              </span>
              {n < 2 && <div className="w-8 h-px bg-gray-300" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {step === 1 && (
            <>
              <h1 className="text-xl font-bold text-[#1a1a2e] mb-1">
                Tell us about your business
              </h1>
              <p className="text-sm text-gray-500 mb-7">
                This helps ReviewGuard personalise your AI responses.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">
                    Business name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Tony's Pizzeria"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1a1a2e] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e8a838]/50 focus:border-[#e8a838]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">
                    Business type
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#e8a838]/50 focus:border-[#e8a838] bg-white"
                  >
                    <option value="">Select a type…</option>
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="mt-8 w-full py-3 px-4 bg-[#1a1a2e] text-white font-semibold rounded-xl hover:bg-[#252545] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-xl font-bold text-[#1a1a2e] mb-1">
                Set your brand voice
              </h1>
              <p className="text-sm text-gray-500 mb-7">
                ReviewGuard will match this tone in every AI-drafted response.
              </p>

              <div className="space-y-3 mb-6">
                {VOICE_TONES.map((tone) => (
                  <label
                    key={tone.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      voiceTone === tone.id
                        ? "border-[#e8a838] bg-[#e8a838]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="voice_tone"
                      value={tone.id}
                      checked={voiceTone === tone.id}
                      onChange={() => setVoiceTone(tone.id)}
                      className="mt-0.5 accent-[#e8a838]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a2e]">
                        {tone.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{tone.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">
                  Custom instructions{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={3}
                  placeholder="e.g. Always mention our loyalty program. Never offer discounts in public replies."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1a1a2e] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e8a838]/50 focus:border-[#e8a838] resize-none"
                />
              </div>

              {error && (
                <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
              )}

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep(1)}
                  disabled={saving}
                  className="flex-1 py-3 px-4 border border-gray-200 text-[#1a1a2e] font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  ← Back
                </button>
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex-[2] py-3 px-4 bg-[#e8a838] hover:bg-[#d4922a] text-[#1a1a2e] font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Setting up…
                    </>
                  ) : (
                    "Set Up My Account →"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
