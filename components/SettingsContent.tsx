"use client";

import { useState } from "react";
import { AppHeader } from "./AppHeader";
import { Business } from "@/lib/db";

const BUSINESS_TYPES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "salon", label: "Salon" },
  { value: "dentist", label: "Dentist" },
  { value: "auto_shop", label: "Auto Shop" },
  { value: "other", label: "Other" },
];
const VOICE_TONES = ["professional", "friendly", "casual"] as const;

type Props = {
  email: string;
  name: string;
  business: Business | null;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function SettingsContent({ email, name, business }: Props) {
  const [businessName, setBusinessName] = useState(
    business?.business_name ?? name ?? ""
  );
  const [businessType, setBusinessType] = useState(
    business?.business_type ?? ""
  );
  const [voiceTone, setVoiceTone] = useState(
    business?.voice_tone ?? "friendly"
  );
  const [customInstructions, setCustomInstructions] = useState(
    business?.custom_instructions ?? ""
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    business?.notifications_enabled ?? true
  );
  const [notificationEmail, setNotificationEmail] = useState(
    business?.notification_email ?? email
  );
  const [status, setStatus] = useState<SaveStatus>("idle");

  async function handleSave() {
    setStatus("saving");
    try {
      const res = await fetch("/api/business/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName.trim(),
          business_type: businessType,
          voice_tone: voiceTone,
          custom_instructions: customInstructions.trim(),
          notifications_enabled: notificationsEnabled,
          notification_email: notificationEmail.trim(),
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        email={email}
        businessName={business?.business_name ?? undefined}
        currentPage="settings"
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a2e]">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your business profile and preferences.
            </p>
          </div>
          <a
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-[#1a1a2e] transition-colors"
          >
            ← Dashboard
          </a>
        </div>

        <div className="space-y-6">
          {/* Business Profile */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#1a1a2e]">
                Business Profile
              </h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">
                  Business name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8a838]/50 focus:border-[#e8a838]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">
                  Business type
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8a838]/50 focus:border-[#e8a838] bg-white"
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
          </section>

          {/* Brand Voice */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#1a1a2e]">
                Brand Voice
              </h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  Response tone
                </label>
                <div className="flex gap-2 flex-wrap">
                  {VOICE_TONES.map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setVoiceTone(tone)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                        voiceTone === tone
                          ? "bg-[#1a1a2e] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
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
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8a838]/50 focus:border-[#e8a838] resize-none"
                />
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#1a1a2e]">
                Notifications
              </h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#1a1a2e]">
                    Email notifications
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Get notified when a new review arrives.
                  </p>
                </div>
                <button
                  onClick={() => setNotificationsEnabled((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    notificationsEnabled ? "bg-[#e8a838]" : "bg-gray-200"
                  }`}
                  role="switch"
                  aria-checked={notificationsEnabled}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      notificationsEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              {notificationsEnabled && (
                <div>
                  <label className="block text-sm font-medium text-[#1a1a2e] mb-1.5">
                    Notification email
                  </label>
                  <input
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8a838]/50 focus:border-[#e8a838]"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Connected Accounts */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-[#1a1a2e]">
                Connected Accounts
              </h2>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center gap-3">
                <svg
                  className="w-8 h-8 flex-shrink-0"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1a1a2e]">
                    Google Account
                  </p>
                  <p className="text-xs text-gray-500 truncate">{email}</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Connected
                </span>
              </div>
            </div>
          </section>

          {/* Save button */}
          <div className="flex items-center justify-end gap-4 pt-2 pb-8">
            {status === "saved" && (
              <p className="text-sm text-green-600 font-medium">
                Changes saved!
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-red-500 font-medium">
                Failed to save. Please try again.
              </p>
            )}
            <button
              onClick={handleSave}
              disabled={status === "saving"}
              className="py-2.5 px-6 bg-[#1a1a2e] hover:bg-[#252545] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {status === "saving" ? (
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
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
