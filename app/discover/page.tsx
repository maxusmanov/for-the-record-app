import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { trendingAlbums } from "@/lib/trending";
import { trendingArtists } from "@/lib/trendingArtists";
import Discover from "./Discover";

// The main screen after logging in.
export default function DiscoverPage() {
  return (
    <Suspense fallback={null}>
      <Gate />
    </Suspense>
  );
}

// Same check as the home and search pages: send logged out users to the login page.
async function Gate() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  // The charts are the same for everyone, so fetch them here on the server,
  // both at once. If one fails, show the page without that row.
  const [albums, artists] = await Promise.all([
    trendingAlbums().catch(() => []),
    trendingArtists().catch(() => []),
  ]);
  return <Discover albums={albums} artists={artists} />;
}
