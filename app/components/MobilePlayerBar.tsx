"use client";

import { usePlayer } from "../context/PlayerContext";
import Image from "next/image";
import { FaPlay, FaPause, FaMusic } from "react-icons/fa";
import { useState } from "react";
import MobileFullPlayer from "./MobileFullPlayer";
import MobileLyricsPanel from "./MobileLyricsPanel"; // Import your mobile lyrics panel

export default function MobilePlayerBar() {
  const { currentTrack, isPlaying, playTrack } = usePlayer();
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false); // Track lyrics panel state

  if (!currentTrack) return null;

  return (
    <>
      {/* Player Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-gray-900 p-2 flex items-center gap-3 z-50 cursor-pointer"
        onClick={() => setIsFullPlayerOpen(true)}
      >
        <Image
          src={currentTrack.cover || "/images/placeholder.jpg"}
          alt={currentTrack.title}
          width={50}
          height={50}
          className="rounded object-cover flex-shrink-0"
        />

        {/* Title + Artist: flex-1 to fill space */}
        <div className="flex-1 flex flex-col justify-center overflow-hidden">
          <span className="truncate font-semibold text-white">{currentTrack.title}</span>
          <span className="truncate text-gray-300 text-sm">David</span>
        </div>

        {/* Lyrics button */}
        <button
          className="p-3 bg-pink-600 rounded-full text-white"
          onClick={(e) => {
            e.stopPropagation(); // Prevent opening full player
            setIsLyricsOpen(true);
          }}
        >
          <FaMusic />
        </button>

        {/* Play/Pause button */}
        <button
          className="ml-auto p-3 bg-pink-600 rounded-full text-white"
          onClick={(e) => {
            e.stopPropagation();
            playTrack(currentTrack);
          }}
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
      </div>

      {/* Full Player Modal */}
      {isFullPlayerOpen && (
        <MobileFullPlayer
          track={currentTrack}
          isPlaying={isPlaying}
          onClose={() => setIsFullPlayerOpen(false)}
        />
      )}

      {/* Lyrics Panel Modal */}
      {isLyricsOpen && (
        <MobileLyricsPanel
          track={currentTrack}
          onClose={() => setIsLyricsOpen(false)}
	  mode="miniplayer"
        />
      )}
    </>
  );
}
