import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// The link in the "confirm your email" message lands here. We trade the
// one-time code in the URL for a logged-in session, then go to /home.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();

  // Default Supabase email links send a `code`. Custom templates can send
  // `token_hash` + `type` instead, which also works in a different browser.
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("missing code") };

  // If it fails, the email is usually still confirmed, so they can just log in.
  return NextResponse.redirect(new URL(error ? "/login" : "/home", origin));
}
