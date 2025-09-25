"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import type { Track } from "@/app/data/music";

type PlayerContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  history: Track[];
  currentTime: number;
  duration: number;
  playTrack: (track: Track, albumQueue?: Track[]) => void;
  playAll: (tracks: Track[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  jumpToTrack: (trackId: string) => void;
  getPopularTracks: (allTracks: Track[], top?: number) => Track[];
  playCounts: Record<string, number>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [history, setHistory] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playCounts, setPlayCounts] = useState<Record<string, number>>({});

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // play a track (with optional album/playlist queue)
  const playTrack = (track: Track, albumQueue?: Track[]) => {
    const trackWithCover: Track = {
      ...track,
      cover: track.cover ?? currentTrack?.cover ?? "/images/default-cover.jpg",
      artist: track.artist ?? "David",
    };

    setPlayCounts((prev) => ({
      ...prev,
      [track.id]: (prev[track.id] || 0) + 1,
    }));

    // same track → toggle instead of reload
    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }

    if (currentTrack) setHistory((prev) => [...prev, currentTrack]);

    if (albumQueue && albumQueue.length > 0) {
      // set full queue, keeping clicked track first
      const idx = albumQueue.findIndex((t) => t.id === track.id);
      const reordered = [
        albumQueue[idx], // clicked track
        ...albumQueue.slice(idx + 1), // tracks after it
        ...albumQueue.slice(0, idx),  // tracks before it
      ];
      setCurrentTrack(trackWithCover);
      setQueue(reordered.slice(1)); // everything else
    } else {
      setCurrentTrack(trackWithCover);
      setQueue([]);
    }

    setIsPlaying(true);
    setCurrentTime(0);
  };

  // play all (album/playlist from start)
  const playAll = (tracks: Track[]) => {
    if (!tracks.length) return;
    if (currentTrack) setHistory((prev) => [...prev, currentTrack]);
    setCurrentTrack(tracks[0]);
    setQueue(tracks.slice(1));
    setIsPlaying(true);
    setCurrentTime(0);
  };

  // play next
  const playNext = () => {
    if (!currentTrack || !queue.length) {
      setIsPlaying(false);
      return;
    }
    const next = queue[0];
    setHistory((prev) => [...prev, currentTrack]);
    setCurrentTrack(next);
    setQueue(queue.slice(1));
    setIsPlaying(true);
    setCurrentTime(0);
    if (audioRef.current) audioRef.current.src = next.file;
  };

  // play previous
  const playPrevious = () => {
    if (!history.length) return;
    const prevTrack = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    if (currentTrack) setQueue((prev) => [currentTrack, ...prev]);
    setCurrentTrack(prevTrack);
    setIsPlaying(true);
    setCurrentTime(0);
    if (audioRef.current) audioRef.current.src = prevTrack.file;
  };

  // jump to a specific track in queue
  const jumpToTrack = (trackId: string) => {
    const idx = queue.findIndex((t) => t.id === trackId);
    if (idx < 0) return;
    const selected = queue[idx];
    if (currentTrack) setHistory((prev) => [...prev, currentTrack]);
    setCurrentTrack(selected);
    setQueue(queue.slice(idx + 1));
    setIsPlaying(true);
    setCurrentTime(0);
    if (audioRef.current) audioRef.current.src = selected.file;
  };

  // return popular tracks
  const getPopularTracks = (allTracks: Track[], top = 4) => {
    return [...allTracks]
      .sort((a, b) => (playCounts[b.id] || 0) - (playCounts[a.id] || 0))
      .slice(0, top);
  };

  // attach audio events
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    if (currentTrack) {
      audio.src = currentTrack.file;
      audio.play();
      setIsPlaying(true);
    }

    const onMetadata = () => setDuration(audio.duration || 0);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => playNext();

    audio.addEventListener("loadedmetadata", onMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentTrack]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        queue,
        history,
        currentTime,
        duration,
        playTrack,
        playAll,
        togglePlay,
        playNext,
        playPrevious,
        jumpToTrack,
        getPopularTracks,
        playCounts,
        audioRef,
      }}
    >
      {children}
      <audio ref={audioRef} className="hidden" />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within PlayerProvider");
  return context;
}
