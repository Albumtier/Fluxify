"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { Track } from "@/app/data/music";

export default function LyricsModal({
  track,
  onClose,
}: {
  track: Track | null;
  onClose: () => void;
}) {
  const [lyrics, setLyrics] = useState<string>("Loading lyrics...");

  useEffect(() => {
    if (!track?.lyricsFile) return;

    const loadLyrics = async () => {
  try {
    console.log("FETCHING:", `/lyrics/${track.lyricsFile}.txt`, "track:", track);

    const res = await fetch(`/lyrics/${track.lyricsFile}.txt`);

    if (!res.ok) throw new Error("Fetch failed");

    const text = await res.text();
    setLyrics(text);
  } catch (err) {
    console.error("LYRICS ERROR:", err);
    setLyrics("Lyrics not available.");
  }
};

    loadLyrics();
  }, [track]);

  if (!track) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white w-11/12 max-w-lg p-6 rounded-xl shadow-xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl hover:text-pink-500"
        >
          <FaTimes />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-pink-300">{track.title}</h2>

        <pre className="whitespace-pre-wrap text-sm leading-relaxed max-h-[60vh] overflow-y-auto">
          {lyrics}
        </pre>
      </div>
    </div>
  );
}
