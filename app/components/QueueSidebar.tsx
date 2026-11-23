"use client";

import { usePlayer } from "@/app/context/PlayerContext";
import { FaTimes, FaEllipsisV } from "react-icons/fa";
import Image from "next/image";
import { getTrackKey } from "@/app/data/music";
import { useState } from "react";

export default function QueueSidebar({ onClose }: { onClose: () => void }) {
  const {
    queue,
    currentTrack,
    jumpToTrack,
    reorderQueue,
    removeFromQueue,
    queueSourceStartIndex,
    queueSourceLabel,
    playlists,
    createPlaylist,
    addTrackToPlaylist,
  } = usePlayer();
  const [openMenuTrackKey, setOpenMenuTrackKey] = useState<string | null>(null);
  const [modalTrackKey, setModalTrackKey] = useState<string | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  if (!currentTrack) return null;

  const nowPlaying = [currentTrack];
  const nextInQueue = queue.slice(0, queueSourceStartIndex);
  const nextFromSource = queue.slice(queueSourceStartIndex);

  const renderQueueItem = (track: typeof currentTrack, index: number, sectionStartIndex: number) => {
    const combinedIndex = sectionStartIndex + index;
    const trackKey = getTrackKey(track);
    const isMenuOpen = openMenuTrackKey === trackKey;

    return (
      <div
        key={trackKey}
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData("text/plain", String(combinedIndex));
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const fromIndex = Number(event.dataTransfer.getData("text/plain"));
          reorderQueue(fromIndex, combinedIndex);
        }}
        onClick={() => jumpToTrack(getTrackKey(track))}
        className="group relative mb-1 flex cursor-pointer items-center gap-2 rounded px-4 py-2 hover:bg-gray-700"
      >
        <Image
          src={track.cover || "/images/placeholder.jpg"}
          alt={track.title}
          width={40}
          height={40}
          className="rounded object-cover"
        />
        <span className="truncate">{track.title}</span>

        <button
          onClick={(event) => {
            event.stopPropagation();
            setOpenMenuTrackKey(isMenuOpen ? null : trackKey);
          }}
          className={`ml-auto flex h-7 w-7 items-center justify-center rounded-full text-gray-300 hover:bg-gray-600 hover:text-white ${
            isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          aria-label={`Queue actions for ${track.title}`}
        >
          <FaEllipsisV size={13} />
        </button>

        {isMenuOpen && (
          <div
            className="absolute right-2 top-9 z-20 w-52 rounded-lg border border-white/10 bg-gray-900 p-2 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => {
                removeFromQueue(combinedIndex);
                setOpenMenuTrackKey(null);
              }}
              className="w-full rounded px-3 py-2 text-left text-sm text-red-300 hover:bg-white/10"
            >
              Remove from queue
            </button>

            <div className="my-1 border-t border-white/10" />

            {playlists.length > 0 ? (
              playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => {
                    addTrackToPlaylist(playlist.id, track);
                    setOpenMenuTrackKey(null);
                  }}
                  className="w-full rounded px-3 py-2 text-left text-sm hover:bg-white/10"
                >
                  Add to {playlist.name}
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-white/60">No playlists yet</p>
            )}

            <button
              onClick={() => {
                setModalTrackKey(trackKey);
                setNewPlaylistName("");
              }}
              className="mt-1 w-full rounded px-3 py-2 text-left text-sm hover:bg-white/10"
            >
              Create playlist and add
            </button>
          </div>
        )}
      </div>
    );
  };

  const modalTrack = queue.find((track) => getTrackKey(track) === modalTrackKey) ?? null;

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
            <div key={track.file} className="mb-1 flex items-center gap-2 rounded bg-gray-700 px-4 py-2">
              <Image src={track.cover || "/images/placeholder.jpg"} alt={track.title} width={40} height={40} className="rounded object-cover" />
              <span className="truncate font-semibold">{track.title}</span>
            </div>
          ))}
        </div>

        {nextInQueue.length > 0 && (
          <div>
            <h3 className="px-2 py-1 text-sm text-gray-400 font-semibold uppercase">Next in queue</h3>
            {nextInQueue.map((track, index) => renderQueueItem(track, index, 0))}
          </div>
        )}

        {nextFromSource.length > 0 && (
          <div>
            <h3 className="px-2 py-1 text-sm text-gray-400 font-semibold uppercase">
              Next From: {queueSourceLabel || "Source"}
            </h3>
            {nextFromSource.map((track, index) => renderQueueItem(track, index, queueSourceStartIndex))}
          </div>
        )}
      </div>

      {modalTrack && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const playlistId = createPlaylist(newPlaylistName);
              if (!playlistId) return;
              addTrackToPlaylist(playlistId, modalTrack);
              setModalTrackKey(null);
              setNewPlaylistName("");
              setOpenMenuTrackKey(null);
            }}
            className="w-full max-w-md rounded-2xl border border-white/15 bg-gray-950 p-5"
          >
            <h3 className="text-lg font-semibold">Create playlist</h3>
            <p className="mt-1 text-sm text-white/65">Add {modalTrack.title} to a new playlist.</p>
            <input
              value={newPlaylistName}
              onChange={(event) => setNewPlaylistName(event.target.value)}
              placeholder="Playlist name"
              className="mt-4 w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-sm outline-none focus:border-white/40"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setModalTrackKey(null);
                  setNewPlaylistName("");
                }}
                className="rounded-full border border-white/20 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button type="submit" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
