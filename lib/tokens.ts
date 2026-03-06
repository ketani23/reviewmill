import { SignJWT, jwtVerify } from "jose";

const TOKEN_EXPIRY = "24h";

function getSecret(): Uint8Array {
  const secret = process.env.REVIEW_TOKEN_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("REVIEW_TOKEN_SECRET must be set in production");
    }
    return new TextEncoder().encode("dev-secret-change-in-production");
  }
  return new TextEncoder().encode(secret);
}

export async function generateReviewToken(
  reviewId: string,
  businessId: string
): Promise<string> {
  return new SignJWT({ reviewId, businessId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getSecret());
}

export async function verifyReviewToken(
  token: string
): Promise<{ reviewId: string; businessId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const { reviewId, businessId } = payload as {
      reviewId?: unknown;
      businessId?: unknown;
    };
    if (typeof reviewId !== "string" || typeof businessId !== "string") {
      return null;
    }
    return { reviewId, businessId };
  } catch {
    return null;
  }
}
