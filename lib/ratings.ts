import type { Album, Rating, RatingInput } from "./types";

// The one place that decides how many stars there are.
// The team spec says 1 to 5 stars, so change this if that changes.
export const MAX_STARS = 5;

// Until the /api/ratings endpoints are merged, ratings are saved in this
// browser only, so the whole flow still works. Once the backend is ready,
// put NEXT_PUBLIC_MOCK_RATINGS=false in .env.local to use the real API.
const USE_MOCK = process.env.NEXT_PUBLIC_MOCK_RATINGS !== "false";
const MOCK_KEY = "ftr-mock-ratings";

function readMock(): Rating[] {
  try {
    return JSON.parse(localStorage.getItem(MOCK_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeMock(ratings: Rating[]) {
  try {
    localStorage.setItem(MOCK_KEY, JSON.stringify(ratings));
  } catch {
    // storage can be blocked, the rating just won't be remembered
  }
}

// Turns a Spotify search result into the data we send when rating it.
export function toRatingInput(album: Album, stars: number): RatingInput {
  return {
    spotifyAlbumId: album.id,
    rating: stars,
    albumName: album.title,
    artistName: album.artist,
    coverUrl: album.coverUrl ?? null,
    releaseYear: album.year ? String(album.year) : null,
  };
}

// GET /api/ratings: the logged in user's ratings.
export async function fetchRatings(): Promise<Rating[]> {
  if (USE_MOCK) return readMock();

  const res = await fetch("/api/ratings");
  if (!res.ok) throw new Error("could not load ratings");
  const data: { ratings?: Rating[] } = await res.json();
  return data.ratings ?? [];
}

// POST /api/ratings for a new rating, PATCH /api/ratings to change one.
export async function saveRating(input: RatingInput, alreadyRated: boolean): Promise<Rating> {
  if (USE_MOCK) {
    const others = readMock().filter((r) => r.spotifyAlbumId !== input.spotifyAlbumId);
    const saved: Rating = { id: input.spotifyAlbumId, ratedAt: new Date().toISOString(), ...input };
    writeMock([saved, ...others]);
    return saved;
  }

  const send = (method: "POST" | "PATCH") =>
    fetch("/api/ratings", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        method === "PATCH" ? { spotifyAlbumId: input.spotifyAlbumId, rating: input.rating } : input,
      ),
    });

  let res = await send(alreadyRated ? "PATCH" : "POST");
  // already rated on another device or tab: change it instead
  if (res.status === 409) res = await send("PATCH");
  if (!res.ok) throw new Error("could not save rating");

  const data: { rating: Rating } = await res.json();
  return data.rating;
}
