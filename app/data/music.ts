// app/data/music.ts

export type Track = {
  id: string | number;
  title: string;
  file: string;
  duration: number;
  cover: string;
  artist: string;
};

export type Release = {
  title: string;
  cover: string;
  year: number;
  type: "Single" | "Album";
  slug: string;
  tracks: Track[];
  artist?: string; // optional
};

// Default artist
export const artist = {
  name: "David",
  image: "/images/artist.jpg",
};

// Helper to ensure each track has cover + artist
const withDefaults = (
  tracks: Array<Omit<Track, "cover" | "artist"> & Partial<Pick<Track, "cover" | "artist">>>,
  releaseCover: string
): Track[] =>
  tracks.map((t) => ({
    ...t,
    cover: t.cover ?? releaseCover ?? "/images/default-cover.jpg",
    artist: t.artist ?? artist.name,
  }));

export const latestRelease: Release = {
  title: "Healing Hurts",
  cover: "/images/healing-hurts.jpg",
  year: 2025,
  type: "Single",
  slug: "healing-hurts",
  artist: "David",
  tracks: withDefaults([
    { id: "healing-hurts", title: "Healing Hurts", file: "/music/healing-hurts.mp3", duration: 208 },
  ], "/images/healing-hurts.jpg"),
};

export const musingsAlbum: Release = {
  title: "Musings",
  cover: "/images/musings.jpg",
  year: 2025,
  type: "Album",
  slug: "musings",
  artist: "David",
  tracks: withDefaults([
    { id: 1, title: "Musings", file: "/music/01-musings.mp3", duration: 209 },
    { id: 2, title: "Love Comes, Love Goes", file: "/music/02-love-comes-love-goes.mp3", duration: 163 },
    { id: 3, title: "Let You Go", file: "/music/03-let-you-go.mp3", duration: 144 },
    { id: 4, title: "I Hope You Know Love", file: "/music/04-i-hope-you-know-love.mp3", duration: 225 },
    { id: 5, title: "Drowning", file: "/music/05-drowning.mp3", duration: 219 },
    { id: 6, title: "Get Over You", file: "/music/06-get-over-you.mp3", duration: 195 },
    { id: 7, title: "Solo Tú", file: "/music/07-solo-tu.mp3", duration: 151 },
    { id: 8, title: "One Request", file: "/music/08-one-request.mp3", duration: 141 },
    { id: 9, title: "Musings (slowed + reverb)", file: "/music/09-musings-slowed-reverb.mp3", duration: 241 },
    { id: 10, title: "Love Comes, Love Goes (stripped)", file: "/music/10-love-comes-love-goes-stripped.mp3", duration: 154 },
    { id: 11, title: "Love Comes, Love Goes (stripped + slowed + reverb)", file: "/music/11-love-comes-love-goes-stripped-slowed-reverb.mp3", duration: 181 },
  ], "/images/musings.jpg"),
};

export const didYou: Release = {
  title: "Did You?",
  cover: "/images/did-you.jpg",
  year: 2025,
  type: "Single",
  slug: "did-you",
  artist: "David",
  tracks: withDefaults([
    { id: "did-you", title: "Did You?", file: "/music/did-you.mp3", duration: 165 },
  ], "/images/did-you.jpg"),
};

export const rud1: Release = {
  title: "R-U-D-1?",
  cover: "/images/rud1.jpg",
  year: 2025,
  type: "Single",
  slug: "rud1",
  artist: "David",
  tracks: withDefaults([
    { id: "rud1", title: "R-U-D-1?", file: "/music/rud1.mp3", duration: 238 },
  ], "/images/rud1.jpg"),
};

export const discography = [latestRelease, rud1, didYou, musingsAlbum];

// Popular tracks
export const popularTracks = [
  musingsAlbum.tracks[1],
  musingsAlbum.tracks[2],
  musingsAlbum.tracks[4],
  latestRelease.tracks[0],
];

// Flatten all tracks
export const allTracks = [
  ...latestRelease.tracks,
  ...musingsAlbum.tracks,
  ...didYou.tracks,
  ...rud1.tracks,
];
