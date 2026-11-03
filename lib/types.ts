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
};

export type Artist = {
  id: string;
  name: string;
  // Spotify no longer sends genres, so real artists won't have them
  genres?: string[];
  imageUrl?: string;
};
