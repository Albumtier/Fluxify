"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { discography, getTrackKey, getTrackStreamCount, type Track } from "../../data/music";
import { usePlayer } from "../../context/PlayerContext";
import { FaPlay, FaPause, FaArrowLeft, FaRandom, FaClock, FaEllipsisV } from "react-icons/fa";
import Image from "next/image";
import { FastAverageColor } from "fast-average-color";
import Link from "next/link";

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function ReleasePage() {
  const params = useParams();
  const { slug } = params;
  const release = discography.find((item) => item.slug === slug);

  const {
    playTrack,
    playAll,
    addToQueue,
    currentTrack,
    isPlaying,
    playCounts,
    playlists,
    createPlaylist,
    addTrackToPlaylist,
  } = usePlayer();
  const [highlightColor, setHighlightColor] = useState<string>("#000");
  const [openMenuTrackId, setOpenMenuTrackId] = useState<string | number | null>(null);
  const [modalTrack, setModalTrack] = useState<Track | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  useEffect(() => {
    if (release) {
      const fac = new FastAverageColor();
      fac.getColorAsync(release.cover)
        .then((color) => setHighlightColor(color.hex))
        .catch(() => setHighlightColor("#000"));
    }
  }, [release]);

  if (!release) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl">Album not found</p>
      </div>
    );
  }

  const totalDuration = release.tracks.reduce((sum, t) => sum + (t.duration || 0), 0);
  // Exclude current release for "More from David"
  const moreFromDavid = discography.filter((item) => item.slug !== slug);

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Back Button */}
      <div className="mb-4">
        <Link href="/" className="flex items-center gap-2 text-white font-semibold hover:text-pink-500">
          <FaArrowLeft /> Back
        </Link>
      </div>

      {/* Album Header */}
      <div className="relative flex flex-col gap-6 overflow-hidden rounded-[2rem] border border-white/10 p-5 mb-10 md:p-6 lg:flex-row lg:items-start">
        {/* Background highlight */}
        <div
          className="absolute inset-0 rounded-[2rem]"
          style={{ background: `linear-gradient(135deg, ${highlightColor} 0%, rgba(0,0,0,0.95) 65%)`, opacity: 0.95, zIndex: 0 }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%)] opacity-70" />

        {/* Album art */}
        <Image
          src={release.cover}
          alt={release.title}
          width={300}
          height={300}
          className="rounded-2xl object-cover z-10 flex-shrink-0 shadow-2xl"
        />

        {/* Title + artist details */}
        <div className="flex max-w-2xl flex-col justify-center z-10">
          <span className="text-sm uppercase tracking-[0.3em] text-gray-300">{release.type}</span>
          <h1 className="mb-3 text-4xl font-black md:text-5xl">{release.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-gray-200">
            <Image
              src="/images/artist.jpg"
              alt="Artist"
              width={30}
              height={30}
              className="rounded-full"
            />
            <span className="font-semibold">{release.artist || "David"}</span>
            <span>• {release.year}</span>
            <span>• {release.tracks.length} songs</span>
            <span>• {formatDuration(totalDuration)}</span>
          </div>
        </div>

        <div className="lg:ml-auto z-10 flex items-center gap-3">
          <button
            onClick={() => {
              const firstTrack = release.tracks[0];
              if (currentTrack && getTrackKey(currentTrack) === getTrackKey(firstTrack) && isPlaying) {
                playTrack(firstTrack, release.tracks, release.title);
              } else {
                playAll(release.tracks, release.title);
              }
            }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-lime-400 text-black shadow-lg shadow-lime-400/20 hover:bg-lime-300"
          >
            {currentTrack && getTrackKey(currentTrack) === getTrackKey(release.tracks[0]) && isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button
            onClick={() => {
              const shuffled = [...release.tracks].sort(() => Math.random() - 0.5);
              playAll(shuffled, release.title);
            }}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/5"
          >
            <FaRandom />
          </button>
        </div>
      </div>

      <section className="mb-12 rounded-[1.75rem] border border-white/10 bg-white/5 p-4 md:p-6">
        <div className="mb-4 grid grid-cols-[2rem_minmax(0,1fr)_4.5rem_2rem] items-center gap-3 px-4 text-xs uppercase tracking-[0.2em] text-white/45 md:grid-cols-[2rem_minmax(0,1fr)_8rem_2rem_6rem] md:text-sm md:tracking-[0.25em]">
          <span>#</span>
          <span>Title</span>
          <span className="text-right">Plays</span>
          <span />
          <span className="hidden text-right md:block"><FaClock className="inline-block" /></span>
        </div>

        <div className="space-y-1">
            {release.tracks.map((track, index) => {
            const isCurrent = currentTrack ? getTrackKey(currentTrack) === getTrackKey(track) : false;
            const isMenuOpen = openMenuTrackId === track.id;
            return (
              <div
                key={track.file}
                className={`group relative grid grid-cols-[2rem_minmax(0,1fr)_4.5rem_2rem] items-center gap-3 rounded-2xl px-4 py-3 text-left transition md:grid-cols-[2rem_minmax(0,1fr)_8rem_2rem_6rem] ${
                  isCurrent ? "bg-white/10" : "hover:bg-white/5"
                }`}
                onClick={() => playTrack(track, release.tracks, release.title)}
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
                    setOpenMenuTrackId(isMenuOpen ? null : track.id);
                  }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white ${
                    isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                  aria-label={`More actions for ${track.title}`}
                >
                  <FaEllipsisV size={14} />
                </button>
                <span className="hidden shrink-0 text-right text-sm text-white/60 md:block">{formatDuration(track.duration)}</span>

                {isMenuOpen && (
                  <div
                    className="absolute right-2 top-11 z-20 w-56 rounded-xl border border-white/10 bg-black/95 p-2 shadow-2xl"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        addToQueue(track);
                        setOpenMenuTrackId(null);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10"
                    >
                      Add to queue
                    </button>

                    <div className="my-1 border-t border-white/10" />

                    {playlists.length > 0 ? (
                      playlists.map((playlist) => (
                        <button
                          key={playlist.id}
                          onClick={() => {
                            addTrackToPlaylist(playlist.id, track);
                            setOpenMenuTrackId(null);
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10"
                        >
                          Add to {playlist.name}
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

      {/* More from David */}
      {moreFromDavid.length > 0 && (
        <section className="pb-20"> {/* Padding bottom so playerbar doesn't block */}
          <h2 className="text-2xl font-semibold mb-4">More from David</h2>
          <div className="grid grid-cols-3 gap-6">
            {moreFromDavid.map((item) => (
              <div
                key={item.slug}
                className="relative group rounded-xl overflow-hidden"
              >
                <Link href={`/releases/${item.slug}`} className="block">
                  <Image
                    src={item.cover}
                    alt={item.title}
                    width={200}
                    height={200}
                    className="rounded-xl object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
                  />
                </Link>

                {/* Hover Play button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playTrack(item.tracks[0], item.tracks, item.title);
                  }}
                  className="absolute bottom-14 right-2 bg-pink-600 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                >
                  {isPlaying && currentTrack && getTrackKey(currentTrack) === getTrackKey(item.tracks[0]) ? <FaPause /> : <FaPlay />}
                </button>

                <div className="mt-2 text-center">
                  <h3 className="text-sm font-bold truncate">{item.title}</h3>
                  <span className="text-gray-400 text-xs">{item.type}</span>
                </div>
              </div>
            ))}
          </div>
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
              setOpenMenuTrackId(null);
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
