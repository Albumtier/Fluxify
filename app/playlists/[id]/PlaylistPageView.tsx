"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FastAverageColor } from "fast-average-color";
import { FaArrowLeft, FaClock, FaEllipsisV, FaPause, FaPlay, FaRandom } from "react-icons/fa";
import { usePlayer } from "../../context/PlayerContext";
import { getTrackKey, getTrackStreamCount, type Track } from "../../data/music";
import PlaylistCover from "../../components/PlaylistCover";

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function PlaylistPageView({ mobile = false }: { mobile?: boolean }) {
  const params = useParams();
  const playlistId = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    playlists,
    playTrack,
    playAll,
    addToQueue,
    currentTrack,
    isPlaying,
    playCounts,
    createPlaylist,
    addTrackToPlaylist,
  } = usePlayer();

  const playlist = playlists.find((item) => item.id === playlistId);
  const [highlightColor, setHighlightColor] = useState("#f6bfd7");
  const [openMenuTrackKey, setOpenMenuTrackKey] = useState<string | null>(null);
  const [modalTrack, setModalTrack] = useState<Track | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  useEffect(() => {
    if (!playlist?.tracks.length) {
      setHighlightColor("#f6bfd7");
      return;
    }

    const fac = new FastAverageColor();
    fac
      .getColorAsync(playlist.tracks[0].cover || "/images/default-cover.jpg")
      .then((color) => setHighlightColor(color.hex))
      .catch(() => setHighlightColor("#f6bfd7"));
  }, [playlist]);

  if (!playlist) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl">Playlist not found</p>
      </div>
    );
  }

  const totalDuration = playlist.tracks.reduce((sum, track) => sum + (track.duration || 0), 0);
  const currentTrackKey = currentTrack ? getTrackKey(currentTrack) : null;
  const firstTrack = playlist.tracks[0];
  const sourceLabel = playlist.name;

  return (
    <div className={`min-h-screen bg-black text-white ${mobile ? "px-4 py-4 pb-32" : "p-4 md:p-8"}`}>
      <div className="mb-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-white hover:text-pink-500">
          <FaArrowLeft /> Back
        </Link>
      </div>

      <div className={`relative mb-10 overflow-hidden rounded-[2rem] border border-white/10 p-5 md:p-6 ${mobile ? "" : ""}`}>
        <div
          className="absolute inset-0 rounded-[2rem]"
          style={{ background: `linear-gradient(135deg, ${highlightColor} 0%, rgba(0,0,0,0.95) 65%)`, opacity: 0.96 }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%)] opacity-70" />

        <div className={`relative z-10 flex flex-col gap-6 ${mobile ? "" : "md:flex-row md:items-center"}`}>
          <div className={`relative ${mobile ? "w-full" : "flex-shrink-0"}`}>
            <PlaylistCover tracks={playlist.tracks} className={`${mobile ? "aspect-square w-full rounded-[1.25rem]" : "h-[300px] w-[300px] rounded-2xl"} border border-white/10 shadow-2xl`} />
          </div>

          <div className="flex max-w-2xl flex-col justify-center">
            <span className="text-sm uppercase tracking-[0.3em] text-gray-300">Playlist</span>
            <h1 className="mb-3 text-4xl font-black md:text-5xl">{playlist.name}</h1>
            <div className="flex flex-wrap items-center gap-2 text-gray-200">
              <span>• {playlist.tracks.length} songs</span>
              <span>• {formatDuration(totalDuration)}</span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => {
              if (!firstTrack) return;
              if (currentTrackKey === getTrackKey(firstTrack) && isPlaying) {
                playTrack(firstTrack, playlist.tracks, sourceLabel);
                return;
              }
              playAll(playlist.tracks, sourceLabel);
            }}
            disabled={!firstTrack}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-lime-400 text-black shadow-lg shadow-lime-400/20 hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {currentTrackKey && firstTrack && currentTrackKey === getTrackKey(firstTrack) && isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button
            onClick={() => {
              if (!playlist.tracks.length) return;
              const shuffled = [...playlist.tracks].sort(() => Math.random() - 0.5);
              playAll(shuffled, sourceLabel);
            }}
            disabled={!playlist.tracks.length}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaRandom />
          </button>
          </div>
        </div>
      </div>

      {playlist.tracks.length > 0 ? (
        <section className="mb-12 rounded-[1.75rem] border border-white/10 bg-white/5 p-4 md:p-6">
          <div className={`mb-4 ${mobile ? "grid grid-cols-[1.5rem_minmax(0,1fr)_4.5rem_2rem]" : "hidden md:grid grid-cols-[2rem_minmax(0,1fr)_8rem_2rem_6rem]"} items-center gap-3 px-4 text-sm uppercase tracking-[0.25em] text-white/45`}>
            <span>#</span>
            <span>Title</span>
            <span className="text-right">Plays</span>
            <span />
            {!mobile && <span className="text-right"><FaClock className="inline-block" /></span>}
          </div>

          <div className="space-y-1">
            {playlist.tracks.map((track, index) => {
              const isCurrent = currentTrackKey === getTrackKey(track);
              const isMenuOpen = openMenuTrackKey === getTrackKey(track);

              return (
                <div
                  key={track.file}
                  className={`group relative grid items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${mobile ? "grid-cols-[1.5rem_minmax(0,1fr)_4.5rem_2rem]" : "grid-cols-[2rem_minmax(0,1fr)_8rem_2rem_6rem]"} ${isCurrent ? "bg-white/10" : "hover:bg-white/5"}`}
                  onClick={() => playTrack(track, playlist.tracks, sourceLabel)}
                >
                  <span className="shrink-0 text-sm text-white/55">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{track.title}</div>
                    <div className="truncate text-sm text-white/50">{track.artist}</div>
                  </div>
                  <span className="shrink-0 text-right text-sm text-white/55">
                    {getTrackStreamCount(track, playCounts).toLocaleString()}
                  </span>

                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenMenuTrackKey(isMenuOpen ? null : getTrackKey(track));
                    }}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white ${
                      isMenuOpen || mobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                    aria-label={`More actions for ${track.title}`}
                  >
                    <FaEllipsisV size={14} />
                  </button>

                  {!mobile && <span className="shrink-0 text-right text-sm text-white/60">{formatDuration(track.duration)}</span>}

                  {isMenuOpen && (
                    <div
                      className="absolute right-2 top-11 z-20 w-56 rounded-xl border border-white/10 bg-black/95 p-2 shadow-2xl"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          addToQueue(track);
                          setOpenMenuTrackKey(null);
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10"
                      >
                        Add to queue
                      </button>

                      <div className="my-1 border-t border-white/10" />

                      {playlists.length > 0 ? (
                        playlists.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              addTrackToPlaylist(item.id, track);
                              setOpenMenuTrackKey(null);
                            }}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10"
                          >
                            Add to {item.name}
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-sm text-white/55">No playlists yet</p>
                      )}

                      <button
                        onClick={() => {
                          setModalTrack(track);
                          setNewPlaylistName("");
                        }}
                        className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10"
                      >
                        Create playlist and add
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-white/65">
          This playlist is empty. Add songs from the track menus on releases or the popular section.
        </section>
      )}

      {modalTrack && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const playlistId = createPlaylist(newPlaylistName);
              if (!playlistId) return;
              addTrackToPlaylist(playlistId, modalTrack);
              setModalTrack(null);
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
                  setModalTrack(null);
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
