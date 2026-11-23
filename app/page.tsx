import type { Metadata } from "next";
import { latestRelease } from "./data/music";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: "Fluxify",
  openGraph: {
    title: "Fluxify",
    images: [
      {
        url: "/images/artist.jpg?v=2",
        width: 1200,
        height: 1200,
        alt: "David",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fluxify",
    images: ["/images/artist.jpg?v=2"],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
