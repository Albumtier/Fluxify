"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { discography } from "../../data/music";
import { usePlayer } from "../../context/PlayerContext";
import { FaPlay, FaPause, FaArrowLeft } from "react-icons/fa";
import Image from "next/image";
import { FastAverageColor } from "fast-average-color";
import Link from "next/link";

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function ReleasePage() {
  const params = useParams();
  const { slug } = params;
  const release = discography.find((item) => item.slug === slug);

  const { playTrack, playAll, currentTrack, isPlaying } = usePlayer();
  const [highlightColor, setHighlightColor] = useState<string>("#000");

  useEffect(() => {
    if (release) {
      const fac = new FastAverageColor();
      fac.getColorAsync(release.cover)
        .then((color) => setHighlightColor(color.hex))
        .catch(() => setHighlightColor("#000"));
    }
  }, [release]);

  if (!release) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl">Album not found</p>
      </div>
    );
  }

  const totalDuration = release.tracks.reduce((sum, t) => sum + (t.duration || 0), 0);

  // Exclude current release for "More from David"
  const moreFromDavid = discography.filter((item) => item.slug !== slug);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Back Button */}
      <div className="mb-4">
        <Link href="/" className="flex items-center gap-2 text-white font-semibold hover:text-pink-500">
          <FaArrowLeft /> Back
        </Link>
      </div>

      {/* Album Header */}
      <div className="relative flex items-center gap-6 mb-12 p-4 rounded-xl">
        {/* Background highlight */}
        <div
          className="absolute inset-0 rounded-xl"
          style={{ backgroundColor: highlightColor, opacity: 0.2, zIndex: 0 }}
        />

        {/* Album art */}
        <Image
          src={release.cover}
          alt={release.title}
          width={300}
          height={300}
          className="rounded-xl object-cover z-10 flex-shrink-0"
        />

        {/* Title + artist details */}
        <div className="flex flex-col justify-center z-10">
          <span className="text-sm text-gray-400">{release.type}</span>
          <h1 className="text-4xl font-bold mb-2">{release.title}</h1>
          <div className="flex items-center gap-2 text-gray-200">
            <Image
              src="/images/artist.jpg"
              alt="Artist"
              width={30}
              height={30}
              className="rounded-full"
            />
            <span className="font-semibold">{release.artist || "David"}</span>
            <span>• {release.year}</span>
            <span>• {release.tracks.length} track{release.tracks.length > 1 ? "s" : ""}</span>
            <span>• {formatDuration(totalDuration)}</span>
          </div>
        </div>

        {/* Play All button */}
        <button
          onClick={() => {
            const firstTrack = release.tracks[0];
            if (currentTrack?.id === firstTrack.id && isPlaying) {
              playTrack(firstTrack, release.tracks);
            } else {
              playAll(release.tracks);
            }
          }}
          className="ml-auto bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-full z-10"
        >
          {currentTrack?.id === release.tracks[0].id && isPlaying ? <FaPause /> : <FaPlay />}
        </button>
      </div>

      {/* Track List */}
      <div className="space-y-4 mb-12">
        {release.tracks.map((track) => {
          const isCurrent = currentTrack?.id === track.id;
          return (
            <div
              key={track.id}
              className="flex items-center justify-between bg-gray-900 px-4 py-3 rounded-lg hover:bg-gray-800 cursor-pointer"
              onClick={() => playTrack(track, release.tracks)}
            >
              <span>{track.title}</span>
              <button className="p-2 bg-pink-600 hover:bg-pink-700 rounded-full text-white">
                {isCurrent && isPlaying ? <FaPause /> : <FaPlay />}
              </button>
            </div>
          );
        })}
      </div>

      {/* More from David */}
      {moreFromDavid.length > 0 && (
        <section className="pb-20"> {/* Padding bottom so playerbar doesn't block */}
          <h2 className="text-2xl font-semibold mb-4">More from David</h2>
          <div className="grid grid-cols-3 gap-6">
            {moreFromDavid.map((item) => (
              <div
                key={item.slug}
                className="relative group rounded-xl overflow-hidden"
              >
                <Link href={`/releases/${item.slug}`} className="block">
                  <Image
                    src={item.cover}
                    alt={item.title}
                    width={200}
                    height={200}
                    className="rounded-xl object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
                  />
                </Link>

                {/* Hover Play button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playTrack(item.tracks[0], item.tracks);
                  }}
                  className="absolute bottom-14 right-2 bg-pink-600 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                >
                  {isPlaying && currentTrack?.id === item.tracks[0].id ? <FaPause /> : <FaPlay />}
                </button>

                <div className="mt-2 text-center">
                  <h3 className="text-sm font-bold truncate">{item.title}</h3>
                  <span className="text-gray-400 text-xs">{item.type}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
