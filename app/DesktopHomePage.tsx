"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePlayer } from "./context/PlayerContext";
import { latestRelease, discography, allTracks, artist } from "./data/music";
import { FastAverageColor } from "fast-average-color";

export default function HomePage() {
  const { playTrack, currentTrack, isPlaying, getPopularTracks } = usePlayer();
  const popularTracks = getPopularTracks(allTracks, 4);
  const [artistColor, setArtistColor] = useState("#000");

  useEffect(() => {
    const fac = new FastAverageColor();
    fac.getColorAsync(artist.image)
      .then(color => setArtistColor(color.hex))
      .catch(() => setArtistColor("#000"));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <main className="flex-1 p-8 space-y-12 pb-40">

        {/* Artist Section with dynamic color */}
        <section
          className="flex items-center space-x-6 p-6 rounded-xl"
          style={{ background: artistColor }}
        >
          <Image
            src={artist.image}
            alt={artist.name}
            width={160}
            height={160}
            className="rounded-full shadow-lg object-cover"
          />
          <h1 className="text-5xl font-bold">{artist.name}</h1>
        </section>

        {/* Latest Release */}
        <section>
          <h2 className="text-3xl font-semibold mb-6">Latest Release</h2>
          <div className="flex items-center space-x-6">
            <Image
              src={latestRelease.cover}
              alt={latestRelease.title}
              width={200}
              height={200}
              className="rounded-xl shadow-lg object-cover"
            />
            <div>
              <h3 className="text-2xl font-bold">{latestRelease.title}</h3>
              <button
                onClick={() => playTrack(latestRelease.tracks[0], latestRelease.tracks)}
                className="mt-4 p-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 text-xl"
              >
                {isPlaying && currentTrack?.id === latestRelease.tracks[0].id ? "❚❚" : "▶"}
              </button>
            </div>
          </div>
        </section>

        {/* Popular Tracks */}
        <section>
          <h2 className="text-3xl font-semibold mb-6">Popular Tracks</h2>
          <ul className="space-y-4">
            {popularTracks.map((track) => (
              <li
                key={track.id}
                className="flex items-center justify-between bg-gray-900 px-4 py-3 rounded-lg shadow"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={track.cover || "/images/placeholder.jpg"}
                    alt={track.title}
                    width={50}
                    height={50}
                    className="rounded object-cover"
                  />
                  <span>{track.title}</span>
                </div>
                <button
                  onClick={() => playTrack(track)}
                  className="px-4 py-1 bg-pink-600 text-white rounded hover:bg-pink-700 text-xl"
                >
                  {isPlaying && currentTrack?.id === track.id ? "❚❚" : "▶"}
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Discography */}
        <section>
          <h2 className="text-3xl font-semibold mb-6">Discography</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {discography.map((release) => (
              <DiscographyCard key={release.slug} release={release} />
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

// Card component for each release with color highlight
function DiscographyCard({ release }: { release: any }) {
  const { playTrack } = usePlayer();
  const [bgColor, setBgColor] = useState("#000");

  useEffect(() => {
    const fac = new FastAverageColor();
    fac.getColorAsync(release.cover)
      .then(color => setBgColor(color.hex))
      .catch(() => setBgColor("#000"));
  }, [release.cover]);

  return (
    <div className="space-y-2">
      <div className="relative w-full group rounded-xl overflow-hidden" style={{ background: bgColor }}>
        <a href={`/releases/${release.slug}`} className="block w-full h-full">
          <Image
            src={release.cover}
            alt={release.title}
            width={200}
            height={200}
            className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105 rounded-xl"
          />
        </a>
        <button
          onClick={() => playTrack(release.tracks[0], release.tracks)}
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-pink-600 rounded-full p-2 text-white"
        >
          ▶
        </button>
      </div>
      <div className="flex flex-col">
        <h3 className="text-xl font-bold truncate">{release.title}</h3>
        <span className="text-gray-400 text-sm">{release.year} • {release.type}</span>
      </div>
    </div>
  );
}
