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
  title: "Love Wall",
  description: "Share your love notes anonymously",
  icons: [
    { rel: "icon", url: "/heart.png", type: "image/png" },
    { rel: "shortcut icon", url: "/heart.png", type: "image/png" },
    { rel: "apple-touch-icon", url: "/heart.png", type: "image/png" },
  ],
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
        <footer className="mt-12 text-center text-pink-500 text-sm opacity-80">
          Made with{" "}
          <span className="inline-block animate-pulse">❤️</span> by{" "}
          <a
            href="https://www.instagram.com/aadarsh.kalappurackal/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-pink-700"
          >
            Aadhu
          </a>
        </footer>
      </body>
    </html>
  );
}
