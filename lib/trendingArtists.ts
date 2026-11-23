import { cacheLife } from "next/cache";
import { findArtist } from "./spotify";
import { trendingUS } from "./trending";
import type { Artist } from "./types";

// The artists behind Apple Music's most-played songs, in chart order,
// with their photos from Spotify.
export async function trendingArtists(): Promise<Artist[]> {
  // The chart changes about once a day, so remember the result for a few
  // hours instead of asking Apple and Spotify on every visit.
  "use cache";
  cacheLife("hours");

  const tracks: { artist: string }[] = await trendingUS();

  // "Drake & Don Toliver" -> "Drake"; a Set drops artists who appear twice
  const names = [...new Set(tracks.map((track) => leadArtist(track.artist)))].slice(0, 10);

  // Look up all the artists at the same time rather than one after another.
  return Promise.all(
    names.map(async (name) => {
      // if one lookup fails, still show the artist, just without a photo
      const match = await findArtist(name).catch(() => null);
      return {
        id: match?.spotifyId ?? name,
        name,
        imageUrl: match?.imageUrl ?? undefined,
      };
    }),
  );
}

// The first name in credits like "KAROL G, Judeline & rusowsky" or "A feat. B"
function leadArtist(credit: string) {
  return credit.split(/,| & | feat\. | x /i)[0].trim();
}
