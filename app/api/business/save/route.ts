import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { updateBusinessProfile } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    business_name,
    business_type: rawBusinessType,
    voice_tone,
    custom_instructions,
    notifications_enabled,
    notification_email,
  } = body;

  // Normalize business_type to lowercase with underscores so title-case values from the frontend work
  const business_type =
    typeof rawBusinessType === "string"
      ? rawBusinessType.toLowerCase().replace(/\s+/g, "_")
      : rawBusinessType;

  // Validate input types and values
  const VALID_BUSINESS_TYPES = ["restaurant", "salon", "dentist", "auto_shop", "other"];
  const VALID_VOICE_TONES = ["professional", "friendly", "casual"];
  const MAX_NAME_LENGTH = 200;
  const MAX_INSTRUCTIONS_LENGTH = 1000;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (business_name !== undefined && (typeof business_name !== "string" || business_name.length > MAX_NAME_LENGTH)) {
    return NextResponse.json({ error: "Invalid business_name" }, { status: 400 });
  }
  if (business_type !== undefined && !VALID_BUSINESS_TYPES.includes(business_type as string)) {
    return NextResponse.json({ error: `Invalid business_type. Must be one of: ${VALID_BUSINESS_TYPES.join(", ")}` }, { status: 400 });
  }
  if (voice_tone !== undefined && !VALID_VOICE_TONES.includes(voice_tone as string)) {
    return NextResponse.json({ error: `Invalid voice_tone. Must be one of: ${VALID_VOICE_TONES.join(", ")}` }, { status: 400 });
  }
  if (custom_instructions !== undefined && (typeof custom_instructions !== "string" || custom_instructions.length > MAX_INSTRUCTIONS_LENGTH)) {
    return NextResponse.json({ error: "Invalid custom_instructions (max 1000 chars)" }, { status: 400 });
  }
  if (notifications_enabled !== undefined && typeof notifications_enabled !== "boolean") {
    return NextResponse.json({ error: "Invalid notifications_enabled (must be boolean)" }, { status: 400 });
  }
  if (notification_email !== undefined && (typeof notification_email !== "string" || !EMAIL_REGEX.test(notification_email))) {
    return NextResponse.json({ error: "Invalid notification_email" }, { status: 400 });
  }

  try {
    await updateBusinessProfile(session.email, {
      ...(business_name !== undefined && { business_name: (business_name as string).trim() }),
      ...(business_type !== undefined && { business_type: business_type as string }),
      ...(voice_tone !== undefined && { voice_tone: voice_tone as string }),
      ...(custom_instructions !== undefined && { custom_instructions: (custom_instructions as string).trim() }),
      ...(notifications_enabled !== undefined && { notifications_enabled: notifications_enabled as boolean }),
      ...(notification_email !== undefined && { notification_email: (notification_email as string).trim() }),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if ((err as Error & { code?: string }).code === "BUSINESS_NOT_FOUND") {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }
    console.error("Failed to save business profile:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
