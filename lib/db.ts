import { createSupabaseClient } from "./supabase-server";

export type Business = {
  id: string;
  owner_email: string;
  business_name: string | null;
  google_account_id: string | null;
  brand_voice: string;
  business_type: string | null;
  voice_tone: string | null;
  custom_instructions: string | null;
  notifications_enabled: boolean;
  notification_email: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: string;
  trial_ends_at: string | null;
  created_at: string;
};

export async function upsertBusiness(data: {
  owner_email: string;
  business_name?: string | null;
  google_account_id?: string;
  google_access_token?: string;
  google_refresh_token?: string;
}): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("businesses")
    .upsert(data, { onConflict: "owner_email" });
  if (error) throw error;
}

export async function getBusinessByEmail(
  email: string
): Promise<Business | null> {
  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("businesses")
    .select(
      "id, owner_email, business_name, google_account_id, brand_voice, business_type, voice_tone, custom_instructions, notifications_enabled, notification_email, stripe_customer_id, stripe_subscription_id, plan, trial_ends_at, created_at"
    )
    .eq("owner_email", email)
    .single();
  return data ?? null;
}

export async function updateBusinessStripe(
  email: string,
  data: {
    stripe_customer_id?: string | null;
    stripe_subscription_id?: string | null;
    plan?: string;
    trial_ends_at?: string | null;
  }
): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("businesses")
    .update(data)
    .eq("owner_email", email);
  if (error) throw error;
}

export async function getBusinessByStripeCustomerId(
  stripeCustomerId: string
): Promise<Business | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("businesses")
    .select(
      "id, owner_email, business_name, google_account_id, brand_voice, business_type, voice_tone, custom_instructions, notifications_enabled, notification_email, stripe_customer_id, stripe_subscription_id, plan, trial_ends_at, created_at"
    )
    .eq("stripe_customer_id", stripeCustomerId)
    .single();
  // PGRST116 = no rows found, which is expected (not an error)
  if (error && error.code !== "PGRST116") throw error;
  return data ?? null;
}

export async function updateBusinessProfile(
  email: string,
  data: {
    business_name?: string;
    business_type?: string;
    voice_tone?: string;
    custom_instructions?: string;
    notifications_enabled?: boolean;
    notification_email?: string;
  }
): Promise<void> {
  const supabase = createSupabaseClient();
  const { data: rows, error } = await supabase
    .from("businesses")
    .update(data)
    .eq("owner_email", email)
    .select("id");
  if (error) throw error;
  if (!rows || rows.length === 0) {
    const notFound = new Error("Business not found");
    (notFound as Error & { code: string }).code = "BUSINESS_NOT_FOUND";
    throw notFound;
  }
}
