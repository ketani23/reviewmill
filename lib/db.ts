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
      "id, owner_email, business_name, google_account_id, brand_voice, business_type, voice_tone, custom_instructions, notifications_enabled, notification_email, created_at"
    )
    .eq("owner_email", email)
    .single();
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
  const { error } = await supabase
    .from("businesses")
    .update(data)
    .eq("owner_email", email);
  if (error) throw error;
}
