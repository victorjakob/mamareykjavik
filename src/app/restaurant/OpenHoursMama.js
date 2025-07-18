"use client";

import Image from "next/image";

export default function OpenHoursMama() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0 grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 gap-0">
        <div className="relative w-full h-[25vh] sm:h-full">
          <Image
            src="/mamaimg/mamacoffee.jpg"
            alt="Coffee at Mama Restaurant"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 50vw"
            quality={75}
            loading="eager"
          />
        </div>
        <div className="relative w-full h-[25vh] sm:h-full">
          <Image
            src="/mamaimg/mamavibe.jpg"
            alt="Mama Restaurant Ambiance"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 50vw"
            quality={75}
            loading="eager"
          />
        </div>
        <div className="relative w-full h-[25vh] sm:h-full">
          <Image
            src="/mamaimg/mamavibe1.jpg"
            alt="Mama Restaurant Interior"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 50vw"
            quality={75}
            loading="eager"
          />
        </div>
        <div className="relative w-full h-[25vh] sm:h-full">
          <Image
            src="/mamaimg/mamadahl.jpg"
            alt="Dahl Dish at Mama Restaurant"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 50vw"
            quality={75}
            loading="eager"
          />
        </div>
      </div>

      {/* Centered Text */}
      <div className="relative bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-md shadow-2xl text-center w-11/12 max-w-md md:max-w-lg lg:max-w-xl mx-4 my-8 sm:my-0 z-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 md:text-5xl text-gray-900">
          Opening Hours
        </h1>
        <h2 className="text-base pt-5 sm:text-lg md:text-xl lg:text-2xl lg:leading-relaxed text-gray-800">
          Kitchen
        </h2>
        <h3 className="font-aegean text-sm sm:text-lg md:text-xl  lg:leading-relaxed text-gray-800">
          Every Day : 11:00 – 21:00
        </h3>
        <h2 className="text-base pt-5 sm:text-lg md:text-xl lg:text-2xl lg:leading-relaxed text-gray-800">
          Lounge
        </h2>
        <h3 className="font-aegean text-base sm:text-lg md:text-xl lg:leading-relaxed text-gray-800">
          Thu – Sat : 21:00 – 23:00
        </h3>
      </div>
    </div>
  );
}
