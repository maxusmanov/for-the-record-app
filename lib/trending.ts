import { cacheLife } from "next/cache";
import type { Album } from "./types";

export async function trendingUS() {
  const url =
    "https://rss.marketingtools.apple.com/api/v2/us/music/most-played/25/songs.json";
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`TRENDING_FAILED ${res.status}`);
  const data = await res.json();
  return data.feed.results.slice(0, 20).map((t: any, i: number) => ({
    rank: i + 1,
    name: t.name,
    artist: t.artistName,
    releaseDate: t.releaseDate,
    coverUrl: t.artworkUrl100?.replace("100x100", "600x600") ?? null,
    url: t.url,
  }));
}

// Apple Music's most-played albums in the US, in chart order.
export async function trendingAlbums(): Promise<Album[]> {
  // The chart changes about once a day, so remember it for a few hours.
  "use cache";
  cacheLife("hours");

  const url =
    "https://rss.marketingtools.apple.com/api/v2/us/music/most-played/10/albums.json";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TRENDING_ALBUMS_FAILED ${res.status}`);
  const data = await res.json();

  type AppleAlbum = {
    id: string;
    name: string;
    artistName: string;
    releaseDate?: string;
    artworkUrl100?: string;
    genres?: { name: string }[];
  };

  return data.feed.results.map((a: AppleAlbum) => ({
    id: a.id,
    title: a.name,
    artist: a.artistName,
    year: a.releaseDate ? Number(a.releaseDate.slice(0, 4)) : undefined,
    // every album is tagged "Music", which isn't a useful genre
    genres: a.genres?.map((g) => g.name).filter((name) => name !== "Music"),
    // ask Apple for a bigger cover than the 100px thumbnail
    coverUrl: a.artworkUrl100?.replace("100x100", "600x600"),
  }));
}
