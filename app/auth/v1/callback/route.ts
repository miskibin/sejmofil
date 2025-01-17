import { createClient } from "@/utils/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);

    // Redirect to the home page after successful authentication
    return NextResponse.redirect(new URL("/", requestUrl.origin));
  }

  // If no code is present, redirect to login page
  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}
