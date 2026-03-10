"use client";

import { useState } from "react";
import { Review } from "@/lib/mockData";

type ExtendedStatus = Review["response_status"] | "responded";

type ReviewCardProps = {
  review: Review & { google_review_id?: string | null };
  onToast?: (message: string, type?: "success" | "info" | "error") => void;
  hasGoogleConnection?: boolean;
  onPostToGoogle?: (reviewId: string, responseText: string) => Promise<boolean>;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-[#e8a838]" : "text-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ratingMeta(rating: number): { label: string; color: string } {
  if (rating === 5) return { label: "Excellent", color: "text-green-600" };
  if (rating === 4) return { label: "Good", color: "text-green-600" };
  if (rating === 3) return { label: "Average", color: "text-yellow-600" };
  if (rating === 2) return { label: "Poor", color: "text-red-500" };
  return { label: "Critical", color: "text-red-600" };
}

function StatusBadge({ status }: { status: ExtendedStatus }) {
  const config = {
    pending: { label: "Pending", className: "bg-amber-100 text-amber-700" },
    drafted: { label: "Drafted", className: "bg-blue-100 text-blue-700" },
    approved: { label: "Approved", className: "bg-green-100 text-green-700" },
    sent: { label: "Sent", className: "bg-green-100 text-green-700" },
    responded: { label: "Posted", className: "bg-emerald-100 text-emerald-700" },
  }[status];

  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function Spinner() {
  return (
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
  );
}

export function ReviewCard({ review, onToast, hasGoogleConnection, onPostToGoogle }: ReviewCardProps) {
  const [status, setStatus] = useState<ExtendedStatus>(
    review.response_status
  );
  const [draft, setDraft] = useState(review.drafted_response);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(review.drafted_response);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const { label, color } = ratingMeta(review.rating);

  const generateDraft = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/draft-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: review.rating,
          reviewer_name: review.reviewer_name,
          review_text: review.review_text,
          business_name: "Tony's Pizzeria",
          brand_voice: "professional and friendly",
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      if (data.draft) {
        setDraft(data.draft);
        setEditValue(data.draft);
        setStatus("drafted");
        onToast?.("Response generated!");
      }
    } catch {
      onToast?.("Failed to generate response. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveEdit = () => {
    setDraft(editValue);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditValue(draft);
    setIsEditing(false);
  };

  const approve = () => {
    setStatus("approved");
    onToast?.("Response approved!");
  };

  const postToGoogle = async () => {
    if (!onPostToGoogle) return;
    setIsPosting(true);
    try {
      const success = await onPostToGoogle(review.id, draft);
      if (success) {
        setStatus("responded");
      }
    } finally {
      setIsPosting(false);
    }
  };

  const hasDraft = status === "drafted" || status === "approved" || status === "sent" || status === "responded";

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StarRating rating={review.rating} />
            <span className={`text-sm font-medium ${color}`}>{label}</span>
          </div>
          <p className="font-semibold text-gray-900">{review.reviewer_name}</p>
          <p className="text-xs text-gray-400">
            {new Date(review.review_date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Customer review */}
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <p className="text-sm text-gray-700 leading-relaxed">{review.review_text}</p>
      </div>

      {/* AI draft response */}
      {hasDraft && (
        <div className="border border-[#e8a838]/40 rounded-lg p-3 mb-4 bg-amber-50/40">
          <p className="text-xs font-semibold text-[#d4922a] mb-1.5 uppercase tracking-wide">
            AI Draft Response
          </p>
          {isEditing ? (
            <textarea
              className="w-full text-sm text-gray-700 leading-relaxed bg-white border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-[#e8a838] resize-none"
              rows={4}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed">{draft}</p>
          )}
        </div>
      )}

      {/* Action area */}
      {status === "pending" && (
        <button
          onClick={generateDraft}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1a1a2e] text-white text-sm font-medium rounded-lg hover:bg-[#252545] transition-colors disabled:opacity-60"
        >
          {isGenerating ? (
            <>
              <Spinner />
              Generating with Claude...
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Generate Response
            </>
          )}
        </button>
      )}

      {status === "drafted" && isEditing && (
        <div className="flex gap-2">
          <button
            onClick={saveEdit}
            className="flex-1 py-2 px-3 bg-[#1a1a2e] text-white text-sm font-medium rounded-lg hover:bg-[#252545] transition-colors"
          >
            Save Changes
          </button>
          <button
            onClick={cancelEdit}
            className="py-2 px-3 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {status === "drafted" && !isEditing && (
        <div className="flex gap-2">
          <button
            onClick={approve}
            className="flex-1 py-2 px-3 bg-[#e8a838] text-white text-sm font-medium rounded-lg hover:bg-[#d4922a] transition-colors"
          >
            Approve &amp; Send
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="py-2 px-3 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
        </div>
      )}

      {status === "approved" && hasGoogleConnection && review.google_review_id && (
        <button
          onClick={postToGoogle}
          disabled={isPosting}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
        >
          {isPosting ? (
            <>
              <Spinner />
              Posting to Google...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
              Post to Google
            </>
          )}
        </button>
      )}

      {status === "approved" && (!hasGoogleConnection || !review.google_review_id) && (
        <div className="flex items-center gap-2 text-green-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">Response approved</span>
        </div>
      )}

      {(status === "sent" || status === "responded") && (
        <div className="flex items-center gap-2 text-green-600">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-sm font-medium">
            {status === "responded" ? "Response posted to Google" : "Response approved"}
          </span>
        </div>
      )}
    </div>
  );
}
