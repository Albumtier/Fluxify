"use client";

import { usePlayer } from "../context/PlayerContext";
import Image from "next/image";
import { FaPlay, FaPause } from "react-icons/fa";

export default function MobilePlayerBar() {
  const { currentTrack, isPlaying, playTrack } = usePlayer();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 p-2 flex items-center gap-3 z-50">
      <Image
        src={currentTrack.cover || "/images/placeholder.jpg"}
        alt={currentTrack.title}
        width={50}
        height={50}
        className="rounded object-cover flex-shrink-0"
      />
      <div className="flex flex-col justify-center overflow-hidden">
        <span className="truncate font-semibold">{currentTrack.title}</span>
        <span className="truncate text-gray-400 text-sm">{currentTrack.artist || "David"}</span>
      </div>
      <button
        className="ml-auto p-3 bg-pink-600 rounded-full text-white"
        onClick={() => playTrack(currentTrack)}
      >
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>
    </div>
  );
}
