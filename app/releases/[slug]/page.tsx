"use client";
import { useState, useEffect } from "react";
import DesktopReleasePage from "./DesktopReleasePage";
import MobileReleasePage from "./MobileReleasePage";

export default function ReleasePageWrapper() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile ? <MobileReleasePage /> : <DesktopReleasePage />;
}
