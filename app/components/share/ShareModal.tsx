"use client";

import { useState, useRef, useEffect } from "react";
import ShareCard from "./ShareCard";
import html2canvas from "html2canvas";

export default function ShareModal({ track, lyrics, onClose }: any) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  /**
   * Generate canvas → blob helper
   */
  async function generateImageBlob() {
    if (!cardRef.current) return null;

    setIsGenerating(true);
    await new Promise((res) => setTimeout(res, 150)); // wait for render

    const canvas = await html2canvas(cardRef.current, {
      scale: 3,
      backgroundColor: null,
      useCORS: true,
    });

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });
  }

  /**
   * DOWNLOAD IMAGE
   */
  async function handleDownload() {
    const blob = await generateImageBlob();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${track.title}-lyrics.png`;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
    setIsGenerating(false);
  }

  /**
   * WHATSAPP SHARE
   */
  async function handleWhatsAppShare() {
    const blob = await generateImageBlob();
    if (!blob) return;

    const file = new File([blob], `${track.title}.png`, { type: "image/png" });

    // ✔ Best UX: Web Share API (Chrome, Android)
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          text: `🎵 ${track.title} — ${track.artist}`,
          files: [file],
        });
      } catch (err) {
        console.log("User cancelled share", err);
      }
      setIsGenerating(false);
      return;
    }

    // ❌ If navigator.share is unavailable → fallback to WhatsApp text sharing
    const text = encodeURIComponent(
      `🎵 ${track.title} — ${track.artist}\n\n${lyrics.join("\n")}`
    );

    window.open(`https://wa.me/?text=${text}`, "_blank");
    setIsGenerating(false);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999] p-4">
      <div className="bg-[#111] p-5 rounded-2xl w-full max-w-sm shadow-xl border border-gray-700">

        <h2 className="text-xl mb-4 text-white font-semibold text-center">
          Share Lyrics
        </h2>

        {/* CARD PREVIEW */}
        <div
          ref={cardRef}
          className="flex justify-center items-center rounded-xl overflow-hidden p-2"
        >
          <ShareCard track={track} lyrics={lyrics || []} />
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-5 flex flex-col gap-3">

          {/* WhatsApp Share */}
          <button
            onClick={handleWhatsAppShare}
            disabled={isGenerating}
            className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 rounded-xl
                       text-white font-semibold transition"
          >
            {isGenerating ? "Preparing..." : "Share to WhatsApp"}
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full px-4 py-3 bg-pink-600 hover:bg-pink-500 rounded-xl
                       text-white font-semibold transition"
          >
            {isGenerating ? "Generating..." : "Download Image"}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl
                       text-white font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
