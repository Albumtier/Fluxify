"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { discography } from "../../data/music";
import { usePlayer } from "../../context/PlayerContext";
import { FaPlay, FaPause, FaArrowLeft } from "react-icons/fa";
import { FastAverageColor } from "fast-average-color";
import { useEffect, useState } from "react";

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function MobileReleasePage() {
  const params = useParams();
  const { slug } = params;
  const release = discography.find((item) => item.slug === slug);

  const { playTrack, playAll, currentTrack, isPlaying } = usePlayer();
  const [highlightColor, setHighlightColor] = useState<string>("#000");

  useEffect(() => {
    if (release) {
      const fac = new FastAverageColor();
      fac
        .getColorAsync(release.cover)
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

  // Get "More from David" dynamically (other releases excluding current)
  const moreFromDavid = discography.filter((item) => item.slug !== slug);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-4 space-y-4">
      {/* Back Button */}
      <div className="flex items-center mb-2">
        <Link href="/" className="p-2 rounded-full bg-gray-800">
          <FaArrowLeft />
        </Link>
      </div>

      {/* Album Header */}
      <div className="relative flex gap-4 p-4 rounded-xl" style={{ minHeight: "140px" }}>
        {/* Background highlight */}
        <div
          className="absolute inset-0 rounded-xl z-0"
          style={{ backgroundColor: highlightColor, opacity: 0.2 }}
        />

        {/* Album Art */}
        <Image
          src={release.cover}
          alt={release.title}
          width={120}
          height={120}
          className="rounded-xl object-cover z-10 flex-shrink-0"
        />

        {/* Album info */}
        <div className="flex flex-col justify-center z-10 flex-1">
          <span className="text-sm text-gray-400">{release.type}</span>
          <h1 className="text-2xl font-bold mt-1">{release.title}</h1>
          <div className="flex items-center gap-2 text-gray-200 text-xs mt-1">
            <span>{release.year}</span>
            <span>• {release.tracks.length} track{release.tracks.length > 1 ? "s" : ""}</span>
            <span>• {formatDuration(totalDuration)}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Image
              src="/images/artist.jpg"
              alt="Artist"
              width={30}
              height={30}
              className="rounded-full"
            />
            <span className="font-semibold">David</span>
          </div>
        </div>

        {/* Small circular Play All button */}
        <button
          onClick={() => playAll(release.tracks)}
          className="ml-auto z-10 bg-pink-600 p-3 rounded-full text-white flex-shrink-0 w-10 h-10 flex items-center justify-center"
        >
          {isPlaying && currentTrack?.id === release.tracks[0].id ? <FaPause /> : <FaPlay />}
        </button>
      </div>

      {/* Tracklist */}
      <div
        className="flex flex-col gap-2 overflow-y-auto pb-5"
        style={{ maxHeight: "calc(100vh - 360px)" }} // header + playerbar
      >
        {release.tracks.map((track, index) => (
          <div
            key={track.id}
            className="flex items-center justify-between p-3 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800"
            onClick={() => playTrack(track, release.tracks)}
          >
            <span className="truncate">{index + 1}. {track.title}</span>
          </div>
        ))}
      </div>

      {/* More from David */}
      {moreFromDavid.length > 0 && (
        <section className="mt-4 pb-10">
          <h2 className="text-xl font-semibold mb-2">More from David</h2>
          <div className="flex overflow-x-auto gap-4 pb-4">
            {moreFromDavid.map((item) => (
              <div key={item.slug} className="relative min-w-[120px]">
                <Link href={`/releases/${item.slug}`} className="block rounded-xl overflow-hidden">
                  <Image
                    src={item.cover}
                    alt={item.title}
                    width={120}
                    height={120}
                    className="rounded-xl object-cover w-full h-full"
                  />
                </Link>

                {/* Play button overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playTrack(item.tracks[0], item.tracks);
                  }}
                  className="absolute bottom-14 right-1 bg-pink-600 p-2 rounded-full text-white z-20"
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
