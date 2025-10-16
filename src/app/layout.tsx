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
  title: "Business Finder - Find Businesses & Solutions",
  description: "A comprehensive web application that helps you find businesses in any area using Google Maps API and discover business solutions through Reddit. Search with filters, export data, and get community insights.",
  keywords: "business finder, google maps, business search, reddit business solutions, business discovery, local businesses",
  authors: [{ name: "Business Finder Team" }],
  robots: "index, follow",
  openGraph: {
    title: "Business Finder - Find Businesses & Solutions",
    description: "Find businesses in any area with Google Maps and discover solutions through Reddit community insights.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Business Finder - Find Businesses & Solutions",
    description: "Find businesses in any area with Google Maps and discover solutions through Reddit community insights.",
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
