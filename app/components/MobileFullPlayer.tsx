"use client";

import { usePlayer } from "../context/PlayerContext";
import Image from "next/image";
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";

interface MobileFullPlayerProps {
  track: {
    id: string | number;
    title: string;
    cover: string;
    duration: number;
    artist: string;
    album?: string | null; // album can be null
  };
  isPlaying: boolean;
  onClose: () => void;
}

export default function MobileFullPlayer({ track, isPlaying, onClose }: MobileFullPlayerProps) {
  const { playTrack, togglePlay, playNext, playPrevious } = usePlayer();
  const [progress, setProgress] = useState(0);

  // Reset progress when track changes
  useEffect(() => {
    setProgress(0);
  }, [track.id]);

  // Simulate playback progress
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((p) => (p < track.duration ? p + 1 : p));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, track.duration]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 text-white"
      style={{
        background: `linear-gradient(to bottom, rgba(0,0,0,0.6), #000), url(${track.cover}) center/cover no-repeat`,
      }}
    >
      {/* Top bar */}
      <div className="w-full flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-2 text-white rounded-full hover:bg-gray-800"
        >
          <FaTimes size={20} />
        </button>
        <h1 className="text-lg font-semibold">
          {track.album ? track.album : track.title}
        </h1>
        <div className="w-8" /> {/* spacer */}
      </div>

      {/* Album cover */}
      <div className="flex flex-col items-center mt-10">
        <Image
          src={track.cover}
          alt={track.title}
          width={300}
          height={300}
          className="rounded-xl shadow-lg"
        />
      </div>

      {/* Track details */}
      <div className="w-full mt-auto mb-6">
        <h2 className="text-2xl font-bold">{track.title}</h2>
        <p className="text-gray-300">{track.artist}</p>
      </div>

      {/* Controls */}
      <div className="w-full">
        {/* Progress bar */}
        <div className="w-full flex items-center gap-2 text-xs text-gray-300 mb-2">
          <span>{formatTime(progress)}</span>
          <div className="flex-1 h-1 bg-gray-700 rounded">
            <div
              className="h-1 bg-pink-600 rounded"
              style={{ width: `${(progress / track.duration) * 100}%` }}
            />
          </div>
          <span>{formatTime(track.duration)}</span>
        </div>

        {/* Playback buttons */}
        <div className="flex justify-center items-center gap-8 mt-4">
          <button onClick={playPrevious} className="text-2xl">
            <FaStepBackward />
          </button>
          <button
            onClick={() => (isPlaying ? togglePlay() : currentTrack ? playTrack(currentTrack) : null)}
            className="p-5 bg-pink-600 rounded-full text-3xl"
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button onClick={playNext} className="text-2xl">
            <FaStepForward />
          </button>
        </div>
      </div>
    </div>
  );
}
