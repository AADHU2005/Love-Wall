"use client";
import React, { useEffect, useState } from "react";
import LoveWall from "./components/LoveWall";

function HeartStrokeLoader() {
  return (
    <div className="flex items-center justify-center mb-8">
      <svg width="80" height="80" viewBox="0 0 80 80" className="drop-shadow-lg">
        <path
          d="M40 70s-24-14.7-24-34.2C16 22.6 27.2 14 40 26.5 52.8 14 64 22.6 64 35.8 64 55.3 40 70 40 70z"
          fill="none"
          stroke="#f472b6"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeDasharray="180"
          strokeDashoffset="180"
          style={{
            animation: 'drawHeart 1.2s cubic-bezier(0.4,0,0.2,1) forwards',
            filter: 'drop-shadow(0 2px 8px #f472b6)'
          }}
        />
        <style>{`
          @keyframes drawHeart {
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      </svg>
    </div>
  );
}

function Preloader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="flex flex-col items-center">
        <HeartStrokeLoader />
        <span className="text-pink-600 font-bold text-xl">Loading Love Wall...</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && <Preloader />}
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{ background: "var(--background)" }}
      >
        <h1 className="text-5xl font-extrabold text-pink-600 mb-8 text-center drop-shadow-lg">
          Love Wall
        </h1>
        <p className="mb-8 text-lg text-pink-700 text-center max-w-xl">
          Share your anonymous love notes and see hearts grow as the community spreads positivity!
        </p>
        <LoveWall />
      </div>
    </>
  );
}
