"use client";

import { PlayerProvider, usePlayer } from "../context/PlayerContext";
import { musingsAlbum } from "../data/music";
import { FaPlay, FaPause } from "react-icons/fa";
import PlayerBar from "../components/PlayerBar";

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getTotalDuration(tracks: typeof musingsAlbum.tracks) {
  const totalSeconds = tracks.reduce((sum: number, track: any) => sum + (track.duration || 180), 0);
  return formatDuration(totalSeconds);
}

function AlbumContent() {
  const { playTrack, playAll, currentTrack, isPlaying } = usePlayer();

  return (
    <div className="min-h-screen bg-black text-white p-8 pb-32">
      {/* Album Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
        {/* Left: Cover + Details */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <img
            src={musingsAlbum.cover}
            alt={musingsAlbum.title}
            className="w-72 h-72 rounded-xl object-cover"
          />
          {/* Album Details */}
          <div className="flex flex-col gap-2 mt-4 md:mt-0">
            <h1 className="text-4xl font-bold">{musingsAlbum.title}</h1>
            <span className="text-gray-400">
              {musingsAlbum.artist || "David"} &middot; {musingsAlbum.year || "2023"} &middot;{" "}
              {musingsAlbum.tracks.length} {musingsAlbum.tracks.length > 1 ? "tracks" : "track"} &middot;{" "}
              {getTotalDuration(musingsAlbum.tracks)}
            </span>
          </div>
        </div>

        {/* Right: Play All button */}
        <div className="flex-shrink-0 mt-4 md:mt-0">
          <button
            onClick={() => playAll(musingsAlbum.tracks)}
            className="bg-pink-600 hover:bg-pink-700 text-white p-4 rounded-full"
          >
            <FaPlay size={20} />
          </button>
        </div>
      </div>

      {/* Track List */}
      <div className="space-y-2">
        {musingsAlbum.tracks.map((track) => {
          const isCurrent = currentTrack?.id === track.id;
          return (
            <div
              key={track.id}
              className="flex items-center justify-between bg-gray-900 px-4 py-3 rounded-lg hover:bg-gray-800 cursor-pointer"
              onClick={() => playTrack(track, musingsAlbum.tracks)}
            >
              <span>{track.title}</span>
              <button className="p-2 bg-pink-600 hover:bg-pink-700 rounded-full text-white">
                {isCurrent && isPlaying ? <FaPause /> : <FaPlay />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TestAlbumPage() {
  return (
    <PlayerProvider>
      <AlbumContent />
      {/* PlayerBar renders at the bottom and uses PlayerContext */}
      <PlayerBar />
    </PlayerProvider>
  );
}
