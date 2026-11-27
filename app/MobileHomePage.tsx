"use client";

import type { Release, Track } from "./data/music";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { usePlayer } from "./context/PlayerContext";
import { latestRelease, discography, artist, allTracks, getTrackKey, getTrackStreamCount, thisIsDavidPlaylist } from "./data/music";
import { FaPlay, FaPause, FaEllipsisV } from "react-icons/fa";
import { FastAverageColor } from "fast-average-color";
import PlaylistCover from "./components/PlaylistCover";

export default function MobileHomePage() {
  const {
    playTrack,
    playAll,
    addToQueue,
    currentTrack,
    isPlaying,
    monthlyListeners,
    playlists,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    getPopularTracks,
    playCounts,
  } = usePlayer();
  const [activeTab, setActiveTab] = useState<"Popular releases" | "Albums" | "Singles and EPs">("Popular releases");
  const [artistColor, setArtistColor] = useState("#000");
  const [playlistName, setPlaylistName] = useState("");
  const [openPopularMenuKey, setOpenPopularMenuKey] = useState<string | null>(null);
  const [openPlaylistMenuId, setOpenPlaylistMenuId] = useState<string | null>(null);
  const [renamingPlaylistId, setRenamingPlaylistId] = useState<string | null>(null);
  const [renamingPlaylistName, setRenamingPlaylistName] = useState("");
  const [modalTrack, setModalTrack] = useState<ReturnType<typeof getPopularTracks>[number] | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [expandedPopular, setExpandedPopular] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const popularTracks = useMemo(() => getPopularTracks(allTracks, 10), [getPopularTracks]);
  const visiblePopularTracks = expandedPopular ? popularTracks.slice(0, 10) : popularTracks.slice(0, 5);
  const canExpandPopular = popularTracks.length > 5;
  const filteredReleases = getReleasesForTab(activeTab);

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
    setOpenPopularMenuKey(null);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col gap-6 px-4 py-4 pb-48">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-white/10">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${artistColor}, rgba(0,0,0,0.92))` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_30%)]" />
        <div className="relative flex items-center gap-4 p-5">
          <Image
            src={artist.image}
            alt={artist.name}
            width={84}
            height={84}
            className="rounded-full object-cover ring-2 ring-white/20"
          />
          <div className="min-w-0 space-y-1">
            <h1 className="truncate text-3xl font-black">{artist.name}</h1>
            <p className="text-sm text-white/70">{monthlyListeners.toLocaleString()} monthly listeners</p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
        <h2 className="mb-3 text-2xl font-bold">Popular</h2>
        <div className="space-y-1">
          {visiblePopularTracks.map((track, index) => {
            const trackKey = getTrackKey(track);
            const isMenuOpen = openPopularMenuKey === trackKey;

            return (
              <button
                key={track.file}
                onClick={() => playTrack(track)}
                className="group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-white/5"
              >
                <span className="w-5 shrink-0 text-center text-sm text-white/60">{index + 1}</span>
                <Image
                  src={track.cover || "/images/placeholder.jpg"}
                  alt={track.title}
                  width={36}
                  height={36}
                  className="rounded object-cover"
                />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{track.title}</span>
                <span className="w-12 shrink-0 text-right text-sm text-white/60">
                  {getTrackStreamCount(track, playCounts).toLocaleString()}
                </span>

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenPopularMenuKey(isMenuOpen ? null : trackKey);
                  }}
                  className="ml-1 flex h-7 w-7 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                  aria-label={`More actions for ${track.title}`}
                >
                  <FaEllipsisV size={12} />
                </button>

                {isMenuOpen && (
                  <div
                    className="absolute right-2 top-10 z-20 w-52 rounded-xl border border-white/10 bg-black/95 p-2 shadow-2xl"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        addToQueue(track);
                        setOpenPopularMenuKey(null);
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
                            setOpenPopularMenuKey(null);
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
                setOpenPopularMenuKey(null);
              }}
              className="mt-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
            >
              See more
            </button>
          )}

          {canExpandPopular && expandedPopular && (
            <button
              onClick={() => {
                setExpandedPopular(false);
                setOpenPopularMenuKey(null);
              }}
              className="mt-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
            >
              Show less
            </button>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-bold">Artist Pick</h2>
        <Link
          href={`/releases/${latestRelease.slug}`}
          className="group flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 p-3 transition active:bg-white/10"
        >
          <Image
            src={latestRelease.cover}
            alt={latestRelease.title}
            width={72}
            height={72}
            className="shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{latestRelease.title}</p>
            <p className="mt-1 text-sm text-white/70">These words came from a different place. I hope you enjoy.</p>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              playAll(latestRelease.tracks, latestRelease.title);
            }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-600 text-white"
            aria-label={`Play ${latestRelease.title}`}
          >
            <FaPlay size={12} />
          </button>
        </Link>
      </section>

      <section>
        <div className="mb-4">
          <div>
            <h2 className="text-2xl font-bold">Discography</h2>
            <p className="text-xs text-white/55">Browse the catalog by release type.</p>
          </div>
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {(["Popular releases", "Albums", "Singles and EPs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === tab ? "bg-white text-black" : "bg-white/10 text-white/80"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredReleases.map((release) => (
            <MobileReleaseCard
              key={release.slug}
              release={release}
              playTrack={playTrack}
              playAll={playAll}
              addToQueue={addToQueue}
              isPlaying={isPlaying}
              currentTrackKey={currentTrack ? getTrackKey(currentTrack) : undefined}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Featuring David</h2>
        <Link href={`/playlists/${thisIsDavidPlaylist.slug}`} className="group block max-w-[11rem]">
          <Image
            src={thisIsDavidPlaylist.cover}
            alt={thisIsDavidPlaylist.title}
            width={176}
            height={176}
            className="aspect-square w-full rounded-[1.25rem] border border-white/10 object-cover"
          />
          <h3 className="mt-2 truncate text-base font-bold">{thisIsDavidPlaylist.title}</h3>
          <p className="mt-1 line-clamp-2 max-w-[176px] text-xs leading-4 text-white/60">
            This is David. The best tracks all in one playlist.
          </p>
        </Link>
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-bold">About</h2>
        <button
          type="button"
          onClick={() => setAboutOpen(true)}
          className="relative block aspect-[4/3] w-full overflow-hidden rounded-[1.25rem] border border-white/10 text-left"
          aria-label="Read the full David bio"
        >
          <Image
            src="/images/Him.png"
            alt="David"
            fill
            sizes="100vw"
            className="object-cover object-[50%_35%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent" />
          <p className="absolute bottom-4 left-4 right-4 line-clamp-3 text-sm leading-5 text-white/90">
            David loves making music. He makes proper music that he releases on Spotify, but this is where he allows himself be silly and put out the badly mixed and mastered songs he makes. He records his vocals with WhatsApp's vn feature, and he makes the instrumentals and does the full production with cheap earphones...
          </p>
        </button>
      </section>

      <section className="mb-16 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">Playlists</h2>
        </div>

        <form
          onSubmit={handleCreatePlaylist}
          className="mb-4 flex gap-2"
        >
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

        {playlists.length === 0 ? (
          <p className="text-sm text-white/65">Create a playlist and it will appear here.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="space-y-2">
                <div className="group relative">
                  <Link href={`/playlists/${playlist.id}`} className="block">
                    <PlaylistCover tracks={playlist.tracks} className="aspect-square rounded-[1.25rem] border border-white/10" />
                  </Link>
                  <button
                    onClick={() => setOpenPlaylistMenuId(openPlaylistMenuId === playlist.id ? null : playlist.id)}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white opacity-100"
                  >
                    <FaEllipsisV size={12} />
                  </button>

                  {openPlaylistMenuId === playlist.id && (
                    <div
                      className="absolute right-2 top-12 z-20 w-36 rounded-xl border border-white/10 bg-black/95 p-2 shadow-2xl"
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
                  <h3 className="truncate text-sm font-bold">{playlist.name}</h3>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

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
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-3"
          onClick={() => setAboutOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="About David"
            className="relative max-h-[92vh] w-full overflow-y-auto rounded-[1.25rem] border border-white/10 bg-gray-950"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setAboutOpen(false)}
              className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-2xl text-white/80"
              aria-label="Close bio"
            >
              ×
            </button>
            <div className="relative aspect-[4/3] bg-black">
              <Image
                src="/images/Him.png"
                alt="David"
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <div className="space-y-5 p-5">
              <h2 className="text-2xl font-bold">David</h2>
              <p className="text-sm leading-6 text-white/80">
                David loves making music. He makes proper music that he releases on Spotify, but this is where he allows himself be silly and put out the badly mixed and mastered songs he makes. He records his vocals with WhatsApp's vn feature, and he makes the instrumentals and does the full production with cheap earphones. His focus is the writing, the melody, the rhythm, and just enjoying what he does.
              </p>
              <p className="text-sm leading-6 text-white/80">
                With songs like "Musings", "Goodbye", "Healing Hurts", "Love Comes, Love Goes", David creates an avenue to release the emotions he has, exaggerating or downplaying the events that led to creating the songs. However, not all the songs are written from a personal place. It's up to you to figure out which ones are.
              </p>
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

      <div className="flex justify-center pb-6">
        <Link href="/" aria-label="Fluxify home" className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/70">
          <Image src="/favicon.ico" alt="Fluxify logo" width={20} height={20} className="rounded-sm" />
        </Link>
      </div>
    </div>
  );
}

function getReleasesForTab(tab: "Popular releases" | "Albums" | "Singles and EPs") {
  if (tab === "Albums") {
    return discography.filter((release) => release.type === "Album");
  }

  if (tab === "Singles and EPs") {
    return discography.filter((release) => release.type === "Single" || release.type === "EP");
  }

  return [latestRelease, ...discography.filter((release) => release.slug !== latestRelease.slug)];
}

function MobileReleaseCard({
  release,
  playTrack,
  playAll,
  addToQueue,
  isPlaying,
  currentTrackKey,
}: {
  release: Release;
  playTrack: (track: Track, albumQueue?: Track[], sourceLabel?: string) => void;
  playAll: (tracks: Track[], sourceLabel?: string) => void;
  addToQueue: (track: Track) => void;
  isPlaying: boolean;
  currentTrackKey?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="group relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/5 shadow-xl">
        <Link href={`/releases/${release.slug}`} className="block overflow-hidden rounded-[1.25rem]">
          <Image
            src={release.cover}
            alt={release.title}
            width={180}
            height={180}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => playAll(release.tracks, release.title)}
            className="rounded-full bg-pink-600 p-2 text-white"
          >
            {isPlaying && currentTrackKey === getTrackKey(release.tracks[0]) ? <FaPause /> : <FaPlay />}
          </button>
        </div>
      </div>
      <div>
        <h3 className="truncate text-sm font-bold">{release.title}</h3>
        <span className="text-xs text-gray-400">{release.year} · {release.type}</span>
      </div>
    </div>
  );
}
