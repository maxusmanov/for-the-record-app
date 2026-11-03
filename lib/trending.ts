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