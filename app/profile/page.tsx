import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileView from "./ProfileView";

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <Gate />
    </Suspense>
  );
}

// Same check as the other pages: send logged out users to the login page.
async function Gate() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url")
    .eq("id", data.claims.sub)
    .single();

  return (
    <ProfileView
      name={profile?.display_name ?? data.claims.email ?? ""}
      username={profile?.username ?? null}
      avatarUrl={profile?.avatar_url ?? null}
    />
  );
}
