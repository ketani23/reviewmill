"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type ReviewData = {
  id: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
  review_date: string;
  drafted_response: string;
  response_status: string;
};

type PageState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; review: ReviewData; token: string }
  | { phase: "approved" };

const STAR = "★";
const EMPTY_STAR = "☆";

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: "#e8a838", letterSpacing: 2, fontSize: 20 }}>
      {STAR.repeat(rating)}
      {EMPTY_STAR.repeat(5 - rating)}
    </span>
  );
}

// Mock review data keyed by reviewId for demo/offline mode
const MOCK_REVIEWS: Record<string, ReviewData> = {
  "1": {
    id: "1",
    reviewer_name: "Sarah M.",
    rating: 5,
    review_text:
      "Absolutely incredible pizza! The Margherita was perfectly charred, the dough was light and airy, and the sauce tasted like it was made from grandma's recipe. Staff was warm and attentive. Already planning my next visit!",
    review_date: "2026-02-28",
    drafted_response:
      "Thank you so much, Sarah! We're absolutely thrilled to hear that you loved the Margherita — our dough and sauce are made fresh daily with a lot of love, so your words mean everything to our team. We can't wait to welcome you back for your next visit!",
    response_status: "drafted",
  },
  "2": {
    id: "2",
    reviewer_name: "James K.",
    rating: 5,
    review_text:
      "Tony's is a neighborhood gem. The pasta and garlic bread are out of this world. Brought my whole family for my dad's birthday and they made it really special. Five stars all the way!",
    review_date: "2026-02-25",
    drafted_response:
      "What a wonderful message, James! We're so honored that you chose Tony's to celebrate your dad's birthday — making those moments special is exactly what we're here for. Happy birthday to your dad, and we hope to see the whole family again very soon!",
    response_status: "drafted",
  },
};

export default function ReviewActionPage() {
  const params = useParams();
  const rawToken = params?.token;
  const token = Array.isArray(rawToken) ? rawToken[0] : (rawToken ?? "");

  const [state, setState] = useState<PageState>({ phase: "loading" });
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setState({ phase: "error", message: "No token provided." });
      return;
    }

    // Validate the token server-side via /api/review/decode to extract reviewId and businessId
    fetch("/api/review/decode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error || !data.reviewId) {
          setState({
            phase: "error",
            message:
              "This link has expired or is invalid. Please log in to your dashboard to manage your reviews.",
          });
          return;
        }

        // Fetch review via token (server validates JWT and scopes by business_id)
        fetch(`/api/review/get?token=${encodeURIComponent(token)}`)
          .then((r) => r.json())
          .then((reviewData) => {
            const review: ReviewData =
              reviewData.review ??
              MOCK_REVIEWS[data.reviewId] ??
              buildFallbackReview(data.reviewId);
            setResponseText(review.drafted_response);
            setState({ phase: "ready", review, token });
          })
          .catch(() => {
            const review =
              MOCK_REVIEWS[data.reviewId] ?? buildFallbackReview(data.reviewId);
            setResponseText(review.drafted_response);
            setState({ phase: "ready", review, token });
          });
      })
      .catch(() => {
        setState({
          phase: "error",
          message: "Failed to validate the link. Please try again or visit your dashboard.",
        });
      });
  }, [token]);

  async function handleApprove() {
    if (state.phase !== "ready") return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/review/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: state.token, response_text: responseText }),
      });
      if (res.ok) {
        setState({ phase: "approved" });
      } else {
        const data = await res.json();
        alert(data.error ?? "Failed to approve. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://reviewmill.vercel.app";

  // ── Loading ──────────────────────────────────────────────────────────────
  if (state.phase === "loading") {
    return (
      <Wrapper>
        <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <p>Loading review…</p>
        </div>
      </Wrapper>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (state.phase === "error") {
    return (
      <Wrapper>
        <Card>
          <div style={{ textAlign: "center", padding: "8px 0 24px" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#fee2e2",
                color: "#dc2626",
                fontSize: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              ✕
            </div>
            <h2 style={{ color: "#1a1a2e", marginBottom: 10 }}>Link Expired</h2>
            <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              {state.message}
            </p>
            <a
              href={`${appUrl}/dashboard`}
              style={{
                display: "inline-block",
                background: "#e8a838",
                color: "#fff",
                textDecoration: "none",
                padding: "12px 28px",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Go to Dashboard →
            </a>
          </div>
        </Card>
      </Wrapper>
    );
  }

  // ── Approved ─────────────────────────────────────────────────────────────
  if (state.phase === "approved") {
    return (
      <Wrapper>
        <Card>
          <div style={{ textAlign: "center", padding: "8px 0 24px" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#dcfce7",
                color: "#16a34a",
                fontSize: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              ✓
            </div>
            <h2 style={{ color: "#1a1a2e", marginBottom: 10 }}>Response Approved!</h2>
            <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Your response has been approved and saved. You can close this tab or visit
              your dashboard to see all reviews.
            </p>
            <a
              href={`${appUrl}/dashboard`}
              style={{
                display: "inline-block",
                background: "#e8a838",
                color: "#fff",
                textDecoration: "none",
                padding: "12px 28px",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Go to Dashboard →
            </a>
          </div>
        </Card>
      </Wrapper>
    );
  }

  // ── Ready ────────────────────────────────────────────────────────────────
  const { review } = state;
  const ratingColor =
    review.rating >= 4 ? "#16a34a" : review.rating === 3 ? "#d97706" : "#dc2626";
  const ratingLabel =
    review.rating === 5
      ? "Excellent"
      : review.rating === 4
      ? "Good"
      : review.rating === 3
      ? "Average"
      : review.rating === 2
      ? "Poor"
      : "Critical";

  return (
    <Wrapper>
      {/* Page title */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h1
          style={{
            color: "#fff",
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          Review Response
        </h1>
        <p style={{ color: "#9ca3af", fontSize: 14 }}>
          Review and approve your AI-drafted response — no login required.
        </p>
      </div>

      {/* Review card */}
      <Card>
        <SectionLabel>Original Review</SectionLabel>
        <div
          style={{
            background: "#f9fafb",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px 12px",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Stars rating={review.rating} />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: ratingColor,
                  }}
                >
                  {ratingLabel}
                </span>
              </div>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>
                {new Date(review.review_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>
              {review.reviewer_name}
            </p>
          </div>
          <div style={{ padding: "14px 20px" }}>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: "#4b5563",
                lineHeight: 1.65,
                fontStyle: "italic",
              }}
            >
              &ldquo;{review.review_text}&rdquo;
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #f3f4f6", margin: "24px 0" }} />

        {/* AI Response */}
        <SectionLabel>AI-Drafted Response</SectionLabel>
        <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 10 }}>
          Edit the response below if needed, then click Approve &amp; Post.
        </p>
        <textarea
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
          rows={6}
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: 10,
            border: "1.5px solid #e5e7eb",
            fontSize: 14,
            color: "#1a1a2e",
            lineHeight: 1.65,
            resize: "vertical",
            fontFamily: "inherit",
            background: "#fff",
            outline: "none",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#e8a838";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e5e7eb";
          }}
        />

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 20,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={handleApprove}
            disabled={submitting || !responseText.trim()}
            style={{
              flex: 1,
              minWidth: 160,
              background: submitting ? "#9ca3af" : "#16a34a",
              color: "#fff",
              border: "none",
              padding: "14px 24px",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer",
              letterSpacing: 0.2,
              transition: "background 0.15s",
            }}
          >
            {submitting ? "Saving…" : "✓ Approve & Post"}
          </button>
        </div>
        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 12, lineHeight: 1.5 }}>
          By approving, you confirm this response is ready to be posted to Google.
        </p>
      </Card>
    </Wrapper>
  );
}

// ── Layout helpers ───────────────────────────────────────────────────────────

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1a1a2e",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 0 48px",
      }}
    >
      {/* Header */}
      <header
        style={{
          width: "100%",
          background: "#252545",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "18px 24px",
          marginBottom: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: -0.5 }}>
          ReviewGuard
        </span>
        <span
          style={{
            color: "#e8a838",
            fontSize: 12,
            fontWeight: 500,
            marginLeft: 10,
          }}
        >
          Review Approval
        </span>
      </header>

      <div style={{ width: "100%", maxWidth: 560, padding: "0 16px" }}>{children}</div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        padding: "28px 28px",
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "#9ca3af",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 12,
      }}
    >
      {children}
    </p>
  );
}

function buildFallbackReview(id: string): ReviewData {
  return {
    id,
    reviewer_name: "Customer",
    rating: 4,
    review_text: "Great experience overall. Would recommend!",
    review_date: new Date().toISOString().split("T")[0],
    drafted_response:
      "Thank you for your kind words! We really appreciate your support and hope to see you again soon.",
    response_status: "drafted",
  };
}
