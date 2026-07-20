import type { Metadata, Viewport } from "next";
import { Comfortaa, Cookie, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/components/cart-provider";
import { CartButton } from "@/components/cart-button";
import { CartDrawer } from "@/components/cart-drawer";
import { JsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  BRAND_NAME,
  SITE_DESCRIPTION,
  SITE_TAGLINE,
  getSiteUrl,
} from "@/lib/constants";
import "./globals.css";

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
});

const cookie = Cookie({
  weight: "400",
  variable: "--font-cookie",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${BRAND_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${BRAND_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: BRAND_NAME,
  manifest: "/manifest.webmanifest",
  keywords: [
    "research peptides",
    "reference-grade peptides",
    "HPLC tested peptides",
    "third-party tested peptides",
    "lyophilized peptides",
    "peptides for laboratory research",
    BRAND_NAME,
  ],
  authors: [{ name: BRAND_NAME, url: siteUrl }],
  creator: BRAND_NAME,
  publisher: BRAND_NAME,
  category: "science",
  referrer: "origin-when-cross-origin",
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: "website",
    siteName: BRAND_NAME,
    locale: "en_US",
    url: "/",
    title: `${BRAND_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    title: BRAND_NAME,
    statusBarStyle: "black-translucent",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a101c" },
  ],
  viewportFit: "cover",
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: BRAND_NAME,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon-512.png`,
        width: 512,
        height: 512,
      },
      slogan: "Balance · Energy · Vitality",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: BRAND_NAME,
      url: siteUrl,
      description: SITE_DESCRIPTION,
      inLanguage: "en-US",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${comfortaa.variable} ${cookie.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink">
        <JsonLd data={structuredData} />
        <SiteHeader />
        <CartProvider>
          <main className="flex-1">{children}</main>
          <CartButton />
          <CartDrawer />
        </CartProvider>
        <SiteFooter />
      </body>
    </html>
  );
}
