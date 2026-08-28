import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Business Finder - Find Local Businesses",
  description: "Find businesses in any city using Google Maps. Filter by type, radius, keywords, and website availability, then export results.",
  keywords: "business finder, google maps, business search, city search, local businesses",
  authors: [{ name: "Business Finder Team" }],
  robots: "index, follow",
  openGraph: {
    title: "Business Finder - Find Local Businesses",
    description: "Select a city and find businesses nearby with Google Maps filters and CSV export.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Business Finder - Find Local Businesses",
    description: "Select a city and find businesses nearby with Google Maps filters and CSV export.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
