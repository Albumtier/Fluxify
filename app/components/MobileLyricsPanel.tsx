"use client";

import { useEffect, useState } from "react";
import { Track } from "@/app/data/music";
import { FastAverageColor } from "fast-average-color";
import { FaTimes, FaShareAlt } from "react-icons/fa";
import SharePanel from "./share/SharePanel"; // import the overlay

interface MobileLyricsPanelProps {
  track: Track | null;
  onClose: () => void;
  mode?: "miniplayer" | "fullplayer";
  fontFamily?: string;
}

export default function MobileLyricsPanel({
  track,
  onClose,
  mode = "miniplayer",
  fontFamily = '"Geist", sans-serif',
}: MobileLyricsPanelProps) {
  const [lyrics, setLyrics] = useState<string>("Loading lyrics...");
  const [bgColor, setBgColor] = useState<string>("#000");
  const [textColor, setTextColor] = useState<string>("white");
  const [showShare, setShowShare] = useState(false);

  // Load lyrics
  useEffect(() => {
    if (!track?.lyricsFile) return;

    const loadLyrics = async () => {
      try {
        const res = await fetch(`/lyrics/${track.lyricsFile}.txt`);
        if (!res.ok) throw new Error("Fetch failed");
        const text = await res.text();
        setLyrics(text || "No lyrics available.");
      } catch {
        setLyrics("No lyrics available.");
      }
    };

    loadLyrics();
  }, [track]);

  // Get dominant album color
  useEffect(() => {
    if (!track?.cover) return;

    const fac = new FastAverageColor();
    fac
      .getColorAsync(track.cover)
      .then((color) => {
        setBgColor(color.hex);
        setTextColor(color.isDark ? "white" : "black");
      })
      .catch(() => {
        setBgColor("#000");
        setTextColor("white");
      });
  }, [track]);

  if (!track) return null;

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-50 overflow-y-auto"
        style={{
          bottom: mode === "miniplayer" ? "64px" : "120px",
          backgroundColor: bgColor,
          color: textColor,
          padding: "1.5rem",
          borderTopLeftRadius: "1rem",
          borderTopRightRadius: "1rem",
        }}
      >
        {/* Top bar with icons */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onClose}
            className="p-2 bg-pink-600 rounded-full hover:bg-pink-700 transition"
          >
            <FaTimes size={18} />
          </button>

          <button
            onClick={() => setShowShare(true)}
            className="p-2 bg-pink-600 rounded-full hover:bg-pink-700 transition"
          >
            <FaShareAlt size={18} />
          </button>
        </div>

        <h2 className="text-3xl font-extrabold mb-6 tracking-wide">{track.title} — Lyrics</h2>

        <pre
          className="whitespace-pre-wrap leading-relaxed text-xl"
          style={{ fontFamily, fontWeight: 600 }}
        >
          {lyrics}
        </pre>
      </div>

      {/* Share overlay */}
      {showShare && track && (
        <SharePanel track={track} lyrics={lyrics} onClose={() => setShowShare(false)} />
      )}
    </>
  );
}
