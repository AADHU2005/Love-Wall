import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeSwitch from "./components/ThemeSwitch";

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
    { rel: "icon", url: "/heart.ico" },
    { rel: "shortcut icon", url: "/heart.ico" },
    { rel: "apple-touch-icon", url: "/heart.ico" },
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
        <ThemeSwitch />
        {children}
      </body>
    </html>
  );
}
