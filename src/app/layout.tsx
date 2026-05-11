import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ONA - Smartest Way Through Lagos",
  description:
    "Find the smartest, fastest, and cheapest routes through Lagos with real-time AI insights.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ONA",
  },
  openGraph: {
    title: "ONA — Smartest Way Through Lagos",
    description: "Real-time AI navigation for Lagos streets.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#A3E635",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/logos/logo(yellow-bg).png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
