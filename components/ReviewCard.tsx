"use client";

import { useState } from "react";
import { Review } from "@/lib/mockData";

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
  if (rating >= 4) return { label: rating === 5 ? "Excellent" : "Good", color: "text-green-600" };
  if (rating === 3) return { label: "Average", color: "text-yellow-600" };
  return { label: rating === 2 ? "Poor" : "Critical", color: "text-red-600" };
}

export function ReviewCard({ review }: { review: Review }) {
  const [status, setStatus] = useState<Review["response_status"]>(
    review.response_status
  );
  const [draft, setDraft] = useState(review.drafted_response);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(review.drafted_response);

  const { label, color } = ratingMeta(review.rating);

  const saveEdit = () => {
    setDraft(editValue);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditValue(draft);
    setIsEditing(false);
  };

  const isResolved = status === "approved" || status === "sent";

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
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            status === "approved" || status === "sent"
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {status === "approved" || status === "sent" ? "Approved" : "Draft Ready"}
        </span>
      </div>

      {/* Customer review */}
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <p className="text-sm text-gray-700 leading-relaxed">{review.review_text}</p>
      </div>

      {/* AI drafted response */}
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

      {/* Action buttons */}
      {isResolved ? (
        <div className="flex items-center gap-2 text-green-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">Response approved</span>
        </div>
      ) : isEditing ? (
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
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setStatus("approved")}
            className="flex-1 py-2 px-3 bg-[#e8a838] text-white text-sm font-medium rounded-lg hover:bg-[#d4922a] transition-colors"
          >
            Approve Response
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="py-2 px-3 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
}
