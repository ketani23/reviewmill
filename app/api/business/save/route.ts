import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { updateBusinessProfile } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    business_name,
    business_type,
    voice_tone,
    custom_instructions,
    notifications_enabled,
    notification_email,
  } = body;

  try {
    await updateBusinessProfile(session.email, {
      ...(business_name !== undefined && { business_name }),
      ...(business_type !== undefined && { business_type }),
      ...(voice_tone !== undefined && { voice_tone }),
      ...(custom_instructions !== undefined && { custom_instructions }),
      ...(notifications_enabled !== undefined && { notifications_enabled }),
      ...(notification_email !== undefined && { notification_email }),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to save business profile:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
