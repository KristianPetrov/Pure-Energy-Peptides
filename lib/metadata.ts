import type { Metadata } from "next";
import { BRAND_NAME } from "./constants";

type PublicPageMetadata = {
  title: string;
  description: string;
  path: `/${string}` | "/";
};

/** Keeps canonical, Open Graph, and X/Twitter metadata in sync. */
export function createPageMetadata({
  title,
  description,
  path,
}: PublicPageMetadata): Metadata {
  const socialTitle = `${title} — ${BRAND_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: BRAND_NAME,
      locale: "en_US",
      url: path,
      title: socialTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
    },
  };
}
