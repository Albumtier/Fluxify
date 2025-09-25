"use client";

import { usePlayer } from "../context/PlayerContext";
import Image from "next/image";
import { FaPlay, FaPause } from "react-icons/fa";
import { useState } from "react";
import MobileFullPlayer from "./MobileFullPlayer";

export default function MobilePlayerBar() {
  const { currentTrack, isPlaying, playTrack } = usePlayer();
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);

  if (!currentTrack) return null;

  return (
    <>
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
        <div className="flex flex-col justify-center overflow-hidden">
          <span className="truncate font-semibold text-white">{currentTrack.title}</span>
          <span className="truncate text-gray-300 text-sm">David</span>
        </div>
        <button
          className="ml-auto p-3 bg-pink-600 rounded-full text-white"
          onClick={(e) => {
            e.stopPropagation(); // prevent triggering full player when play/pause is clicked
            playTrack(currentTrack);
          }}
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
      </div>

      {isFullPlayerOpen && (
        <MobileFullPlayer
          track={currentTrack}
          isPlaying={isPlaying}
          onClose={() => setIsFullPlayerOpen(false)}
        />
      )}
    </>
  );
}
