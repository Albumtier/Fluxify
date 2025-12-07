"use client";

import { useEffect, useState } from "react";
import { FastAverageColor } from "fast-average-color";

export default function LyricsPanel({ track, onClose }: any) {
  const [lyrics, setLyrics] = useState("Loading lyrics...");
  const [bgColor, setBgColor] = useState("#000");

  // Define the font here
  const fontFamily = "var(--font-geist-mono)";

  // Load lyrics
  useEffect(() => {
    if (!track?.lyricsFile) return;

    const loadLyrics = async () => {
      try {
        const res = await fetch(`/lyrics/${track.lyricsFile}.txt`);
        if (!res.ok) throw new Error("Fetch failed");
        const text = await res.text();
        setLyrics(text);
      } catch {
        setLyrics("No lyrics available.");
      }
    };

    loadLyrics();
  }, [track]);

  // Extract album dominant color
  useEffect(() => {
    if (!track?.cover) return;

    const fac = new FastAverageColor();
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = track.cover;

    img.onload = () => {
      const color = fac.getColor(img);
      setBgColor(color.hex);
    };
  }, [track]);

  if (!track) return null;

  return (
    <div
      className="fixed inset-0 text-black p-6 overflow-y-auto z-50"
      style={{ backgroundColor: bgColor, bottom: "96px" }} // leave space for player bar
    >
      <button
        onClick={onClose}
        className="mb-4 px-4 py-2 bg-white rounded-lg hover:bg-gray-200 text-black"
      >
        Close
      </button>

      <h2 className="text-2xl font-bold mb-4">{track.title} — Lyrics</h2>

      <pre
        className="whitespace-pre-wrap leading-relaxed text-xl"
        style={{ fontFamily, fontWeight: 600 }}
      >
        {lyrics}
      </pre>
    </div>
  );
}
