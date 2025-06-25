import Image from "next/image";
import LoveWall from "./components/LoveWall";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "var(--background)" }}
    >
      <h1 className="text-5xl font-extrabold text-pink-600 mb-8 text-center drop-shadow-lg">
        Love Wall
      </h1>
      <p className="mb-8 text-lg text-pink-700 text-center max-w-xl">
        Share your anonymous love notes and see hearts grow as the community
        spreads positivity!
      </p>
      <LoveWall />
    </div>
  );
}
