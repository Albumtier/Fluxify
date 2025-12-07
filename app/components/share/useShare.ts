"use client";

import { useState } from "react";

export function useShare() {
  /**
   * Selected lines by the user
   */
  const [selectedLyrics, setSelectedLyrics] = useState<string[]>([]);

  /**
   * Controls the 2 share UIs:
   * - SharePanel
   * - ShareModal
   */
  const [isSharePanelOpen, setIsSharePanelOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  /**
   * Convert raw lyrics (string or array) into safe array
   */
  function toArray(lyrics: string | string[]) {
    if (!lyrics) return [];
    if (Array.isArray(lyrics)) return lyrics;
    return lyrics.split("\n").filter((line) => line.trim() !== "");
  }

  /**
   * User selecting and deselecting lyric lines inside SharePanel
   */
  function toggleLyric(line: string) {
    setSelectedLyrics((prev) => {
      if (prev.includes(line)) {
        return prev.filter((l) => l !== line);
      }
      return [...prev, line];
    });
  }

  /**
   * Step 1: MobileLyricsPanel → SharePanel
   */
  function openSharePanel() {
    setIsSharePanelOpen(true);
  }

  function closeSharePanel() {
    setIsSharePanelOpen(false);
  }

  /**
   * Step 2: SharePanel → ShareModal
   */
  function openShareModal() {
    setIsShareModalOpen(true);
  }

  function closeShareModal() {
    setIsShareModalOpen(false);
  }

  return {
    // lyric selection
    selectedLyrics,
    setSelectedLyrics,
    toggleLyric,
    toArray,

    // share panel (lyrics selection)
    isSharePanelOpen,
    openSharePanel,
    closeSharePanel,

    // share modal (image generation)
    isShareModalOpen,
    openShareModal,
    closeShareModal,
  };
}
