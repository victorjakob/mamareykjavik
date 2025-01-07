"use client";

import HeroVideo from "./components/homepage/HeroVideo";
import OpenHoursMama from "./components/homepage/OpenHoursMama";
import About from "./components/homepage/About";

export default function Home() {
  return (
    <div className="min-h-screen min-w-screen">
      <main>
        <HeroVideo />
        <About />
        <OpenHoursMama />
      </main>
    </div>
  );
}
