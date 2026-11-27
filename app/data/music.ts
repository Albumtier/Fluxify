// app/data/music.ts

export type Track = {
  id: string | number;
  title: string;
  file: string;
  duration: number;
  cover: string;
  artist: string;
  album?: string;
  lyricsFile?: string; 

  // Add these:
  dominantColor?: string;
  dominantTextColor?: string;
};

export type Release = {
  title: string;
  cover: string;
  year: number;
  type: "Single" | "Album" | "EP";
  slug: string;
  tracks: Track[];
  artist?: string; // optional
};

export function getTrackKey(track: Pick<Track, "id" | "file"> | string | number) {
  if (typeof track === "object") {
    return track.file || String(track.id);
  }

  return String(track);
}

export function getTrackStreamCount(
  track: Pick<Track, "id" | "file">,
  playCounts: Record<string, number>
) {
  return playCounts[getTrackKey(track)] ?? 0;
}

export function getReleaseStreamCount(
  release: Release,
  playCounts: Record<string, number>
) {
  return release.tracks.reduce(
    (total, track) => total + getTrackStreamCount(track, playCounts),
    0
  );
}

// Default artist
export const artist = {
  name: "David",
  image: "/images/artist.jpg",
};

// Helper to ensure each track has cover + artist
const withDefaults = (
  tracks: Array<Omit<Track, "cover" | "artist" | "album"> & Partial<Pick<Track, "cover" | "artist">>>,
  releaseCover: string,
  releaseTitle: string
): Track[] =>
  tracks.map((t) => ({
    ...t,
    cover: t.cover ?? releaseCover ?? "/images/default-cover.jpg",
    artist: t.artist ?? artist.name,
    album: releaseTitle, // NEW
  }));

export const latestRelease: Release = {
  title: "These Words Came From A Different Place",
  cover: "/images/TWCFADP.png",
  year: 2026,
  type: "EP",
  slug: "these-words-came-from-a-different-place",
  artist: "David",
  tracks: withDefaults([
    { id: "if-love-was-a-crime", title: "If Love Was A Crime", file: "/music/If-Love-Was-A-Crime.mp3", duration: 91 },
    { id: "if-you-were-a-god", title: "If You Were A God", file: "/music/If-You-Were-A-God.mp3", duration: 121 },
    { id: "if-i-were-a-scientist", title: "If I Were A Scientist", file: "/music/If-I-Were-A-Scientist.mp3", duration: 92 },
    { id: "one-way-road", title: "One Way Road", file: "/music/one-way-road.mp3", duration: 65 },
    { id: "dear-future-wife", title: "Dear Future Wife", file: "/music/dear-future-wife.mp3", duration: 100 },
  ], "/images/TWCFADP.png", "These Words Came From A Different Place"),
};

export const musingsThreeStep: Release = {
  title: "Musings (3 step remix)",
  cover: "/images/3-step.png",
  year: 2026,
  type: "Single",
  slug: "musings-3-step-remix",
  artist: "David",
  tracks: withDefaults([
    { id: "3-step", title: "Musings (3 step remix)", file: "/music/3-step.mp3", duration: 222 },
  ], "/images/3-step.png", "Musings (3 step remix)"),
};

export const noBeLamba: Release = {
  title: "No Be Lamba",
  cover: "/images/lamba.jpg",
  year: 2026,
  type: "Single",
  slug: "no-be-lamba",
  artist: "David",
  tracks: withDefaults([
    { id: "lamba", title: "No Be Lamba", file: "/music/lamba.mp3", duration: 178, lyricsFile: "lamba" },
  ], "/images/lamba.jpg", "No Be Lamba"),
};

export const healingExperience: Release = {
  title: "The Healing Experience",
  cover: "/images/the.png",
  year: 2025,
  type: "Album",
  slug: "the-healing-experience",
  artist: "David",
  tracks: withDefaults([
    { id: 1, title: "T.H.E.", file: "/music/the.mp3", duration: 104 },
    { id: 2, title: "Healing Hurts", file: "/music/healing-hurts.mp3", duration: 208, lyricsFile: "hurts" },
    { id: 3, title: "R-U-D-1?", file: "/music/rud1.mp3", duration: 238, lyricsFile: "the-one" },
    { id: 4, title: "SMLTIDHTAF", file: "/music/SMLTIDHTAF.mp3", duration: 238, lyricsFile: "sml" },
    { id: 5, title: "CMP", file: "/music/CMP.mp3", duration: 138, lyricsFile: "cmp" },
    { id: 6, title: "The Decision", file: "/music/the-decision.mp3", duration: 178 },
    { id: 7, title: "Goodbye", file: "/music/Goodbye.mp3", duration: 217, lyricsFile: "goodbye" },
    { id: 8, title: "Comment Tu T'appelle?", file: "/music/commentTu.mp3", duration: 175, lyricsFile: "comment" },
    { id: 9, title: "Did You?", file: "/music/did-you.mp3", duration: 165, lyricsFile: "did-you" },
    { id: 10, title: "Healing Hurts (AfroHouse Remix)", file: "/music/healing-hurts-rmx.mp3", duration: 201 },
    { id: 11, title: "AWYDCTLM", file: "/music/AWYDCTLM.mp3", duration: 88, lyricsFile: "awydctlm" },
  ],
  "/images/the.png",
  "The Healing Experience"
),
};

export const musingsAlbum: Release = {
  title: "Musings",
  cover: "/images/musings.jpg",
  year: 2025,
  type: "Album",
  slug: "musings",
  artist: "David",
  tracks: withDefaults([
    { id: 1, title: "Musings", file: "/music/01-musings.mp3", duration: 209, lyricsFile: "musings" },
    { id: 2, title: "Love Comes, Love Goes", file: "/music/02-love-comes-love-goes.mp3", duration: 163, lyricsFile: "love-comes" },
    { id: 3, title: "Let You Go", file: "/music/03-let-you-go.mp3", duration: 144, lyricsFile: "let-go" },
    { id: 4, title: "I Hope You Know Love", file: "/music/04-i-hope-you-know-love.mp3", duration: 225, lyricsFile: "hope-you-know" },
    { id: 5, title: "Drowning", file: "/music/05-drowning.mp3", duration: 219, lyricsFile: "drowning" },
    { id: 6, title: "Get Over You", file: "/music/06-get-over-you.mp3", duration: 195, lyricsFile: "get-over" },
    { id: 7, title: "Solo Tú", file: "/music/07-solo-tu.mp3", duration: 151, lyricsFile: "solo" },
    { id: 8, title: "One Request", file: "/music/08-one-request.mp3", duration: 141, lyricsFile: "request" },
    { id: 9, title: "Musings (slowed + reverb)", file: "/music/09-musings-slowed-reverb.mp3", duration: 241, lyricsFile: "musings" },
    { id: 10, title: "Love Comes, Love Goes (stripped)", file: "/music/10-love-comes-love-goes-stripped.mp3", duration: 154, lyricsFile: "love-comes" },
    { id: 11, title: "Love Comes, Love Goes (stripped + slowed + reverb)", file: "/music/11-love-comes-love-goes-stripped-slowed-reverb.mp3", duration: 181, lyricsFile: "love-comes" },
  ],
  "/images/musings.jpg",
  "Musings"
),
};

export const didYou: Release = {
  title: "Did You?",
  cover: "/images/did-you.jpg",
  year: 2025,
  type: "Single",
  slug: "did-you",
  artist: "David",
  tracks: withDefaults([
    { id: "did-you", title: "Did You?", file: "/music/did-you.mp3", duration: 165, lyricsFile: "did-you" },
  ],
  "/images/did-you.jpg",
  "Did You?"
),
};

export const rud1: Release = {
  title: "R-U-D-1?",
  cover: "/images/rud1.jpg",
  year: 2025,
  type: "Single",
  slug: "rud1",
  artist: "David",
  tracks: withDefaults([
    { id: "rud1", title: "R-U-D-1?", file: "/music/rud1.mp3", duration: 238, lyricsFile: "the-one" },
  ], "/images/rud1.jpg",
"R-U-D-1?"
),
};

export const healingHurts: Release = {
  title: "Healing Hurts",
  cover: "/images/healing-hurts.jpg",
  year: 2025,
  type: "Single",
  slug: "healing-hurts",
  artist: "David",
  tracks: withDefaults([
    { id: "healingHurts", title: "Healing Hurts", file: "/music/healing-hurts.mp3", duration: 208, lyricsFile: "hurts" },
  ],
  "/images/healing-hurts.jpg",
  "Healing Hurts"
),
};

export const commentTu: Release = {
  title: "Comment Tu T'appelles?",
  cover: "/images/comment.jpg",
  year: 2025,
  type: "Single",
  slug: "comment-tu-tappelles",
  artist: "David",
  tracks: withDefaults([
    { id: "commentTu", title: "Comment Tu T'appelles?", file: "/music/commentTu.mp3", duration: 175, lyricsFile: "comment" },
  ],
  "/images/comment.jpg",
  "Comment Tu T'appelles?"
),
};

export const smltidhtaf: Release = {
  title: "SMLTIDHTAF",
  cover: "/images/s.jpg",
  year: 2025,
  type: "Single",
  slug: "smltidhtaf",
  artist: "David",
  tracks: withDefaults([
    { id: "slmtidhtaf", title: "SMLTIDHTAF", file: "/music/SMLTIDHTAF.mp3", duration: 238, lyricsFile: "sml" },
  ],
  "/images/s.jpg",
  "SMLTIDHTAF"
),
};

export const discography = [latestRelease, musingsThreeStep, noBeLamba, healingExperience, smltidhtaf, commentTu, healingHurts, rud1, didYou, musingsAlbum];

// Popular tracks
export const popularTracks = [
  musingsAlbum.tracks[1],
  musingsAlbum.tracks[2],
  musingsAlbum.tracks[4],
  musingsThreeStep.tracks[0],
];

// Flatten all tracks
export const allTracks = [
  ...latestRelease.tracks,
  ...musingsThreeStep.tracks,
  ...noBeLamba.tracks,
  ...healingExperience.tracks,
  ...musingsAlbum.tracks,
  ...didYou.tracks,
  ...rud1.tracks,
];

const featuredTrackTitles = [
  "Musings",
  "Goodbye",
  "Solo Tú",
  "SMLTIDHTAF",
  "One Way Road",
  "One Request",
  "If I Were A Scientist",
  "Comment Tu T'appelle?",
  "Get Over You",
  "R-U-D-1?",
  "Did You?",
  "Drowning",
  "I Hope You Know Love",
  "Love Comes, Love Goes (stripped + slowed + reverb)",
  "The Decision",
  "Healing Hurts (AfroHouse Remix)",
  "Musings (3 step remix)",
  "Dear Future Wife",
  "AWYDCTLM",
];

export const thisIsDavidPlaylist = {
  title: "This is David",
  cover: "/images/playlist.png",
  slug: "this-is-david",
  description: "The best tracks, all in one playlist.",
  tracks: featuredTrackTitles
    .map((title) => allTracks.find((track) => track.title === title))
    .filter((track): track is Track => Boolean(track)),
};
