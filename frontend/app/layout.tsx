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

export const metadata: Metadata = {
  title: "PG Nexus — Find Your Perfect PG Room",
  description: "PG Nexus — Discover, list, and book verified PG rooms across Pakistan.",
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
