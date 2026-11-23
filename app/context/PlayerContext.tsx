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
import { discography, getTrackKey } from "@/app/data/music";

const LISTENER_ID_STORAGE_KEY = "fluxify.listenerId.v2";
const PLAYLISTS_STORAGE_KEY = "fluxify.playlists";

type GlobalStats = {
  playCounts?: Record<string, number>;
  monthlyListeners?: number;
};

export type Playlist = {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: number;
};

type PlayerContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  queueSourceStartIndex: number;
  queueSourceLabel: string | null;
  shuffleEnabled: boolean;
  history: Track[];
  currentTime: number;
  duration: number;
  playTrack: (track: Track, albumQueue?: Track[], sourceLabel?: string) => void;
  playAll: (tracks: Track[], sourceLabel?: string) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  jumpToTrack: (trackKey: string) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  removeFromQueue: (index: number) => void;
  addToQueue: (track: Track) => void;
  toggleShuffle: () => void;
  seekTo: (time: number) => void;
  playlists: Playlist[];
  createPlaylist: (name: string) => string | null;
  renamePlaylist: (playlistId: string, name: string) => void;
  deletePlaylist: (playlistId: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  getPopularTracks: (allTracks: Track[], top?: number) => Track[];
  playCounts: Record<string, number>;
  monthlyListeners: number;
  audioRef: React.RefObject<HTMLAudioElement | null>;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueSourceStartIndex, setQueueSourceStartIndex] = useState(0);
  const [queueSourceLabel, setQueueSourceLabel] = useState<string | null>(null);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [history, setHistory] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playCounts, setPlayCounts] = useState<Record<string, number>>({});
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [listenerId, setListenerId] = useState("");
  const [monthlyListeners, setMonthlyListeners] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shuffledSourceSnapshotRef = useRef<Track[] | null>(null);
  const preShuffleQueueSnapshotRef = useRef<{
    queue: Track[];
    queueSourceStartIndex: number;
    queueSourceLabel: string | null;
  } | null>(null);

  const normalizePlayCounts = (counts: Record<string, number> | undefined | null) =>
    Object.fromEntries(
      Object.entries(counts ?? {}).map(([trackKey, count]) => [trackKey, Number(count) || 0])
    );

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      try {
      const storedPlaylists = window.localStorage.getItem(PLAYLISTS_STORAGE_KEY);
      if (storedPlaylists) {
        const parsed = JSON.parse(storedPlaylists) as Playlist[];
        const normalizedPlaylists = parsed
          .filter((playlist): playlist is Playlist =>
            typeof playlist?.id === "string" &&
            typeof playlist?.name === "string" &&
            Array.isArray(playlist?.tracks)
          )
          .map((playlist) => ({
            ...playlist,
            tracks: playlist.tracks.map((track) => normalizeTrack(track)),
            createdAt: typeof playlist.createdAt === "number" ? playlist.createdAt : Date.now(),
          }));
        setPlaylists(normalizedPlaylists);
      }

      const storedListenerId = window.localStorage.getItem(LISTENER_ID_STORAGE_KEY);
      const resolvedListenerId = storedListenerId || (window.crypto?.randomUUID?.() ?? `listener-${Date.now()}-${Math.random().toString(16).slice(2)}`);
      if (!storedListenerId) {
        window.localStorage.setItem(LISTENER_ID_STORAGE_KEY, resolvedListenerId);
      }
      setListenerId(resolvedListenerId);

      const response = await fetch("/api/stats", { cache: "no-store" });
      if (response.ok) {
        const data = (await response.json()) as GlobalStats;
        if (!cancelled) {
          setPlayCounts(normalizePlayCounts(data.playCounts));
          setMonthlyListeners(Number(data.monthlyListeners) || 0);
        }
      } else if (!cancelled) {
        setPlayCounts({});
        setMonthlyListeners(0);
      }
    } catch {
      if (!cancelled) {
        setPlayCounts({});
        setMonthlyListeners(0);
      }
    }
      };

    void loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
    } catch {
      // Ignore storage failures; playback should continue normally.
    }
  }, [playlists]);

  const normalizeTrack = (track: Track, fallbackCover?: string): Track => ({
    ...track,
    cover: track.cover ?? fallbackCover ?? currentTrack?.cover ?? "/images/default-cover.jpg",
    artist: track.artist ?? "David",
  });

  const randomizeTracks = (tracks: Track[]) => [...tracks].sort(() => Math.random() - 0.5);

  const recordGlobalPlay = async (trackKey: string) => {
    if (!trackKey) return;

    setPlayCounts((prev) => ({
      ...prev,
      [trackKey]: (prev[trackKey] || 0) + 1,
    }));

    try {
      const response = await fetch("/api/play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trackKey, listenerId }),
      });

      if (!response.ok) return;

      const data = (await response.json()) as GlobalStats;
      setPlayCounts(normalizePlayCounts(data.playCounts));
      setMonthlyListeners(Number(data.monthlyListeners) || 0);
    } catch {
      // Keep the optimistic local increment if the network is unavailable.
    }
  };

  const updatePlaybackQueue = (
    track: Track,
    nextQueue: Track[] = [],
    nextQueueSourceStartIndex = 0,
    nextQueueSourceLabel: string | null = null,
    options?: { addToHistory?: boolean; countStream?: boolean; preserveShuffle?: boolean }
  ) => {
    const trackWithCover = normalizeTrack(track);
    const trackKey = getTrackKey(trackWithCover);

    if (options?.addToHistory !== false && currentTrack) {
      setHistory((prev) => [...prev, currentTrack]);
    }

    if (options?.countStream !== false) {
      void recordGlobalPlay(trackKey);
    }

    if (!options?.preserveShuffle) {
      setShuffleEnabled(false);
      shuffledSourceSnapshotRef.current = null;
    }

    setCurrentTrack(trackWithCover);
    setQueue(nextQueue.map((queuedTrack) => normalizeTrack(queuedTrack, trackWithCover.cover)));
    setQueueSourceStartIndex(nextQueueSourceStartIndex);
    setQueueSourceLabel(nextQueueSourceLabel);
    setIsPlaying(true);
    setCurrentTime(0);

    if (audioRef.current) {
      audioRef.current.src = trackWithCover.file;
    }
  };

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
  const playTrack = (track: Track, albumQueue?: Track[], sourceLabel?: string) => {
    const selectedTrackKey = getTrackKey(track);
    if (currentTrack && getTrackKey(currentTrack) === selectedTrackKey) {
      updatePlaybackQueue(track, [], 0, null, {
        addToHistory: false,
      });
      return;
    }

    if (albumQueue && albumQueue.length > 0) {
      // set full queue, keeping clicked track first
      const idx = albumQueue.findIndex((t) => getTrackKey(t) === selectedTrackKey);
      if (idx < 0) {
        updatePlaybackQueue(track, []);
        return;
      }
      const reordered = [
        albumQueue[idx], // clicked track
        ...albumQueue.slice(idx + 1), // tracks after it
        ...albumQueue.slice(0, idx), // tracks before it
      ];
      updatePlaybackQueue(track, reordered.slice(1), 0, sourceLabel ?? null);
    } else {
      updatePlaybackQueue(track, []);
    }
  };

  // play all (album/playlist from start)
  const playAll = (tracks: Track[], sourceLabel?: string) => {
    if (!tracks.length) return;
    updatePlaybackQueue(tracks[0], tracks.slice(1), 0, sourceLabel ?? null);
  };

  // NEW: add a track to the queue
  const addToQueue = (track: Track) => {
    const trackWithCover = normalizeTrack(track);
    const queuedTrackKey = getTrackKey(trackWithCover);

    // if player is empty → start playing immediately
    if (!currentTrack) {
      updatePlaybackQueue(trackWithCover, [], 0, null, { addToHistory: false });
      return;
    }

    // prevent duplicates
    const exists =
      queue.some((t) => getTrackKey(t) === queuedTrackKey) ||
      getTrackKey(currentTrack) === queuedTrackKey;
    if (!exists) {
      setQueue((prev) => {
        const next = [...prev];
        next.splice(queueSourceStartIndex, 0, trackWithCover);
        return next;
      });
      setQueueSourceStartIndex((prev) => prev + 1);
    }
  };

  const reorderQueue = (fromIndex: number, toIndex: number) => {
    setQueue((prev) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex >= prev.length ||
        fromIndex === toIndex
      ) {
        return prev;
      }

      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);

      if (fromIndex < queueSourceStartIndex && toIndex >= queueSourceStartIndex) {
        setQueueSourceStartIndex((value) => Math.max(0, value - 1));
      } else if (fromIndex >= queueSourceStartIndex && toIndex < queueSourceStartIndex) {
        setQueueSourceStartIndex((value) => value + 1);
      }

      return next;
    });
  };

  const removeFromQueue = (index: number) => {
    setQueue((prev) => {
      if (index < 0 || index >= prev.length) {
        return prev;
      }

      const next = [...prev];
      next.splice(index, 1);

      if (index < queueSourceStartIndex) {
        setQueueSourceStartIndex((value) => Math.max(0, value - 1));
      }

      if (next.length === 0) {
        setQueueSourceLabel(null);
      }

      return next;
    });
  };

  const toggleShuffle = () => {
    if (!shuffleEnabled) {
      const sourceQueue = queue.slice(queueSourceStartIndex);
      if (!sourceQueue.length) return;

      preShuffleQueueSnapshotRef.current = {
        queue: [...queue],
        queueSourceStartIndex,
        queueSourceLabel,
      };
      shuffledSourceSnapshotRef.current = sourceQueue;
      setQueue((prev) => {
        const manualQueue = prev.slice(0, queueSourceStartIndex);
        return [...manualQueue, ...randomizeTracks(sourceQueue)];
      });
      setShuffleEnabled(true);
      return;
    }

    const snapshot = preShuffleQueueSnapshotRef.current;
    if (!snapshot) {
      setShuffleEnabled(false);
      shuffledSourceSnapshotRef.current = null;
      return;
    }

    setQueue(snapshot.queue);
    setQueueSourceStartIndex(snapshot.queueSourceStartIndex);
    setQueueSourceLabel(snapshot.queueSourceLabel);
    setShuffleEnabled(false);
    shuffledSourceSnapshotRef.current = null;
    preShuffleQueueSnapshotRef.current = null;
  };

  const seekTo = (time: number) => {
    if (!audioRef.current || !duration) return;
    const nextTime = Math.max(0, Math.min(time, duration));
    audioRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const createPlaylist = (name: string) => {
    const normalizedName = name.trim();
    if (!normalizedName) return null;

    const playlistId = window.crypto?.randomUUID?.() ?? `playlist-${Date.now()}`;
    setPlaylists((prev) => [
      ...prev,
      {
        id: playlistId,
        name: normalizedName,
        tracks: [],
        createdAt: Date.now(),
      },
    ]);

    return playlistId;
  };

  const renamePlaylist = (playlistId: string, name: string) => {
    const normalizedName = name.trim();
    if (!normalizedName) return;

    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId ? { ...playlist, name: normalizedName } : playlist
      )
    );
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => prev.filter((playlist) => playlist.id !== playlistId));
  };

  const addTrackToPlaylist = (playlistId: string, track: Track) => {
    const normalized = normalizeTrack(track);
    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.id !== playlistId) return playlist;

        const exists = playlist.tracks.some((item) => item.id === normalized.id);
        if (exists) return playlist;

        return {
          ...playlist,
          tracks: [...playlist.tracks, normalized],
        };
      })
    );
  };

  // play next
  const playNext = () => {
    if (!currentTrack || !queue.length) {
      setIsPlaying(false);
      setQueueSourceStartIndex(0);
      setQueueSourceLabel(null);
      setShuffleEnabled(false);
      shuffledSourceSnapshotRef.current = null;
      preShuffleQueueSnapshotRef.current = null;
      return;
    }

    const next = queue[0];
    const nextQueue = queue.slice(1);
    const nextQueueSourceStartIndex = Math.max(0, queueSourceStartIndex - 1);

    updatePlaybackQueue(next, nextQueue, nextQueueSourceStartIndex, nextQueue.length ? queueSourceLabel : null, {
      addToHistory: true,
      countStream: true,
      preserveShuffle: true,
    });
  };

  // play previous
  const playPrevious = () => {
    if (!history.length) return;
    const prevTrack = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    const restoredQueue = currentTrack ? [currentTrack, ...queue] : queue;
    updatePlaybackQueue(prevTrack, restoredQueue, queueSourceStartIndex + 1, queueSourceLabel, {
      addToHistory: false,
      countStream: false,
      preserveShuffle: true,
    });
  };

  // jump to a specific track in queue
  const jumpToTrack = (trackKey: string) => {
    const idx = queue.findIndex((t) => getTrackKey(t) === trackKey);
    if (idx < 0) return;
    const selected = queue[idx];
    const nextQueue = queue.slice(idx + 1);
    const nextQueueSourceStartIndex = Math.max(0, queueSourceStartIndex - (idx + 1));
    updatePlaybackQueue(selected, nextQueue, nextQueueSourceStartIndex, nextQueue.length ? queueSourceLabel : null, {
      addToHistory: true,
      preserveShuffle: true,
    });
  };

  // return popular tracks
  const getPopularTracks = (allTracks: Track[], top = 4) => {
    const ranked = [...allTracks]
      .map((track, index) => {
        const release = discography.find((item) => item.tracks.includes(track));
        return {
          track,
          index,
          count: playCounts[getTrackKey(track)] || 0,
          releaseType: release?.type ?? "Single",
          releaseYear: release?.year ?? 0,
        };
      })
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        if (a.releaseType !== b.releaseType) return a.releaseType === "Album" ? -1 : 1;
        if (b.releaseYear !== a.releaseYear) return b.releaseYear - a.releaseYear;
        return a.index - b.index;
      });

    const seen = new Set<string>();
    return ranked
      .filter(({ track }) => {
        const trackKey = getTrackKey(track);
        if (seen.has(trackKey)) return false;
        seen.add(trackKey);
        return true;
      })
      .slice(0, top)
      .map(({ track }) => track);
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
        queueSourceStartIndex,
        queueSourceLabel,
        shuffleEnabled,
        history,
        currentTime,
        duration,
        playTrack,
        playAll,
        togglePlay,
        playNext,
        playPrevious,
        jumpToTrack,
        reorderQueue,
        removeFromQueue,
        addToQueue,
        toggleShuffle,
        seekTo,
        playlists,
        createPlaylist,
        renamePlaylist,
        deletePlaylist,
        addTrackToPlaylist,
        getPopularTracks,
        playCounts,
        monthlyListeners,
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
