"use client";

import { usePlayer } from "../context/PlayerContext";
import Image from "next/image";
import {
  FaPlay,
  FaPause,
  FaStepForward,
  FaStepBackward,
  FaTimes,
  FaMusic,
  FaRandom,
  FaListUl,
  FaGripVertical,
  FaTrash,
} from "react-icons/fa";
import { useMemo, useState } from "react";
import MobileLyricsPanel from "./MobileLyricsPanel";
import { Track } from "@/app/data/music"; // ✅ Use real Track type
import { getTrackKey } from "@/app/data/music";

interface MobileFullPlayerProps {
  track: Track;   // ✅ FIXED — use the actual Track type
  isPlaying: boolean;
  onClose: () => void;
}

export default function MobileFullPlayer({
  track,
  isPlaying,
  onClose,
}: MobileFullPlayerProps) {
  const {
    currentTrack,
    togglePlay,
    playNext,
    playPrevious,
    currentTime,
    duration,
    seekTo,
    toggleShuffle,
    shuffleEnabled,
    queue,
    reorderQueue,
    removeFromQueue,
    jumpToTrack,
  } = usePlayer();
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"player" | "queue">("player");
  const [draggingTrackKey, setDraggingTrackKey] = useState<string | null>(null);

  const queueItems = useMemo(() => queue, [queue]);

  const formatTime = (s: number) => {
    const totalSeconds = Math.max(0, Math.floor(s));
    const m = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - bounds.left) / bounds.width;
    seekTo(ratio * duration);
  };

  const handleQueueDrop = (fromIndex: number, toIndex: number) => {
    reorderQueue(fromIndex, toIndex);
  };

  const handleQueuePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingTrackKey) return;

    const targetElement = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
    const rowElement = targetElement?.closest("[data-queue-track-key]") as HTMLElement | null;
    const targetTrackKey = rowElement?.dataset.queueTrackKey;
    if (!targetTrackKey || targetTrackKey === draggingTrackKey) return;

    const fromIndex = queueItems.findIndex((queueTrack) => getTrackKey(queueTrack) === draggingTrackKey);
    const toIndex = queueItems.findIndex((queueTrack) => getTrackKey(queueTrack) === targetTrackKey);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;

    reorderQueue(fromIndex, toIndex);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 text-white overscroll-none"
      style={{
        background: `linear-gradient(to bottom, rgba(0,0,0,0.6), #000), url(${track.cover}) center/cover no-repeat`,
        overscrollBehaviorY: "contain",
      }}
    >
      {viewMode === "player" ? (
        <>
          <div className="w-full flex items-center justify-between">
            <button onClick={onClose} className="rounded-full p-2 text-white hover:bg-gray-800">
              <FaTimes size={20} />
            </button>

            <h1 className="text-lg font-semibold">{track.album ? track.album : track.title}</h1>

            <button
              onClick={() => setIsLyricsOpen(true)}
              className="rounded-full bg-pink-600 p-3 text-lg text-white transition-colors hover:bg-pink-500"
            >
              <FaMusic size={20} />
            </button>
          </div>

          <div className="mt-10 flex flex-col items-center">
            <Image
              src={track.cover}
              alt={track.title}
              width={300}
              height={300}
              className="rounded-xl shadow-lg"
            />
          </div>

          <div className="mt-auto mb-6 w-full">
            <h2 className="text-2xl font-bold">{track.title}</h2>
            <p className="text-gray-300">{track.artist}</p>
          </div>

          <div className="w-full">
            <div className="h-1 w-full cursor-pointer rounded bg-gray-700" onClick={handleSeek}>
                <div
                  className="h-1 rounded bg-pink-600"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-gray-300/80">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            <div className="mt-4 flex items-center justify-center gap-5">
              <button onClick={toggleShuffle} className={`rounded-full p-3 text-xl ${shuffleEnabled ? "bg-lime-400 text-black" : "bg-pink-600 text-white"}`}>
                <FaRandom />
              </button>
              <button onClick={playPrevious} className="text-2xl">
                <FaStepBackward />
              </button>
              <button
                onClick={togglePlay}
                className="rounded-full bg-pink-600 p-5 text-3xl"
              >
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <button onClick={playNext} className="text-2xl">
                <FaStepForward />
              </button>
              <button
                onClick={() => setViewMode("queue")}
                className="rounded-full bg-pink-600 p-3 text-xl text-white"
              >
                <FaListUl />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex h-full w-full flex-col">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={() => setViewMode("player")} className="rounded-full p-2 text-white hover:bg-gray-800">
              <FaTimes size={20} />
            </button>
            <h2 className="text-lg font-semibold">Queue</h2>
            <div className="w-9" />
          </div>

          <div className="flex-1 overflow-y-auto rounded-[1.5rem] border border-white/10 bg-black/40 p-3" style={{ overscrollBehaviorY: "contain", touchAction: "pan-y" }}>
            <div className="mb-3 text-xs uppercase tracking-[0.25em] text-white/45">Now Playing</div>
            <div className="mb-5 flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-3">
              <Image src={track.cover} alt={track.title} width={48} height={48} className="rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{track.title}</div>
                <div className="truncate text-xs text-white/55">{track.artist}</div>
              </div>
            </div>

            <div className="mb-3 text-xs uppercase tracking-[0.25em] text-white/45">Up Next</div>
            <div
              className="space-y-2 pb-6"
              onPointerMove={handleQueuePointerMove}
              onPointerUp={() => setDraggingTrackKey(null)}
              onPointerCancel={() => setDraggingTrackKey(null)}
            >
              {queueItems.length === 0 ? (
                <p className="px-2 py-3 text-sm text-white/60">Nothing queued yet.</p>
              ) : (
                queueItems.map((queueTrack, index) => (
                  <div
                    key={getTrackKey(queueTrack)}
                    data-queue-track-key={getTrackKey(queueTrack)}
                    onClick={() => jumpToTrack(getTrackKey(queueTrack))}
                    className="relative flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-3 pr-20"
                  >
                    <Image src={queueTrack.cover || "/images/placeholder.jpg"} alt={queueTrack.title} width={42} height={42} className="rounded-lg object-cover" />
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="truncate font-semibold">{queueTrack.title}</div>
                      <div className="truncate text-xs text-white/55">{queueTrack.artist}</div>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeFromQueue(index);
                      }}
                      className="absolute right-11 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full p-2 text-red-300/90"
                      aria-label={`Remove ${queueTrack.title} from queue`}
                    >
                      <FaTrash size={12} />
                    </button>
                    <button
                      type="button"
                      onPointerDown={(event) => {
                        event.preventDefault();
                        setDraggingTrackKey(getTrackKey(queueTrack));
                        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
                      }}
                      onPointerUp={() => setDraggingTrackKey(null)}
                      onPointerCancel={() => setDraggingTrackKey(null)}
                      className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full p-2 text-white/45 touch-none"
                      aria-label={`Drag ${queueTrack.title}`}
                    >
                      <FaGripVertical />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lyrics Panel */}
      {isLyricsOpen && (
        <MobileLyricsPanel
          track={track}
          onClose={() => setIsLyricsOpen(false)}
          mode="fullplayer"
        />
      )}
    </div>
  );
}
