import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getBusinessByEmail, updateBusinessLocation } from "@/lib/db";
import { getValidAccessToken, listAccounts, listLocations } from "@/lib/google";
import { checkOrigin } from "@/lib/csrf";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await getBusinessByEmail(session.email);
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  try {
    const accessToken = await getValidAccessToken(business.id);
    const accounts = await listAccounts(accessToken, business.id);

    const allLocations: Array<{
      accountId: string;
      accountName: string;
      locationId: string;
      locationName: string;
      address: string;
    }> = [];

    for (const account of accounts) {
      const accountId = account.name; // e.g. "accounts/123"
      const locations = await listLocations(accessToken, accountId, business.id);

      for (const loc of locations) {
        const addr = loc.storefrontAddress;
        const addressParts = [
          ...(addr?.addressLines ?? []),
          addr?.locality,
          addr?.administrativeArea,
        ].filter(Boolean);

        allLocations.push({
          accountId: accountId.replace("accounts/", ""),
          accountName: account.accountName,
          locationId: loc.name.replace("locations/", ""),
          locationName: loc.title,
          address: addressParts.join(", ") || "No address",
        });
      }
    }

    return NextResponse.json({
      locations: allLocations,
      currentLocationId: business.google_location_id,
    });
  } catch (err) {
    console.error("[LOCATIONS] Error:", err);
    const message = err instanceof Error ? err.message : "Failed to fetch locations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const originError = checkOrigin(req);
  if (originError) return originError;

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const business = await getBusinessByEmail(session.email);
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const body = await req.json();
  const { accountId, locationId, locationName } = body as {
    accountId?: string;
    locationId?: string;
    locationName?: string;
  };

  if (!accountId || !locationId) {
    return NextResponse.json(
      { error: "accountId and locationId are required" },
      { status: 400 }
    );
  }

  await updateBusinessLocation(business.id, {
    google_account_id: accountId,
    google_location_id: locationId,
    google_location_name: locationName ?? locationId,
  });

  return NextResponse.json({ success: true });
}
