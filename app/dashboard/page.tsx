import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mockReviews } from "@/lib/mockData";
import { ReviewCard } from "@/components/ReviewCard";
import { SignInButton, SignOutButton } from "@/components/AuthButtons";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-[#1a1a2e] rounded-full flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-7 h-7 text-[#e8a838]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a2e] mb-2">ReviewGuard</h1>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">
            Connect your Google Business Profile to start monitoring reviews and
            generating AI-drafted responses in seconds.
          </p>
          <SignInButton />
          <p className="text-xs text-gray-400 mt-4">
            We only request permission to manage your business reviews.
          </p>
        </div>
      </div>
    );
  }

  const awaiting = mockReviews.filter(
    (r) => r.response_status === "pending" || r.response_status === "drafted"
  ).length;
  const approved = mockReviews.filter(
    (r) => r.response_status === "approved" || r.response_status === "sent"
  ).length;
  const avgRating =
    mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-[#1a1a2e] text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-tight">ReviewGuard</span>
            <span className="text-[#e8a838] text-sm font-medium hidden sm:inline">
              Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300 hidden sm:inline">
              {session.user?.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Business header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#1a1a2e]">Tony&apos;s Pizzeria</h2>
          <p className="text-sm text-gray-400">
            Google Business Profile &middot;{" "}
            <span className="text-amber-500 font-medium">Demo Mode</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-[#1a1a2e]">{mockReviews.length}</p>
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
          {mockReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center mt-8">
          Showing demo data for Tony&apos;s Pizzeria — real Google Business
          reviews will appear here once the API connection is live.
        </p>
      </main>
    </div>
  );
}
