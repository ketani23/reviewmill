import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getBusinessByEmail } from "@/lib/db";
import { SettingsContent } from "@/components/SettingsContent";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/api/auth/google");

  let business = null;
  try {
    business = await getBusinessByEmail(session.email);
  } catch {
    // DB error — render with nulls, SettingsContent handles gracefully
  }

  return (
    <SettingsContent
      email={session.email}
      name={session.name}
      business={business}
    />
  );
}
