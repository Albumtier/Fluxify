"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { discography, getReleaseStreamCount, getTrackKey, getTrackStreamCount, type Track } from "../../data/music";
import { usePlayer } from "../../context/PlayerContext";
import { FaPlay, FaPause, FaArrowLeft, FaEllipsisV } from "react-icons/fa";
import { FastAverageColor } from "fast-average-color";
import { useEffect, useState } from "react";

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function MobileReleasePage() {
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
  const [openTrackMenuKey, setOpenTrackMenuKey] = useState<string | null>(null);
  const [modalTrack, setModalTrack] = useState<Track | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  useEffect(() => {
    if (release) {
      const fac = new FastAverageColor();
      fac
        .getColorAsync(release.cover)
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

  const handleCreatePlaylistAndAdd = (event: React.FormEvent) => {
    event.preventDefault();
    if (!modalTrack) return;

    const createdPlaylistId = createPlaylist(newPlaylistName);
    if (!createdPlaylistId) return;

    addTrackToPlaylist(createdPlaylistId, modalTrack);
    setModalTrack(null);
    setNewPlaylistName("");
    setOpenTrackMenuKey(null);
  };

  // Get "More from David" dynamically (other releases excluding current)
  const moreFromDavid = discography.filter((item) => item.slug !== slug);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-4 space-y-4 pb-32">
      {/* Back Button */}
      <div className="flex items-center mb-2">
        <Link href="/" className="p-2 rounded-full bg-gray-800">
          <FaArrowLeft />
        </Link>
      </div>

      {/* Album Header */}
      <div className="relative flex gap-4 overflow-hidden rounded-[1.75rem] border border-white/10 p-4" style={{ minHeight: "140px" }}>
        {/* Background highlight */}
        <div
          className="absolute inset-0 rounded-[1.75rem] z-0"
          style={{ background: `linear-gradient(135deg, ${highlightColor} 0%, rgba(0,0,0,0.95) 65%)`, opacity: 0.95 }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_30%)] opacity-70" />

        {/* Album Art */}
        <Image
          src={release.cover}
          alt={release.title}
          width={120}
          height={120}
          className="rounded-2xl object-cover z-10 flex-shrink-0 shadow-xl"
        />

        {/* Album info */}
        <div className="flex flex-1 flex-col justify-center z-10 min-w-0">
          <span className="text-sm uppercase tracking-[0.25em] text-gray-300">{release.type}</span>
          <h1 className="mt-1 truncate text-2xl font-black">{release.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-200">
            <span>{release.year}</span>
            <span>• {release.tracks.length} songs</span>
            <span>• {formatDuration(totalDuration)}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Image
              src="/images/artist.jpg"
              alt="Artist"
              width={30}
              height={30}
              className="rounded-full"
            />
            <span className="font-semibold">David</span>
          </div>
        </div>

        {/* Small circular Play All button */}
        <button
          onClick={() => playAll(release.tracks, release.title)}
          className="ml-auto z-10 bg-pink-600 p-3 rounded-full text-white flex-shrink-0 w-10 h-10 flex items-center justify-center"
        >
          {isPlaying && currentTrack && getTrackKey(currentTrack) === getTrackKey(release.tracks[0]) ? <FaPause /> : <FaPlay />}
        </button>
      </div>

      {/* Tracklist */}
      <div className="flex flex-col gap-2 overflow-y-auto pb-5" style={{ maxHeight: "calc(100vh - 360px)" }}>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-3">
          <div className="mb-3 flex items-center justify-between px-1 text-xs uppercase tracking-[0.25em] text-white/45">
            <span>#</span>
            <span className="flex-1 px-3">Title</span>
            <span className="w-16 text-right">Plays</span>
          </div>

          <div className="flex flex-col gap-1">
            {release.tracks.map((track, index) => {
              const trackKey = getTrackKey(track);
              const isMenuOpen = openTrackMenuKey === trackKey;

              return (
                <div key={track.file} className="relative">
                  <button
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 pr-12 text-left hover:bg-white/5"
                    onClick={() => playTrack(track, release.tracks, release.title)}
                  >
                    <span className="w-5 shrink-0 text-sm text-white/55">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{track.title}</div>
                      <div className="truncate text-xs text-white/45">{track.artist}</div>
                    </div>
                    <span className="w-16 shrink-0 text-right text-xs text-white/55">
                      {getTrackStreamCount(track, playCounts).toLocaleString()}
                    </span>
                  </button>

                  <button
                    onClick={() => setOpenTrackMenuKey(isMenuOpen ? null : trackKey)}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                    aria-label={`More actions for ${track.title}`}
                  >
                    <FaEllipsisV size={12} />
                  </button>

                  {isMenuOpen && (
                    <div
                      className="absolute right-2 top-[calc(100%+0.25rem)] z-20 w-56 rounded-xl border border-white/10 bg-black/95 p-2 shadow-2xl"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          addToQueue(track);
                          setOpenTrackMenuKey(null);
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
                              setOpenTrackMenuKey(null);
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
        </div>
      </div>

      {/* More from David */}
      {moreFromDavid.length > 0 && (
        <section className="mt-4 pb-10">
          <h2 className="text-xl font-semibold mb-2">More from David</h2>
          <div className="flex overflow-x-auto gap-4 pb-4">
            {moreFromDavid.map((item) => (
              <div key={item.slug} className="relative min-w-[120px]">
                <Link href={`/releases/${item.slug}`} className="block overflow-hidden rounded-xl">
                  <Image
                    src={item.cover}
                    alt={item.title}
                    width={120}
                    height={120}
                    className="rounded-xl object-cover w-full h-full"
                  />
                </Link>

                {/* Play button overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playTrack(item.tracks[0], item.tracks, item.title);
                  }}
                  className="absolute bottom-14 right-1 bg-pink-600 p-2 rounded-full text-white z-20"
                >
                  {isPlaying && currentTrack && getTrackKey(currentTrack) === getTrackKey(item.tracks[0]) ? <FaPause /> : <FaPlay />}
                </button>

                <div className="mt-2 text-center">
                  <h3 className="text-sm font-bold truncate">{item.title}</h3>
                  <span className="text-gray-400 text-xs">{item.type} · {getReleaseStreamCount(item, playCounts).toLocaleString()} streams</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {modalTrack && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
          <form onSubmit={handleCreatePlaylistAndAdd} className="w-full max-w-md rounded-2xl border border-white/15 bg-gray-950 p-5">
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
