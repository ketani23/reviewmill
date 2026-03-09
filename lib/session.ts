import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

export interface RGSession {
  email: string;
  name: string;
  picture?: string;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is required. Generate one with: openssl rand -hex 32"
    );
  }
  return secret;
}

export function createSessionCookieValue(session: RGSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64");
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export async function getSession(): Promise<RGSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("rg_session")?.value;
  if (!raw) return null;

  try {
    const lastDot = raw.lastIndexOf(".");
    if (lastDot === -1) return null;

    const payload = raw.slice(0, lastDot);
    const sig = raw.slice(lastDot + 1);

    const expected = createHmac("sha256", getSecret()).update(payload).digest("hex");
    const sigBuf = Buffer.from(sig, "hex");
    const expBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    return JSON.parse(Buffer.from(payload, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}
