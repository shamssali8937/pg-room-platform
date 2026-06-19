import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Nunito } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import ReduxProvider from "@/store/ReduxProvider";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://pg-room-platform.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "PG Nexus — Find Your Perfect PG Room",
  description: "Discover, list, and book verified premium PG rooms across Pakistan. Experience high-end verified student & professional living spaces.",
  keywords: [
    "PG rooms Pakistan",
    "Paying guest Lahore",
    "Hostels in Karachi",
    "Verified room rentals",
    "Student accommodation Islamabad",
    "Rent PG rooms",
    "PG Nexus",
    "Shared living Pakistan"
  ],
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "PG Nexus — Find Your Perfect PG Room",
    description: "Discover, list, and book verified premium PG rooms across Pakistan. Experience high-end verified student & professional living spaces.",
    url: "https://pg-room-platform.vercel.app",
    siteName: "PG Nexus",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PG Nexus — Find Your Perfect PG Room",
    description: "Discover, list, and book verified premium PG rooms across Pakistan.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning={true}>
        <ReduxProvider>
          <AuthProvider>{children}</AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
