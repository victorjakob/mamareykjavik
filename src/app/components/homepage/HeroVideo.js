"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";

export default function HeroVideo() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/mamaimg/mamarestaurantvideo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-10 sm:gap-24 md:gap-32 lg:gap-40 xl:gap-48 md:justify-between md:pb-20">
        <div className="md:flex-1 flex items-center">
          <h1 className="drop-shadow-2xl text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-bold text-center tracking-wider">
            Earth Medicine
          </h1>
        </div>

        <div className="flex gap-8">
          <Link
            href="/restaurant/menu"
            className="px-4 py-2 tracking-widest rounded-full bg-opacity-35 bg-orange-500 sm:bg-white sm:bg-opacity-15 text-white hover:scale-110 hover:bg-opacity-70 transition-all duration-300 text-sm sm:text-base md:text-lg lg:text-lg font-light"
          >
            See Menu
          </Link>
          <Link
            href="/restaurant/book-table"
            className="px-4 py-2 tracking-widest text-white rounded-full bg-opacity-35 bg-orange-500 sm:bg-white sm:bg-opacity-15 hover:scale-110 hover:bg-opacity-70 transition-all duration-300 text-sm sm:text-base md:text-lg lg:text-lg font-light"
          >
            Book Table
          </Link>
        </div>
      </div>
    </div>
  );
}
