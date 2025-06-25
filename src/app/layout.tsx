import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeSwitch from "./components/ThemeSwitch";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Love Wall - Confess Your Love",
  description: "Share your love notes anonymously",
  icons: [
    { rel: "icon", url: "/heart.png", type: "image/png" },
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
      <Head>
        <link rel="icon" type="image/png" href="/heart.png" />
        <link rel="apple-touch-icon" href="/heart.png" />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeSwitch />
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
