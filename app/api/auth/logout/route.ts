import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete("rg_session");
  return NextResponse.redirect(new URL("/dashboard", "https://reviewmill.vercel.app"));
}
