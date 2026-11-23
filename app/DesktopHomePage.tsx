"use client";

import type { Release, Track } from "./data/music";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { usePlayer } from "./context/PlayerContext";
import { latestRelease, discography, allTracks, artist, getTrackKey, getTrackStreamCount, thisIsDavidPlaylist } from "./data/music";
import { FastAverageColor } from "fast-average-color";
import { FaPlay, FaEllipsisV } from "react-icons/fa";
import PlaylistCover from "./components/PlaylistCover";

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function HomePage() {
  const {
    playTrack,
    addToQueue,
    playAll,
    getPopularTracks,
    playCounts,
    monthlyListeners,
    playlists,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
    addTrackToPlaylist,
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<"Popular releases" | "Albums" | "Singles and EPs">("Popular releases");
  const [artistColor, setArtistColor] = useState("#000");
  const [playlistName, setPlaylistName] = useState("");
  const [openMenuTrackKey, setOpenMenuTrackKey] = useState<string | null>(null);
  const [openPlaylistMenuId, setOpenPlaylistMenuId] = useState<string | null>(null);
  const [renamingPlaylistId, setRenamingPlaylistId] = useState<string | null>(null);
  const [renamingPlaylistName, setRenamingPlaylistName] = useState("");
  const [modalTrack, setModalTrack] = useState<Track | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [expandedPopular, setExpandedPopular] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const filteredReleases = getReleasesForTab(activeTab);
  const popularTracks = useMemo(() => getPopularTracks(allTracks, 10), [allTracks, getPopularTracks]);
  const visiblePopularTracks = expandedPopular ? popularTracks.slice(0, 10) : popularTracks.slice(0, 5);
  const canExpandPopular = popularTracks.length > 5;

  useEffect(() => {
    const fac = new FastAverageColor();
    fac
      .getColorAsync(artist.image)
      .then((color) => setArtistColor(color.hex))
      .catch(() => setArtistColor("#000"));
  }, []);

  const handleCreatePlaylist = (event: FormEvent) => {
    event.preventDefault();
    const created = createPlaylist(playlistName);
    if (created) {
      setPlaylistName("");
    }
  };

  const handleCreatePlaylistAndAdd = (event: FormEvent) => {
    event.preventDefault();
    if (!modalTrack) return;

    const createdPlaylistId = createPlaylist(newPlaylistName);
    if (!createdPlaylistId) return;

    addTrackToPlaylist(createdPlaylistId, modalTrack);
    setModalTrack(null);
    setNewPlaylistName("");
    setOpenMenuTrackKey(null);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 pb-[38rem] md:px-8 md:py-8 space-y-10">
        <section>
          <div
            className="relative overflow-hidden rounded-[2rem] border border-white/10 p-8 shadow-2xl md:p-10"
            style={{ background: `linear-gradient(135deg, ${artistColor} 0%, rgba(0,0,0,0.94) 62%)` }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.12),transparent_28%)] opacity-80" />
            <div className="relative flex flex-col items-start gap-5 md:flex-row md:items-center md:gap-8">
              <Image
                src={artist.image}
                alt={artist.name}
                width={168}
                height={168}
                className="rounded-full object-cover ring-4 ring-white/10 shadow-lg"
              />
              <div className="space-y-2">
                <h1 className="text-5xl font-black tracking-tight md:text-6xl">{artist.name}</h1>
                <p className="text-base text-white/75 md:text-lg">{monthlyListeners.toLocaleString()} monthly listeners</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 md:p-6">
          <h2 className="mb-4 text-3xl font-bold">Popular</h2>
          <div className="space-y-1">
            {visiblePopularTracks.map((track, index) => {
              const trackKey = getTrackKey(track);
              const isMenuOpen = openMenuTrackKey === trackKey;

              return (
                <button
                  key={track.file}
                  onClick={() => playTrack(track)}
                  className="group relative flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left hover:bg-white/5"
                >
                  <span className="w-6 shrink-0 text-center text-xl text-white/60">{index + 1}</span>
                  <Image
                    src={track.cover || "/images/placeholder.jpg"}
                    alt={track.title}
                    width={40}
                    height={40}
                    className="rounded object-cover"
                  />
                  <span className="min-w-0 flex-1 truncate text-xl font-semibold">{track.title}</span>
                  <span className="w-28 shrink-0 text-right text-xl text-white/65">{getTrackStreamCount(track, playCounts).toLocaleString()}</span>

                  <span
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenMenuTrackKey(isMenuOpen ? null : trackKey);
                    }}
                    className={`ml-2 flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white ${
                      isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <FaEllipsisV size={14} />
                  </span>

                  <span className="w-16 shrink-0 text-right text-xl text-white/65">{formatDuration(track.duration)}</span>

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
                        playlists.map((playlist) => (
                          <button
                            key={playlist.id}
                            onClick={() => {
                              addTrackToPlaylist(playlist.id, track);
                              setOpenMenuTrackKey(null);
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
                </button>
              );
            })}

            {canExpandPopular && !expandedPopular && (
              <button
                onClick={() => {
                  setExpandedPopular(true);
                  setOpenMenuTrackKey(null);
                }}
                className="mt-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
              >
                See more
              </button>
            )}

            {canExpandPopular && expandedPopular && (
              <button
                onClick={() => {
                  setExpandedPopular(false);
                  setOpenMenuTrackKey(null);
                }}
                className="mt-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
              >
                Show less
              </button>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-3xl font-bold">Artist Pick</h2>
          <Link
            href={`/releases/${latestRelease.slug}`}
            className="group flex max-w-2xl items-center gap-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
          >
            <Image
              src={latestRelease.cover}
              alt={latestRelease.title}
              width={128}
              height={128}
              className="rounded-xl object-cover shadow-xl"
            />
            <div className="min-w-0">
              <p className="truncate text-xl font-bold">{latestRelease.title}</p>
              <p className="mt-1 text-lg text-white/70">ENJOY!!!</p>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                playAll(latestRelease.tracks, latestRelease.title);
              }}
              className="ml-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-pink-600 text-white shadow-lg shadow-pink-600/20"
              aria-label={`Play ${latestRelease.title}`}
            >
              <FaPlay />
            </button>
          </Link>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-3xl font-bold">Discography</h2>
            <p className="text-sm text-white/60">Studio releases, singles, and the current featured drop.</p>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            {(["Popular releases", "Albums", "Singles and EPs"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  activeTab === tab ? "bg-white text-black" : "bg-white/10 text-white/80 hover:bg-white/15"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-6">
            {filteredReleases.map((release) => (
              <DiscographyCard key={release.slug} release={release} playAll={playAll} addToQueue={addToQueue} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-3xl font-bold">Featuring David</h2>
          <div className="max-w-xs space-y-3">
            <Link href={`/playlists/${thisIsDavidPlaylist.slug}`} className="group block">
              <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 shadow-xl">
                <Image
                  src={thisIsDavidPlaylist.cover}
                  alt={thisIsDavidPlaylist.title}
                  width={260}
                  height={260}
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="mt-3 truncate text-lg font-bold">{thisIsDavidPlaylist.title}</h3>
              <p className="mt-1 line-clamp-2 max-w-[260px] text-sm leading-5 text-white/60">
                This is David. The best tracks all in one playlist.
              </p>
            </Link>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-3xl font-bold">About</h2>
          <button
            type="button"
            onClick={() => setAboutOpen(true)}
            className="relative block aspect-[2/1] w-full max-w-4xl overflow-hidden rounded-[1.75rem] border border-white/10 text-left"
            aria-label="Read the full David bio"
          >
            <Image
              src="/images/Him.png"
              alt="David"
              fill
              sizes="(max-width: 768px) 100vw, 900px"
              className="object-cover object-[50%_35%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent" />
            <p className="absolute bottom-5 left-5 right-5 max-w-3xl overflow-hidden text-lg leading-7 text-white/90 md:text-xl"
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 3,
              }}
            >
              David loves making music. He makes proper music that he releases on Spotify, but this is where he allows himself be silly and put out the badly mixed and mastered songs he makes. He records his vocals with WhatsApp's vn feature, and he makes the instrumentals and does the full production with cheap earphones...
            </p>
          </button>
        </section>

        <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 md:p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-3xl font-bold">Playlists</h2>
            <form onSubmit={handleCreatePlaylist} className="flex w-full max-w-md gap-2">
              <input
                value={playlistName}
                onChange={(event) => setPlaylistName(event.target.value)}
                placeholder="New playlist name"
                className="flex-1 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm outline-none focus:border-white/35"
              />
              <button type="submit" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
                Create
              </button>
            </form>
          </div>

          {playlists.length === 0 ? (
            <p className="text-white/65">No playlists yet. Create one and start adding songs from track menus.</p>
          ) : (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-5">
              {playlists.map((playlist) => (
                <div key={playlist.id} className="space-y-3">
                  <div className="group relative">
                    <Link href={`/playlists/${playlist.id}`} className="block">
                      <PlaylistCover
                        tracks={playlist.tracks}
                        className="aspect-square rounded-[1.5rem] border border-white/10 shadow-xl transition-transform duration-300 hover:scale-[1.02]"
                      />
                    </Link>
                    <button
                      onClick={() => setOpenPlaylistMenuId(openPlaylistMenuId === playlist.id ? null : playlist.id)}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                    >
                      <FaEllipsisV size={14} />
                    </button>

                    {openPlaylistMenuId === playlist.id && (
                      <div
                        className="absolute right-3 top-14 z-20 w-40 rounded-xl border border-white/10 bg-black/95 p-2 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setRenamingPlaylistId(playlist.id);
                            setRenamingPlaylistName(playlist.name);
                            setOpenPlaylistMenuId(null);
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => {
                            deletePlaylist(playlist.id);
                            setOpenPlaylistMenuId(null);
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-white/10"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <Link href={`/playlists/${playlist.id}`} className="block">
                    <h3 className="truncate text-lg font-bold">{playlist.name}</h3>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex justify-center pb-6">
          <Link href="/" aria-label="Fluxify home" className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/70">
            <Image src="/favicon.ico" alt="Fluxify logo" width={24} height={24} className="rounded-sm" />
          </Link>
        </div>
      </main>

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

      {aboutOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setAboutOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="About David"
            className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[1.75rem] border border-white/10 bg-gray-950"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setAboutOpen(false)}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-2xl text-white/80 hover:bg-black hover:text-white"
              aria-label="Close bio"
            >
              ×
            </button>
            <div>
              <div className="relative h-[22rem] bg-black md:h-[26rem]">
                <Image
                  src="/images/Him.png"
                  alt="David"
                  fill
                  sizes="(max-width: 768px) 100vw, 900px"
                  className="object-contain"
                />
              </div>
              <div className="space-y-6 p-6 md:p-8">
                <h2 className="text-3xl font-bold">David</h2>
                <p className="text-base leading-7 text-white/80">
                  David loves making music. He makes proper music that he releases on Spotify, but this is where he allows himself be silly and put out the badly mixed and mastered songs he makes. He records his vocals with WhatsApp's vn feature, and he makes the instrumentals and does the full production with cheap earphones. His focus is the writing, the melody, the rhythm, and just enjoying what he does.
                </p>
                <p className="text-base leading-7 text-white/80">
                  With songs like "Musings", "Goodbye", "Healing Hurts", "Love Comes, Love Goes", David creates an avenue to release the emotions he has, exaggerating or downplaying the events that led to creating the songs. However, not all the songs are written from a personal place. It's up to you to figure out which ones are.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {renamingPlaylistId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              renamePlaylist(renamingPlaylistId, renamingPlaylistName);
              setRenamingPlaylistId(null);
              setRenamingPlaylistName("");
            }}
            className="w-full max-w-md rounded-2xl border border-white/15 bg-gray-950 p-5"
          >
            <h3 className="text-lg font-semibold">Rename playlist</h3>
            <input
              value={renamingPlaylistName}
              onChange={(event) => setRenamingPlaylistName(event.target.value)}
              className="mt-4 w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-sm outline-none focus:border-white/40"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRenamingPlaylistId(null);
                  setRenamingPlaylistName("");
                }}
                className="rounded-full border border-white/20 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button type="submit" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function getReleasesForTab(tab: "Popular releases" | "Albums" | "Singles and EPs") {
  if (tab === "Albums") {
    return discography.filter((release) => release.type === "Album");
  }

  if (tab === "Singles and EPs") {
    return discography.filter((release) => release.type === "Single");
  }

  return [latestRelease, ...discography.filter((release) => release.slug !== latestRelease.slug)];
}

function DiscographyCard({
  release,
  playAll,
  addToQueue,
}: {
  release: Release;
  playAll: (tracks: Track[], sourceLabel?: string) => void;
  addToQueue: (track: Track) => void;
}) {
  const [bgColor, setBgColor] = useState("#000");

  useEffect(() => {
    const fac = new FastAverageColor();
    fac
      .getColorAsync(release.cover)
      .then((color) => setBgColor(color.hex))
      .catch(() => setBgColor("#000"));
  }, [release.cover]);

  return (
    <div className="space-y-3">
      <div className="group relative overflow-hidden rounded-[1.5rem] border border-white/10 shadow-xl" style={{ background: bgColor }}>
        <Link href={`/releases/${release.slug}`} className="block">
          <Image
            src={release.cover}
            alt={release.title}
            width={260}
            height={260}
            className="h-full w-full rounded-[1.5rem] object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => playAll(release.tracks, release.title)}
            className="rounded-full bg-pink-600 p-2 text-white shadow-lg shadow-pink-600/20"
          >
            <FaPlay />
          </button>
        </div>
      </div>
      <div>
        <h3 className="truncate text-lg font-bold">{release.title}</h3>
        <span className="text-sm text-gray-400">{release.year} · {release.type}</span>
      </div>
    </div>
  );
}
