import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getBusinessByEmail } from "@/lib/db";
import { OnboardingWizard } from "@/components/OnboardingWizard";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/api/auth/google");

  let business = null;
  try {
    business = await getBusinessByEmail(session.email);
  } catch {
    // DB error — continue to onboarding
  }

  // Skip onboarding if already completed
  if (business?.business_type) redirect("/dashboard");

  const defaultName = business?.business_name ?? session.name ?? "";

  return (
    <OnboardingWizard email={session.email} defaultName={defaultName} />
  );
}
