import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const body = await req.json();
  const { business_name, email, platform } = body;

  if (!business_name || !email || !platform) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const { error } = await supabase
    .from("waitlist")
    .insert([{ business_name, email, platform }]);

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "This email is already on the waitlist!" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to save signup" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
