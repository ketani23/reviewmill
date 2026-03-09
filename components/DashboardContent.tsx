"use client";

import { useState, useEffect, useCallback } from "react";
import { Review, mockReviews, SIMULATE_POOL } from "@/lib/mockData";
import { ReviewCard } from "@/components/ReviewCard";
import { ToastProvider, useToast } from "@/components/Toast";
import { AppHeader } from "@/components/AppHeader";

type Props = {
  email: string;
  name: string;
  businessName: string;
  hasGoogleConnection: boolean;
  businessId: string | null;
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

type DashboardReview = Review & {
  google_review_id?: string | null;
};

function DashboardInner({ email, businessName, hasGoogleConnection, businessId }: Props) {
  const [reviews, setReviews] = useState<DashboardReview[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(hasGoogleConnection);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const { showToast } = useToast();

  const fetchReviews = useCallback(async () => {
    if (!businessId) return;
    try {
      const res = await fetch(`/api/reviews/list?businessId=${businessId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
          setIsLiveMode(true);
          return;
        }
      }
    } catch {
      // Fall through to mock data
    }
    setReviews(mockReviews);
    setIsLiveMode(false);
  }, [businessId]);

  useEffect(() => {
    if (hasGoogleConnection && businessId) {
      setIsLoading(true);
      fetchReviews().finally(() => setIsLoading(false));
    } else {
      setReviews(mockReviews);
      setIsLiveMode(false);
    }
  }, [hasGoogleConnection, businessId, fetchReviews]);

  const awaiting = reviews.filter(
    (r) => r.response_status === "pending" || r.response_status === "drafted"
  ).length;
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const syncReviews = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/reviews/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Sync failed", "error");
        return;
      }
      showToast(
        `Synced ${data.total} reviews (${data.newCount} new)`,
        data.newCount > 0 ? "success" : "info"
      );
      setLastSynced(new Date().toLocaleTimeString());
      await fetchReviews();
    } catch {
      showToast("Sync failed. Please try again.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const simulateNewReview = async () => {
    setIsSimulating(true);
    try {
      const template =
        SIMULATE_POOL[Math.floor(Math.random() * SIMULATE_POOL.length)];

      const newReview: DashboardReview = {
        id: `sim-${Date.now()}`,
        reviewer_name: template.reviewer_name,
        rating: template.rating,
        review_text: template.review_text,
        review_date: new Date().toISOString().split("T")[0],
        drafted_response: "",
        response_status: "pending",
      };

      setReviews((prev) => [newReview, ...prev]);

      const notifRes = await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName,
          review: newReview,
        }),
      });

      if (!notifRes.ok) {
        showToast("Review added, but email notification failed.", "error");
      } else {
        const notifData = await notifRes.json();
        const emailMsg =
          notifData.mode === "live"
            ? "Email notification sent!"
            : "Email logged (configure Resend to send)";
        showToast(
          `New ${template.rating}\u2605 review from ${template.reviewer_name} \u2014 ${emailMsg}`,
          "info"
        );
      }
    } catch {
      showToast("Failed to simulate review. Please try again.", "error");
    } finally {
      setIsSimulating(false);
    }
  };

  const handlePostToGoogle = async (reviewId: string, responseText: string) => {
    try {
      const res = await fetch("/api/reviews/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, response_text: responseText }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to post reply", "error");
        return false;
      }
      showToast(
        data.posted ? "Response posted to Google!" : "Response saved.",
        "success"
      );
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, response_status: "responded" as const } : r
        )
      );
      return true;
    } catch {
      showToast("Failed to post reply. Please try again.", "error");
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader email={email} businessName={businessName} currentPage="dashboard" />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-center py-20">
            <Spinner />
            <span className="ml-3 text-gray-500">Loading reviews...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader email={email} businessName={businessName} currentPage="dashboard" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Business header + action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#1a1a2e]">{businessName}</h2>
            <p className="text-sm text-gray-400">
              Google Business Profile &middot;{" "}
              {isLiveMode ? (
                <span className="text-green-600 font-medium">Live</span>
              ) : (
                <span className="text-amber-500 font-medium">Demo Mode</span>
              )}
              {lastSynced && (
                <span className="text-gray-400"> &middot; Last synced {lastSynced}</span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {hasGoogleConnection && (
              <button
                onClick={syncReviews}
                disabled={isSyncing}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 shrink-0"
              >
                {isSyncing ? (
                  <>
                    <Spinner />
                    Syncing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sync Reviews
                  </>
                )}
              </button>
            )}
            {!isLiveMode && (
              <button
                onClick={simulateNewReview}
                disabled={isSimulating}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a1a2e] text-white text-sm font-medium rounded-xl hover:bg-[#252545] transition-colors disabled:opacity-60 shrink-0"
              >
                {isSimulating ? (
                  <>
                    <Spinner />
                    Simulating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Simulate New Review
                  </>
                )}
              </button>
            )}
          </div>
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
            <ReviewCard
              key={review.id}
              review={review}
              onToast={showToast}
              hasGoogleConnection={hasGoogleConnection}
              onPostToGoogle={handlePostToGoogle}
            />
          ))}
        </div>

        {!isLiveMode && (
          <p className="text-xs text-gray-400 text-center mt-8">
            Showing demo data for {businessName} &mdash; real Google Business reviews
            will appear here once the API connection is live.
          </p>
        )}
      </main>
    </div>
  );
}

export function DashboardContent({ email, name, businessName, hasGoogleConnection, businessId }: Props) {
  return (
    <ToastProvider>
      <DashboardInner email={email} name={name} businessName={businessName} hasGoogleConnection={hasGoogleConnection} businessId={businessId} />
    </ToastProvider>
  );
}
