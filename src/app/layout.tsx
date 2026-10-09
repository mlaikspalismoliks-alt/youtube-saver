import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YOUSAVER — Cyber YouTube Media Engine",
  description: "Next-generation futuristic YouTube video & MP3 audio stream extractor and downloader.",
  applicationName: "YOUSAVER",
  keywords: ["youtube downloader", "youtube 4k", "mp3 extractor", "cyber media engine"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0e",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-background text-text-primary antialiased selection:bg-accent/30 selection:text-white font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
