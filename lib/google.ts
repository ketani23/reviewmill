import { createSupabaseClient } from "./supabase-server";

// --- Types ---

export type GoogleAccount = {
  name: string; // e.g. "accounts/123456"
  accountName: string;
  type: string;
};

export type GoogleLocation = {
  name: string; // e.g. "locations/789"
  title: string;
  storefrontAddress?: {
    addressLines?: string[];
    locality?: string;
    administrativeArea?: string;
  };
};

export type GoogleReview = {
  reviewId: string;
  reviewer: { displayName: string };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment: string;
  createTime: string;
  updateTime: string;
  reviewReply?: { comment: string; updateTime: string };
};

const STAR_RATING_MAP: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

export function starRatingToNumber(rating: string): number {
  return STAR_RATING_MAP[rating] ?? 0;
}

// --- Token Management ---

export async function refreshAccessToken(
  refreshToken: string
): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error(`Token refresh failed: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

export async function getValidAccessToken(businessId: string): Promise<string> {
  const supabase = createSupabaseClient();
  const { data: biz, error } = await supabase
    .from("businesses")
    .select("google_access_token, google_refresh_token")
    .eq("id", businessId)
    .single();

  if (error || !biz) throw new Error("Business not found");
  if (!biz.google_refresh_token) throw new Error("No Google refresh token stored");

  // Always try stored token first; caller should catch 401 and call refreshAndRetry
  return biz.google_access_token ?? (await refreshAccessToken(biz.google_refresh_token));
}

export async function refreshAndUpdateToken(businessId: string): Promise<string> {
  const supabase = createSupabaseClient();
  const { data: biz, error } = await supabase
    .from("businesses")
    .select("google_refresh_token")
    .eq("id", businessId)
    .single();

  if (error || !biz?.google_refresh_token) {
    throw new Error("No refresh token available");
  }

  const newToken = await refreshAccessToken(biz.google_refresh_token);

  await supabase
    .from("businesses")
    .update({ google_access_token: newToken })
    .eq("id", businessId);

  return newToken;
}

// --- Helper for fetch with auto-retry on 401 ---

async function googleFetch(
  url: string,
  accessToken: string,
  businessId: string,
  options: RequestInit = {}
): Promise<Response> {
  const doFetch = (token: string) =>
    fetch(url, {
      ...options,
      headers: {
        ...((options.headers as Record<string, string>) ?? {}),
        Authorization: `Bearer ${token}`,
      },
    });

  let res = await doFetch(accessToken);

  if (res.status === 401) {
    const newToken = await refreshAndUpdateToken(businessId);
    res = await doFetch(newToken);
  }

  return res;
}

// --- Google Business Profile API ---

export async function listAccounts(
  accessToken: string,
  businessId: string
): Promise<GoogleAccount[]> {
  const res = await googleFetch(
    "https://mybusinessbusinessinformation.googleapis.com/v1/accounts",
    accessToken,
    businessId
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`listAccounts failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.accounts ?? [];
}

export async function listLocations(
  accessToken: string,
  accountId: string,
  businessId: string
): Promise<GoogleLocation[]> {
  const res = await googleFetch(
    `https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations?readMask=name,title,storefrontAddress`,
    accessToken,
    businessId
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`listLocations failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.locations ?? [];
}

export async function listReviews(
  accessToken: string,
  accountId: string,
  locationId: string,
  businessId: string
): Promise<GoogleReview[]> {
  const allReviews: GoogleReview[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(
      `https://mybusiness.googleapis.com/v4/${accountId}/${locationId}/reviews`
    );
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await googleFetch(url.toString(), accessToken, businessId);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`listReviews failed (${res.status}): ${text}`);
    }

    const data = await res.json();
    if (data.reviews) allReviews.push(...data.reviews);
    pageToken = data.nextPageToken;
  } while (pageToken);

  return allReviews;
}

export async function replyToReview(
  accessToken: string,
  accountId: string,
  locationId: string,
  reviewId: string,
  comment: string,
  businessId: string
): Promise<void> {
  const res = await googleFetch(
    `https://mybusiness.googleapis.com/v4/${accountId}/${locationId}/reviews/${reviewId}/reply`,
    accessToken,
    businessId,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`replyToReview failed (${res.status}): ${text}`);
  }
}
