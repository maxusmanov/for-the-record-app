import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { albumFromParams } from "@/lib/ratings";
import RateView from "./RateView";

export default function RatePage({ searchParams }: PageProps<"/rate">) {
  return (
    <Suspense fallback={null}>
      <Gate searchParams={searchParams} />
    </Suspense>
  );
}

// Same check as the other pages: send logged out users to the login page.
async function Gate({ searchParams }: { searchParams: PageProps<"/rate">["searchParams"] }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  // The link can carry an album (from the album sheet) or a search to start with.
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";

  return <RateView initialAlbum={albumFromParams(params)} initialQuery={q} />;
}
