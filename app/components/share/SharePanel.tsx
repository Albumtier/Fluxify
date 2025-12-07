"use client";

import { useState, useEffect } from "react";
import { Track } from "@/app/data/music";
import { FaArrowLeft } from "react-icons/fa";
import { FastAverageColor } from "fast-average-color";
import ShareModal from "./ShareModal"; // Import the share modal

interface SharePanelProps {
  track: Track;
  lyrics: string;
  onClose: () => void;
}

export default function SharePanel({ track, lyrics, onClose }: SharePanelProps) {
  const lines = lyrics.split("\n");
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [bgColor, setBgColor] = useState("#000");
  const [textColor, setTextColor] = useState("white");
  const [showModal, setShowModal] = useState(false); // State for ShareModal

  const maxSelectable = 5;

  useEffect(() => {
    if (!track.cover) return;

    const fac = new FastAverageColor();
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = track.cover;

    img.onload = () => {
      const color = fac.getColor(img);
      setBgColor(color.hex);
      setTextColor(color.isDark ? "white" : "black");

      // THIS MAKES ShareCard RECEIVE THE COLOR
      track.dominantColor = color.hex;
      track.dominantTextColor = color.isDark ? "white" : "black";
    };
  }, [track]);

  const toggleLine = (index: number) => {
    if (selectedLines.includes(index)) {
      // Deselect the line
      setSelectedLines(selectedLines.filter((i) => i !== index));
    } else {
      if (selectedLines.length === 0) {
        // Start a new selection
        setSelectedLines([index]);
      } else if (selectedLines.length < maxSelectable) {
        const min = Math.min(...selectedLines);
        const max = Math.max(...selectedLines);

        // Only allow consecutive selection
        if (index === min - 1 || index === max + 1) {
          setSelectedLines([...selectedLines, index].sort((a, b) => a - b));
        }
      }
    }
  };

  return (
    <>
      <div
        className="fixed left-0 right-0 z-50 flex flex-col overflow-hidden"
        style={{
          bottom: 0,
          top: 0,
          borderTopLeftRadius: "1rem",
          borderTopRightRadius: "1rem",
          backgroundColor: bgColor,
          color: textColor,
          padding: "1.5rem",
        }}
      >
        {/* Top bar */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onClose}
            className="p-2 bg-pink-600 rounded-full hover:bg-pink-700 transition"
          >
            <FaArrowLeft size={18} />
          </button>
          <div className="w-8" /> {/* placeholder */}
        </div>

        {/* Scrollable lyrics */}
        <div
          className="flex-1 overflow-y-auto mb-4"
          style={{
            maxHeight: "calc(100% - 64px - 64px)", // top bar + continue button height
          }}
        >
          <h2 className="text-3xl font-extrabold mb-6 tracking-wide">
            {track.title} — {track.artist}
          </h2>

          <div className="space-y-1 text-xl leading-relaxed font-semibold">
            {lines.map((line, index) => (
              <div
                key={index}
                onClick={() => toggleLine(index)}
                className={`cursor-pointer p-1 rounded ${
                  selectedLines.includes(index) ? "bg-pink-600 text-white" : ""
                }`}
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* Continue button at bottom (player bar location) */}
        <div style={{ height: "64px" }}>
          <button
            onClick={() => setShowModal(true)} // Open ShareModal
            className="w-full h-full bg-pink-600 text-white font-bold rounded-full hover:bg-pink-700 transition"
          >
            Continue
          </button>
        </div>
      </div>

      {/* ShareModal */}
      {showModal && (
        <ShareModal
          track={track}
          lyrics={selectedLines.map((i) => lines[i])}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
