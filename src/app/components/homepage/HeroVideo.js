"use client";

import { useRef, useEffect } from "react";

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
      <div className="absolute inset-20 flex items-center justify-center">
        <h1 className="font-aegean text-4xl md:text-6xl text-white font-bold text-center">
          Earth Medicine
        </h1>
      </div>
    </div>
  );
}
