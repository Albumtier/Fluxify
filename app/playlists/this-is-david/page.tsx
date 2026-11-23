"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FastAverageColor } from "fast-average-color";
import { FaArrowLeft, FaCheck, FaClock, FaEllipsisV, FaPause, FaPlay, FaPlus, FaRandom } from "react-icons/fa";
import { usePlayer } from "../../context/PlayerContext";
import { discography, getTrackKey, thisIsDavidPlaylist, type Track } from "../../data/music";

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function ThisIsDavidPage() {
  const {
    playTrack,
    playAll,
    addToQueue,
    currentTrack,
    isPlaying,
    playlists,
    createPlaylist,
    addTrackToPlaylist,
  } = usePlayer();
  const [highlightColor, setHighlightColor] = useState("#000");
  const [openMenuTrackKey, setOpenMenuTrackKey] = useState<string | null>(null);
  const [modalTrack, setModalTrack] = useState<Track | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(window.localStorage.getItem("fluxify.savedPlaylist.this-is-david") === "true");

    const fac = new FastAverageColor();
    fac
      .getColorAsync(thisIsDavidPlaylist.cover)
      .then((color) => setHighlightColor(color.hex))
      .catch(() => setHighlightColor("#000"));
  }, []);

  const totalDuration = thisIsDavidPlaylist.tracks.reduce((sum, track) => sum + track.duration, 0);
  const firstTrack = thisIsDavidPlaylist.tracks[0];

  return (
    <div className="min-h-screen bg-black pb-32 text-white">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <header className="relative mb-5 hidden h-[420px] overflow-hidden rounded-[1.5rem] border border-white/10 md:block">
          <Image
            src="/images/PP.png"
            alt={thisIsDavidPlaylist.title}
            fill
            sizes="(min-width: 768px) 1150px"
            priority
            className="object-cover object-[50%_25%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/5" />
          <div className="absolute bottom-8 left-8 right-8 z-10">
            <p className="text-sm uppercase tracking-[0.25em] text-white/80">Public Playlist</p>
            <h1 className="mt-2 text-6xl font-black leading-none">{thisIsDavidPlaylist.title}</h1>
            <p className="mt-4 text-base text-white/85">This is David. The best tracks, all in one playlist.</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/85">
              <Image src="/favicon.ico" alt="Fluxify" width={28} height={28} className="rounded-sm" />
              <span className="font-semibold">Fluxify</span>
              <span>• {isSaved ? "1 save" : "0 saves"}</span>
              <span>• {thisIsDavidPlaylist.tracks.length} songs</span>
              <span>• {formatDuration(totalDuration)}</span>
            </div>
          </div>
        </header>

        <header className="relative mb-4 h-[380px] overflow-hidden rounded-[1.5rem] border border-white/10 md:hidden">
          <Image
            src="/images/PP.png"
            alt={thisIsDavidPlaylist.title}
            fill
            sizes="100vw"
            priority
            className="object-cover object-[50%_25%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/10" />
          <Link href="/" className="absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white">
            <FaArrowLeft />
          </Link>
          <div className="absolute bottom-6 left-5 right-5 z-10">
            <h1 className="text-4xl font-black leading-[0.92]">{thisIsDavidPlaylist.title}</h1>
          </div>
        </header>

        <div className="mb-5 md:hidden">
          <p className="text-base leading-6 text-white/85">This is David. The best tracks, all in one playlist.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/85">
            <Image src="/favicon.ico" alt="Fluxify" width={24} height={24} className="rounded-sm" />
            <span className="font-semibold">Fluxify</span>
            <span>• {isSaved ? "1 save" : "0 saves"}</span>
            <span>• {thisIsDavidPlaylist.tracks.length} songs</span>
            <span>• {formatDuration(totalDuration)}</span>
          </div>
        </div>

        <div className="mb-5 flex items-center gap-3">
            <button
              onClick={() => {
                const nextSaved = !isSaved;
                setIsSaved(nextSaved);
                window.localStorage.setItem("fluxify.savedPlaylist.this-is-david", String(nextSaved));
              }}
              className={`flex h-12 w-12 items-center justify-center rounded-full border ${
                isSaved ? "border-lime-400 bg-lime-400 text-black" : "border-white/20 text-white hover:bg-white/5"
              }`}
              aria-label={isSaved ? "Remove This is David from saved playlists" : "Save This is David"}
              title={isSaved ? "Saved" : "Save playlist"}
            >
              {isSaved ? <FaCheck /> : <FaPlus />}
            </button>
            <button
              onClick={() => playAll(thisIsDavidPlaylist.tracks, thisIsDavidPlaylist.title)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-lime-400 text-black shadow-lg shadow-lime-400/20"
              aria-label={`Play ${thisIsDavidPlaylist.title}`}
            >
              {currentTrack && firstTrack && getTrackKey(currentTrack) === getTrackKey(firstTrack) && isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button
              onClick={() => playAll([...thisIsDavidPlaylist.tracks].sort(() => Math.random() - 0.5), thisIsDavidPlaylist.title)}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 hover:bg-white/5"
              aria-label="Shuffle playlist"
            >
              <FaRandom />
            </button>
          </div>

        <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-3 md:p-5">
          <div className="mb-3 grid grid-cols-[2rem_minmax(0,1fr)_4rem_2rem] items-center gap-3 px-3 text-xs uppercase tracking-[0.2em] text-white/45 md:grid-cols-[2rem_minmax(0,1fr)_minmax(10rem,14rem)_2rem_6rem]">
            <span>#</span>
            <span>Title</span>
            <span className="hidden md:block">Album</span>
            <span />
            <span className="text-right"><FaClock className="inline-block" /></span>
          </div>

          <div className="space-y-1">
            {thisIsDavidPlaylist.tracks.map((track, index) => {
              const trackKey = getTrackKey(track);
              const isCurrent = currentTrack ? getTrackKey(currentTrack) === trackKey : false;
              const isMenuOpen = openMenuTrackKey === trackKey;

              return (
                <div
                  key={track.file}
                  className={`group relative grid grid-cols-[2rem_minmax(0,1fr)_4rem_2rem] items-center gap-3 rounded-xl px-3 py-3 md:grid-cols-[2rem_minmax(0,1fr)_minmax(10rem,14rem)_2rem_6rem] ${
                    isCurrent ? "bg-white/10" : "hover:bg-white/5"
                  }`}
                  onClick={() => playTrack(track, thisIsDavidPlaylist.tracks, thisIsDavidPlaylist.title)}
                >
                  <span className="text-sm text-white/55">{index + 1}</span>
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{track.title}</div>
                    <div className="truncate text-sm text-white/50">{track.artist}</div>
                  </div>
                  <div className="hidden truncate text-sm md:block">
                    {track.album ? (
                      (() => {
                        const release = discography.find((item) => item.title === track.album);
                        return release ? (
                          <Link
                            href={`/releases/${release.slug}`}
                            className="text-white/55 hover:text-white hover:underline"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {track.album}
                          </Link>
                        ) : (
                          <span className="text-white/55">{track.album}</span>
                        );
                      })()
                    ) : null}
                  </div>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenMenuTrackKey(isMenuOpen ? null : trackKey);
                    }}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10 ${
                      isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                    aria-label={`More actions for ${track.title}`}
                  >
                    <FaEllipsisV size={14} />
                  </button>
                  <span className="text-right text-sm text-white/60">{formatDuration(track.duration)}</span>

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
                      {playlists.map((playlist) => (
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
                      ))}
                      {playlists.length === 0 && <p className="px-3 py-2 text-sm text-white/55">No playlists yet</p>}
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
      </div>

      {modalTrack && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const createdPlaylistId = createPlaylist(newPlaylistName);
              if (createdPlaylistId) addTrackToPlaylist(createdPlaylistId, modalTrack);
              setModalTrack(null);
              setNewPlaylistName("");
              setOpenMenuTrackKey(null);
            }}
            className="w-full max-w-md rounded-2xl border border-white/15 bg-gray-950 p-5"
          >
            <h3 className="text-lg font-semibold">Create playlist</h3>
            <input
              value={newPlaylistName}
              onChange={(event) => setNewPlaylistName(event.target.value)}
              placeholder="Playlist name"
              className="mt-4 w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setModalTrack(null)} className="rounded-full border border-white/20 px-4 py-2">
                Cancel
              </button>
              <button type="submit" className="rounded-full bg-white px-4 py-2 font-semibold text-black">
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
