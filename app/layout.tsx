import type { Metadata, Viewport } from "next";
import { Comfortaa, Cookie, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
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
  themeColor: "#131c2b",
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
        url: `${siteUrl}/brand/pep-mark.png`,
      },
      slogan: "Balance · Energy · Vitality",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: BRAND_NAME,
      url: siteUrl,
      description: SITE_DESCRIPTION,
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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <CartProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <CartButton />
            <CartDrawer />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
