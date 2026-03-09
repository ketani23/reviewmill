import { createSupabaseClient } from "./supabase-server";

export type Business = {
  id: string;
  owner_email: string;
  business_name: string | null;
  google_account_id: string | null;
  google_location_id: string | null;
  google_location_name: string | null;
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

export type DBReview = {
  id: string;
  business_id: string;
  google_review_id: string | null;
  google_account_id: string | null;
  google_location_id: string | null;
  reviewer_name: string;
  rating: number;
  review_text: string;
  review_date: string;
  drafted_response: string;
  response_status: "pending" | "drafted" | "approved" | "sent" | "responded";
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
  const { data, error } = await supabase
    .from("businesses")
    .select(
      "id, owner_email, business_name, google_account_id, google_location_id, google_location_name, brand_voice, business_type, voice_tone, custom_instructions, notifications_enabled, notification_email, stripe_customer_id, stripe_subscription_id, plan, trial_ends_at, created_at"
    )
    .eq("owner_email", email)
    .single();
  // PGRST116 = no rows found, which is expected
  if (error && error.code !== "PGRST116") throw error;
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
      "id, owner_email, business_name, google_account_id, google_location_id, google_location_name, brand_voice, business_type, voice_tone, custom_instructions, notifications_enabled, notification_email, stripe_customer_id, stripe_subscription_id, plan, trial_ends_at, created_at"
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

export async function updateBusinessLocation(
  businessId: string,
  data: {
    google_account_id?: string;
    google_location_id?: string;
    google_location_name?: string;
  }
): Promise<void> {
  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("businesses")
    .update(data)
    .eq("id", businessId);
  if (error) throw error;
}

// --- Review helpers ---

export async function getReviewsByBusiness(
  businessId: string
): Promise<DBReview[]> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("business_id", businessId)
    .order("review_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DBReview[];
}

export async function getReviewById(
  reviewId: string
): Promise<DBReview | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("id", reviewId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return (data as DBReview) ?? null;
}

export async function upsertReview(review: {
  business_id: string;
  google_review_id: string;
  google_account_id: string;
  google_location_id: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
  review_date: string;
}): Promise<{ isNew: boolean; id: string }> {
  const supabase = createSupabaseClient();

  // Check if already exists
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("google_review_id", review.google_review_id)
    .single();

  if (existing) {
    // Update existing review (text/rating may change)
    await supabase
      .from("reviews")
      .update({
        reviewer_name: review.reviewer_name,
        rating: review.rating,
        review_text: review.review_text,
      })
      .eq("id", existing.id);
    return { isNew: false, id: existing.id };
  }

  // Insert new review
  const { data: inserted, error } = await supabase
    .from("reviews")
    .insert(review)
    .select("id")
    .single();
  if (error) throw error;
  return { isNew: true, id: inserted!.id };
}

export async function updateReviewStatus(
  reviewId: string,
  status: string,
  draftedResponse?: string
): Promise<void> {
  const supabase = createSupabaseClient();
  const update: Record<string, string> = { response_status: status };
  if (draftedResponse !== undefined) update.drafted_response = draftedResponse;
  const { error } = await supabase
    .from("reviews")
    .update(update)
    .eq("id", reviewId);
  if (error) throw error;
}
