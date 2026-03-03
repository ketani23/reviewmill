import { createSupabaseClient } from "./supabase-server";

export type Business = {
  id: string;
  owner_email: string;
  business_name: string | null;
  google_account_id: string | null;
  brand_voice: string;
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
    .select("id, owner_email, business_name, google_account_id, brand_voice, created_at")
    .eq("owner_email", email)
    .single();
  return data ?? null;
}
