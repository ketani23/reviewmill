"use client";

import { useState } from "react";
import { Review, mockReviews, SIMULATE_POOL } from "@/lib/mockData";
import { ReviewCard } from "@/components/ReviewCard";
import { ToastProvider, useToast } from "@/components/Toast";
import { AppHeader } from "@/components/AppHeader";

type Props = {
  email: string;
  name: string;
  businessName: string;
};

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
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
  );
}

function DashboardInner({ email, businessName }: Props) {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [isSimulating, setIsSimulating] = useState(false);
  const { showToast } = useToast();

  const awaiting = reviews.filter(
    (r) => r.response_status === "pending" || r.response_status === "drafted"
  ).length;
  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const simulateNewReview = async () => {
    setIsSimulating(true);
    try {
      const template =
        SIMULATE_POOL[Math.floor(Math.random() * SIMULATE_POOL.length)];

      const newReview: Review = {
        id: `sim-${Date.now()}`,
        reviewer_name: template.reviewer_name,
        rating: template.rating,
        review_text: template.review_text,
        review_date: new Date().toISOString().split("T")[0],
        drafted_response: "",
        response_status: "pending",
      };

      // Optimistic UI — add to top immediately
      setReviews((prev) => [newReview, ...prev]);

      const notifRes = await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName,
          review: newReview,
        }),
      });
      const notifData = await notifRes.json();

      const emailMsg =
        notifData.mode === "live"
          ? "Email notification sent!"
          : "Email logged (configure Resend to send)";
      showToast(
        `New ${template.rating}★ review from ${template.reviewer_name} — ${emailMsg}`,
        "info"
      );
    } catch {
      showToast("Failed to simulate review. Please try again.", "error");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader email={email} businessName={businessName} currentPage="dashboard" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Business header + simulate button */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#1a1a2e]">{businessName}</h2>
            <p className="text-sm text-gray-400">
              Google Business Profile &middot;{" "}
              <span className="text-amber-500 font-medium">Demo Mode</span>
            </p>
          </div>
          <button
            onClick={simulateNewReview}
            disabled={isSimulating}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a1a2e] text-white text-sm font-medium rounded-xl hover:bg-[#252545] transition-colors disabled:opacity-60 shrink-0"
          >
            {isSimulating ? (
              <>
                <Spinner />
                Simulating…
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Simulate New Review
              </>
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-[#1a1a2e]">{reviews.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total Reviews</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-amber-500">{awaiting}</p>
            <p className="text-xs text-gray-500 mt-1">Awaiting Approval</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-[#1a1a2e]">
              {avgRating.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Avg. Rating</p>
          </div>
        </div>

        {/* Reviews list */}
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Recent Reviews
        </h3>
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} onToast={showToast} />
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center mt-8">
          Showing demo data for {businessName} — real Google Business reviews
          will appear here once the API connection is live.
        </p>
      </main>
    </div>
  );
}

export function DashboardContent({ email, name, businessName }: Props) {
  return (
    <ToastProvider>
      <DashboardInner email={email} name={name} businessName={businessName} />
    </ToastProvider>
  );
}
