"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function HeroWl() {
  const videoRef = useRef(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    const handleLoadedData = () => {
      setIsVideoLoaded(true);
      videoRef.current?.play();
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener("loadeddata", handleLoadedData);
    }

    return () => {
      if (video) {
        video.removeEventListener("loadeddata", handleLoadedData);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {!isVideoLoaded && (
        <Image
          src="https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Mama-Page%2Fwlfront.png?alt=media&token=4c091380-caae-4d7b-914a-83ac73c3de08"
          alt="White Lotus Placeholder"
          fill
          className="object-cover"
          priority
        />
      )}
      <video
        ref={videoRef}
        className={`absolute top-0 left-0 w-full h-full object-cover ${
          isVideoLoaded ? "opacity-100" : "opacity-0"
        } transition-opacity duration-500`}
        autoPlay
        loop
        muted
        playsInline
      >
        <source
          src="https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Mama-Page%2FWhite%20Lotus%20Venue%20-%20event%20space%20in%20reykjavik.mp4?alt=media&token=b76ed8f9-d627-4c12-8276-f12fd6932917"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-10 sm:gap-24 md:gap-32 lg:gap-40 xl:gap-48 md:justify-between md:pb-20">
        <div className="md:flex-1 flex items-center">
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Mama-Page%2FGenerated_Logo_White_Lotus_whitetext_transparent.png?alt=media&token=26206add-02a0-46f3-b4e4-0a24431a3c13"
            alt="White Lotus Logo"
            width={300}
            height={200}
            className="drop-shadow-2xl"
          />
        </div>

        <div className="flex gap-8">
          <Link
            href="/events"
            className="px-4 py-2 tracking-widest rounded-full bg-opacity-35 bg-orange-500 sm:bg-white sm:bg-opacity-15 text-white hover:scale-110 hover:bg-opacity-30 transition-all duration-300 text-sm sm:text-base md:text-lg lg:text-lg font-light"
          >
            EXPLORE EVENTS
          </Link>
        </div>
      </div>
    </div>
  );
}
