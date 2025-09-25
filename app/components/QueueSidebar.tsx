"use client";

import { usePlayer } from "@/app/context/PlayerContext";
import { FaTimes } from "react-icons/fa";
import Image from "next/image";

export default function QueueSidebar({ onClose }: { onClose: () => void }) {
  const { queue, currentTrack, jumpToTrack } = usePlayer();

  if (!currentTrack) return null;

  const nowPlaying = [currentTrack];
  const upNext = queue;

  return (
    <div className="fixed top-0 right-0 h-full w-64 bg-gray-800 text-white shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="font-semibold text-lg">Queue</span>
        <button onClick={onClose} className="p-1 hover:text-pink-500">
          <FaTimes />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {/* Now Playing */}
        <div className="mb-2">
          <h3 className="px-2 py-1 text-sm text-gray-400 font-semibold uppercase">
            Now Playing
          </h3>
          {nowPlaying.map((track) => (
            <div
              key={track.id}
              className="flex items-center gap-2 px-4 py-2 cursor-default bg-gray-700 rounded mb-1"
            >
              <Image
                src={track.cover || "/images/placeholder.jpg"}
                alt={track.title}
                width={40}
                height={40}
                className="rounded object-cover"
              />
              <span className="truncate font-semibold">{track.title}</span>
            </div>
          ))}
        </div>

        {/* Up Next */}
        <div>
          <h3 className="px-2 py-1 text-sm text-gray-400 font-semibold uppercase">
            Up Next
          </h3>
          {upNext.map((track) => (
            <div
              key={track.id}
              onClick={() => jumpToTrack(track.id)}
              className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-700 rounded mb-1"
            >
              <Image
                src={track.cover || "/images/placeholder.jpg"}
                alt={track.title}
                width={40}
                height={40}
                className="rounded object-cover"
              />
              <span className="truncate">{track.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
