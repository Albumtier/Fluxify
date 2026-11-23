import type { Metadata } from "next";
import { discography } from "../../data/music";
import ReleasePageClient from "./ReleasePageClient";

type ReleasePageProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

function resolveSlug(params: ReleasePageProps["params"]) {
  return params instanceof Promise ? params.then((value) => value.slug) : params.slug;
}

export async function generateMetadata({ params }: ReleasePageProps): Promise<Metadata> {
  const slug = await resolveSlug(params);
  const release = discography.find((item) => item.slug === slug);

  if (!release) {
    return {
      title: "Fluxify",
    };
  }

  return {
    title: `${release.title} | Fluxify`,
    openGraph: {
      title: release.title,
      images: [
        {
          url: release.cover,
          width: 1200,
          height: 1200,
          alt: release.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: release.title,
      images: [release.cover],
    },
  };
}

export default function ReleasePage() {
  return <ReleasePageClient />;
}
