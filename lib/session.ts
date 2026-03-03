import { cookies } from "next/headers";

export interface RGSession {
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
  refreshToken?: string;
}

export async function getSession(): Promise<RGSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("rg_session")?.value;
  if (!raw) return null;

  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}
