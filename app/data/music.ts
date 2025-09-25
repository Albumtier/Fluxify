// app/data/music.ts

// Define Track type
export type Track = {
  id: string | number;
  title: string;
  file: string;
  cover: string;
  duration?: number; // duration in seconds
};

export const artist = {
  name: "David",
  image: "/images/artist.jpg", // place this in public/images/artist.jpg
};

export const latestRelease = {
  title: "Healing Hurts",
  cover: "/images/healing-hurts.jpg",
  year: 2025,
  type: "Single",
  slug: "healing-hurts", // ✅ this must match the URL
  tracks: [
    {
      id: "healing-hurts",
      title: "Healing Hurts",
      file: "/music/healing-hurts.mp3",
      duration: 208,
      cover: "/images/healing-hurts.jpg", // place in public/music/
    },
  ],
};

export const musingsAlbum = {
  title: "Musings",
  cover: "/images/musings.jpg",
  year: 2025,
  type: "Album",
  slug: "musings", // ✅ this must match the URL
  tracks: [
    { id: "1", title: "Musings", file: "/music/01-musings.mp3", cover: "/images/musings.jpg", duration: 209 },
    { id: "2", title: "Love Comes, Love Goes", file: "/music/02-love-comes-love-goes.mp3", cover: "/images/musings.jpg", duration: 163 },
    { id: "3", title: "Let You Go", file: "/music/03-let-you-go.mp3", cover: "/images/musings.jpg", duration: 144 },
    { id: "4", title: "I Hope You Know Love", file: "/music/04-i-hope-you-know-love.mp3", cover: "/images/musings.jpg", duration: 225 },
    { id: "5", title: "Drowning", file: "/music/05-drowning.mp3", cover: "/images/musings.jpg", duration: 219 },
    { id: "6", title: "Get Over You", file: "/music/06-get-over-you.mp3", cover: "/images/musings.jpg", duration: 195 },
    { id: "7", title: "Solo Tú", file: "/music/07-solo-tu.mp3", cover: "/images/musings.jpg", duration: 151 },
    { id: "8", title: "One Request", file: "/music/08-one-request.mp3", cover: "/images/musings.jpg", duration: 141 },
    { id: "9", title: "Musings (slowed + reverb)", file: "/music/09-musings-slowed-reverb.mp3", cover: "/images/musings.jpg", duration: 241 },
    { id: "10", title: "Love Comes, Love Goes (stripped)", file: "/music/10-love-comes-love-goes-stripped.mp3", cover: "/images/musings.jpg", duration: 154 },
    { id: "11", title: "Love Comes, Love Goes (stripped + slowed + reverb)", file: "/music/11-love-comes-love-goes-stripped-slowed-reverb.mp3", cover: "/images/musings.jpg", duration: 181 },
  ],
};


export const didYou = {
  title: "Did You?",
  cover: "/images/did-you.jpg", // put in public/images/
  year: 2025,
  type: "Single",
  slug: "did-you",
  tracks: [
    {
      id: "did-you",
      title: "Did You?",
      file: "/music/did-you.mp3",
      cover: "/images/did-you.jpg",
      duration: 165, // duration in seconds
    },
  ],
};

export const rud1 = {
  title: "R-U-D-1?",
  cover: "/images/rud1.jpg", // put in public/images/
  year: 2025,
  type: "Single",
  slug: "rud1",
  tracks: [
    {
      id: "rud1",
      title: "R-U-D-1?",
      file: "/music/rud1.mp3",
      cover: "/images/rud1.jpg",
      duration: 238,
    },
  ],
};


export const discography = [latestRelease, rud1, didYou, musingsAlbum];

// Pick some as “popular tracks” (you can reorder)
export const popularTracks = [
  musingsAlbum.tracks[1], // Love Comes, Love Goes
  musingsAlbum.tracks[2], // Let You Go
  musingsAlbum.tracks[4], // Drowning
  latestRelease.tracks[0], // Healing Hurts
];

// Flatten everything for “Play All”
export const allTracks = [
  ...latestRelease.tracks,
  ...musingsAlbum.tracks,
  ...didYou.tracks,
  ...rud1.tracks,
];
