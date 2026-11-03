import { NextResponse } from "next/server";
import { trendingUS } from "@/lib/trending";
import { apiError } from "@/lib/api/errors";

export async function GET() {
  try {
    return NextResponse.json({ tracks: await trendingUS() });
  } catch {
    return apiError(502, "TRENDING_ERROR", "Could not load trending songs.");
  }
}