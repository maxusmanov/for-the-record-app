export type Album = {
  id: string;
  title: string;
  artist: string;
  year?: number;
  // Spotify search doesn't send genres or ratings, so these can be missing
  genres?: string[];
  // average of all ratings, out of 5
  averageRating?: number;
  coverUrl?: string;
  // "spotify" for Spotify search results, which are the only albums that can be
  // rated. Albums from Apple's chart don't have a Spotify id.
  source?: "spotify";
};

export type Artist = {
  id: string;
  name: string;
  // Spotify no longer sends genres, so real artists won't have them
  genres?: string[];
  imageUrl?: string;
};

// What the frontend sends to save a rating (POST /api/ratings).
// The album details are sent too, so the profile can show covers and titles
// without asking Spotify again.
export type RatingInput = {
  spotifyAlbumId: string;
  // whole stars, 1 to MAX_STARS (see lib/ratings.ts)
  rating: number;
  albumName: string;
  artistName: string;
  coverUrl: string | null;
  releaseYear: string | null;
  // the written review, if the user wrote one
  review?: string | null;
};

// What GET /api/ratings sends back for each saved rating.
export type Rating = RatingInput & {
  id: string;
  // ISO date text, like "2026-11-09T21:15:00Z"
  ratedAt: string;
};
