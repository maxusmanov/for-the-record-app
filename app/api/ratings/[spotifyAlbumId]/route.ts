import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiError } from "@/lib/api/errors";

const SPOTIFY_ALBUM_ID_RE = /^[A-Za-z0-9]{22}$/;

function isValidRating(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ spotifyAlbumId: string }> },
) {
  const { spotifyAlbumId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return apiError(401, "UNAUTHORIZED", "Please log in.");
  }

  if (!spotifyAlbumId || !SPOTIFY_ALBUM_ID_RE.test(spotifyAlbumId)) {
    return apiError(
      400,
      "INVALID_ALBUM_ID",
      "A valid Spotify album ID is required.",
    );
  }

  const { data, error } = await supabase
    .from("ratings")
    .select(
      "id, user_id, spotify_album_id, rating, review, album_name, artist_name, album_cover_url, rated_at, updated_at",
    )
    .eq("spotify_album_id", spotifyAlbumId)
    .order("rated_at", { ascending: false });

  if (error) {
    return apiError(500, "DATABASE_ERROR", "Could not load ratings.");
  }

  return NextResponse.json({
    spotifyAlbumId,
    total: data?.length ?? 0,
    ratings: data ?? [],
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ spotifyAlbumId: string }> },
) {
  const { spotifyAlbumId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return apiError(401, "UNAUTHORIZED", "Please log in.");
  }

  if (!spotifyAlbumId || !SPOTIFY_ALBUM_ID_RE.test(spotifyAlbumId)) {
    return apiError(
      400,
      "INVALID_ALBUM_ID",
      "A valid Spotify album ID is required.",
    );
  }

  let body: any;

  try {
    body = await request.json();
  } catch {
    return apiError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  const rating = body?.rating;
  const review = typeof body?.review === "string" ? body.review.trim() : null;
  const albumName =
    typeof body?.album_name === "string" ? body.album_name.trim() : null;
  const artistName =
    typeof body?.artist_name === "string" ? body.artist_name.trim() : null;
  const albumCoverUrl =
    typeof body?.album_cover_url === "string"
      ? body.album_cover_url.trim()
      : null;

  if (!isValidRating(rating)) {
    return apiError(
      400,
      "INVALID_RATING",
      "Rating must be an integer between 1 and 5.",
    );
  }

  if (review !== null && review.length > 2000) {
    return apiError(
      400,
      "INVALID_REVIEW",
      "Review must be 2000 characters or fewer.",
    );
  }

  const payload = {
    user_id: user.id,
    spotify_album_id: spotifyAlbumId,
    rating,
    review,
    album_name: albumName,
    artist_name: artistName,
    album_cover_url: albumCoverUrl,
  };

  const { data, error } = await supabase
    .from("ratings")
    .upsert(payload, {
      onConflict: "user_id,spotify_album_id",
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) {
    return apiError(500, "DATABASE_ERROR", "Could not save rating.");
  }

  return NextResponse.json(
    {
      message: "Rating saved.",
      rating: data,
    },
    { status: 200 },
  );
}
