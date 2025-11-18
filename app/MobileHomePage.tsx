"use client";

import type { Track } from "./data/music";
import Image from "next/image";
import { usePlayer } from "./context/PlayerContext";
import { latestRelease, discography, artist } from "./data/music";
import { FaPlay, FaPause } from "react-icons/fa";
import { FastAverageColor } from "fast-average-color";
import { useEffect, useState } from "react";

export default function MobileHomePage() {
  const { playTrack, addToQueue, currentTrack, isPlaying } = usePlayer();
  const [artistColor, setArtistColor] = useState("#000");

  // Get highlight color from artist image
  useEffect(() => {
    const fac = new FastAverageColor();
    fac
      .getColorAsync(artist.image)
      .then((color) => setArtistColor(color.hex))
      .catch(() => setArtistColor("#000"));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-4 space-y-8">
      {/* Artist Section */}
      <div className="relative rounded-xl overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{ backgroundColor: artistColor, opacity: 0.7 }}
        />
        <div className="relative flex items-center gap-6 p-6 z-10">
          <Image
            src={artist.image}
            alt={artist.name}
            width={100}
            height={100}
            className="rounded-full object-cover flex-shrink-0"
          />
          <h1 className="text-3xl sm:text-4xl font-bold">{artist.name}</h1>
        </div>
      </div>

      {/* Latest Release */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Latest Release</h2>
        <div className="flex items-center space-x-3">
          <Image
            src={latestRelease.cover}
            alt={latestRelease.title}
            width={100}
            height={100}
            className="rounded-xl object-cover flex-shrink-0"
          />
          <div className="flex flex-col justify-center">
            <h3 className="text-xl font-bold truncate">{latestRelease.title}</h3>
            <span className="text-gray-400 text-sm">{latestRelease.type}</span>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => playTrack(latestRelease.tracks[0], latestRelease.tracks)}
              className="p-3 bg-pink-600 rounded-full text-white"
            >
              {isPlaying && currentTrack?.id === latestRelease.tracks[0].id ? (
                <FaPause />
              ) : (
                <FaPlay />
              )}
            </button>
            <button
              onClick={() => latestRelease.tracks.forEach((track: Track) => addToQueue(track))}
              className="p-3 bg-gray-700 rounded-full text-white"
            >
              +
            </button>
          </div>
        </div>
      </section>

      {/* Discography */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Discography</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {discography.map((release) => (
            <div key={release.slug} className="relative flex-shrink-0 w-36">
              <a
                href={`/releases/${release.slug}`}
                className="block rounded-xl overflow-hidden relative"
              >
                <Image
                  src={release.cover}
                  alt={release.title}
                  width={140}
                  height={140}
                  className="rounded-xl object-cover w-full h-full"
                />
                {/* Play + Add buttons overlay */}
                <div className="absolute bottom-2 right-2 flex gap-2 z-10">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      playTrack(release.tracks[0], release.tracks);
                    }}
                    className="bg-pink-600 p-2 rounded-full text-white"
                  >
                    {isPlaying && currentTrack?.id === release.tracks[0].id ? (
                      <FaPause />
                    ) : (
                      <FaPlay />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      release.tracks.forEach((track: Track) => addToQueue(track));
                    }}
                    className="bg-gray-700 p-2 rounded-full text-white"
                  >
                    +
                  </button>
                </div>
              </a>

              <div className="mt-2 text-center">
                <h3 className="text-sm font-bold truncate">{release.title}</h3>
                <span className="text-gray-400 text-xs">{release.type}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Note: Mobile PlayerBar should remain in layout.tsx at bottom */}
    </div>
  );
}
