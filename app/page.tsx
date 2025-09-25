// app/page.tsx
"use client";
import { useState, useEffect } from "react";
import DesktopHomePage from "./DesktopHomePage";
import MobileHomePage from "./MobileHomePage";

export default function HomePageWrapper() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile ? <MobileHomePage /> : <DesktopHomePage />;
}
