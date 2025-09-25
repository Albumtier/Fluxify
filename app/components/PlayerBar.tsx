"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { FaPlay, FaPause, FaForward, FaBackward, FaList } from "react-icons/fa";
import { usePlayer } from "@/app/context/PlayerContext";
import QueueSidebar from "./QueueSidebar";

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    currentTime,
    duration,
  } = usePlayer();

  const [queueOpen, setQueueOpen] = useState(false);
  const titleContainerRef = useRef<HTMLDivElement | null>(null);
  const titleTextRef = useRef<HTMLDivElement | null>(null);

  const [scrollNeeded, setScrollNeeded] = useState(false);
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    if (!currentTrack) return;

    const container = titleContainerRef.current;
    const text = titleTextRef.current;
    if (!container || !text) return;

    const overflow = text.scrollWidth > container.clientWidth;
    setScrollNeeded(overflow);
    setScrolling(false);

    if (overflow) {
      const startTimer = setTimeout(() => setScrolling(true), 5000);
      return () => clearTimeout(startTimer);
    }
  }, [currentTrack?.title]);

  const handleAnimationEnd = () => setScrolling(false);

  if (!currentTrack) return null;

  const cover = currentTrack.cover || "/images/placeholder.jpg";
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white flex items-center justify-between px-4 py-3 shadow-lg z-50 h-24">
        {/* Left: Cover + Info */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <Image
            src={cover}
            alt={currentTrack.title}
            width={50}
            height={50}
            className="rounded-lg object-cover"
          />
          <div className="flex flex-col overflow-hidden w-[140px]">
            <div
              ref={titleContainerRef}
              className="whitespace-nowrap overflow-hidden"
            >
              <div
                ref={titleTextRef}
                className="inline-block"
                style={
                  scrollNeeded && scrolling
                    ? {
                        display: "inline-block",
                        paddingLeft: "100%",
                        animation: `scrollText 10s linear forwards`,
                      }
                    : { display: "inline-block" }
                }
                onAnimationEnd={handleAnimationEnd}
              >
                {currentTrack.title}
              </div>
            </div>
            <span className="text-gray-300 text-sm truncate">David</span>
          </div>
        </div>

        {/* Center: Controls + Progress */}
        <div className="flex flex-col items-center flex-1 mx-8">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={playPrevious}
              className="p-2 bg-pink-600 rounded-full hover:bg-pink-700"
            >
              <FaBackward />
            </button>
            <button
              onClick={togglePlay}
              className="p-3 bg-pink-600 rounded-full hover:bg-pink-700"
            >
              {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
            </button>
            <button
              onClick={playNext}
              className="p-2 bg-pink-600 rounded-full hover:bg-pink-700"
            >
              <FaForward />
            </button>
          </div>
          <div className="w-full">
            <div className="w-full h-1 bg-gray-700 rounded">
              <div
                className="h-1 bg-pink-600 rounded"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-300 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Right: Queue */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQueueOpen(!queueOpen)}
            className="p-2 bg-pink-600 rounded-full hover:bg-pink-700"
          >
            <FaList />
          </button>
        </div>
      </div>

      {queueOpen && <QueueSidebar onClose={() => setQueueOpen(false)} />}

      <style jsx>{`
        @keyframes scrollText {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </>
  );
}
