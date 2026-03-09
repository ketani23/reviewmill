import { getSession } from "@/lib/session";
import { getBusinessByEmail } from "@/lib/db";
import { DashboardContent } from "@/components/DashboardContent";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();

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
          <a
            href="/api/auth/google"
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#1a1a2e] text-white rounded-xl font-medium hover:bg-[#252545] transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
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
            Connect Google Business
          </a>
          <p className="text-xs text-gray-400 mt-4">
            We only request permission to manage your business reviews.
          </p>
        </div>
      </div>
    );
  }

  // Fetch business to get real name and check onboarding status
  let businessName = session.name ?? "Your Business";
  let hasGoogleConnection = false;
  let businessId: string | null = null;
  try {
    const business = await getBusinessByEmail(session.email);
    if (!business || !business.business_type) {
      redirect("/onboarding");
    }
    if (business?.business_name) {
      businessName = business.business_name;
    }
    businessId = business?.id ?? null;
    hasGoogleConnection = !!(business?.google_account_id && business?.google_location_id);
  } catch {
    // DB error — show dashboard with fallback name
  }

  return (
    <DashboardContent
      email={session.email}
      name={session.name}
      businessName={businessName}
      hasGoogleConnection={hasGoogleConnection}
      businessId={businessId}
    />
  );
}
