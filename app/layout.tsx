import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PlayerProvider } from "./context/PlayerContext";
import PlayerBar from "./components/PlayerBar";
import MobilePlayerBar from "./components/MobilePlayerBar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fluxify",
  description: "Music streaming platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PlayerProvider>
          {children}

          {/* Desktop PlayerBar */}
          <div className="hidden md:block">
            <PlayerBar />
          </div>

          {/* Mobile PlayerBar */}
          <div className="md:hidden">
            <MobilePlayerBar />
          </div>
        </PlayerProvider>
      </body>
    </html>
  );
}
