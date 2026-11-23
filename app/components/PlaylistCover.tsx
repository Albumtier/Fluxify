"use client";

import Image from "next/image";
import type { Track } from "../data/music";

export default function PlaylistCover({
  tracks,
  className = "",
}: {
  tracks: Track[];
  className?: string;
}) {
  if (tracks.length === 0) {
    return <div className={`overflow-hidden bg-[#f6bfd7] ${className}`} />;
  }

  if (tracks.length < 4) {
    const cover = tracks[0].cover || "/images/default-cover.jpg";
    return (
      <div className={`relative overflow-hidden bg-white/5 ${className}`}>
        <Image src={cover} alt={tracks[0].title} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
      </div>
    );
  }

  return (
    <div className={`grid overflow-hidden bg-white/5 ${className} grid-cols-2 grid-rows-2`}>
      {tracks.slice(0, 4).map((track, index) => (
        <div key={`${track.file}-${index}`} className="relative min-h-0 min-w-0">
          <Image
            src={track.cover || "/images/default-cover.jpg"}
            alt={track.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 25vw, 12vw"
          />
        </div>
      ))}
    </div>
  );
}
