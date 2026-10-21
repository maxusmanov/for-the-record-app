import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/api/errors";

export async function GET() {
  const supabase = await createClient();

  // Ask Supabase who is logged in
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return apiError(401, "UNAUTHORIZED", "Please log in.");
  }

  // Look up this user's profile row
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return apiError(500, "DATABASE_ERROR", "Could not load profile.");
  }

  if (!profile) {
    return apiError(404, "PROFILE_NOT_FOUND", "No profile exists for this user.");
  }

  return NextResponse.json(profile);
}