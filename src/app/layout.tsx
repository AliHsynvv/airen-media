import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/layout/SiteShell";
import { SITE_CONFIG } from "@/lib/utils/constants";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "turizm",
    "seyahat",
    "yapay zeka",
    "AI",
    "influencer",
    "rehber",
    "ülkeler",
    "kültür",
    "gastronomi"
  ],
  authors: [
    {
      name: "Airen Global",
      url: SITE_CONFIG.url,
    },
  ],
  creator: "Airen Global",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
    creator: "@airen_app",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SiteShell>
          {children}
        </SiteShell>
      </body>
    </html>
  );
}