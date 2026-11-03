import { NextRequest, NextResponse } from "next/server";
import { searchAlbums } from "@/lib/spotify";
import { apiError } from "@/lib/api/errors";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return apiError(400, "MISSING_QUERY", "Please provide a search term.");
  }

  try {
    const albums = await searchAlbums(q);
    return NextResponse.json({ albums });
  } catch {
    return apiError(502, "SPOTIFY_ERROR", "Could not reach Spotify.");
  }
}