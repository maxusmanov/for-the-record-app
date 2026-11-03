let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const id = process.env.SPOTIFY_CLIENT_ID!;
  const secret = process.env.SPOTIFY_CLIENT_SECRET!;
  const basic = Buffer.from(`${id}:${secret}`).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) throw new Error("SPOTIFY_TOKEN_FAILED");

  const data = await res.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

export async function searchAlbums(query: string) {
  const token = await getAccessToken();
  const url = `https://api.spotify.com/v1/search?type=album&limit=10&q=${encodeURIComponent(query)}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("SPOTIFY_SEARCH_FAILED");

  const data = await res.json();
  return data.albums.items.map((a: any) => ({
    spotifyId: a.id,
    name: a.name,
    artist: a.artists?.[0]?.name ?? "Unknown",
    releaseYear: a.release_date?.slice(0, 4) ?? null,
    coverUrl: a.images?.[0]?.url ?? null,
  }));
}