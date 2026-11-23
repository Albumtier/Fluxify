"use client";

import { useEffect, useState } from "react";
import DesktopPlaylistPage from "./DesktopPlaylistPage";
import MobilePlaylistPage from "./MobilePlaylistPage";

export default function PlaylistPageWrapper() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile ? <MobilePlaylistPage /> : <DesktopPlaylistPage />;
}
