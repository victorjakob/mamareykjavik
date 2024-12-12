"use client";

import HeroVideo from "./components/HeroVideo";
import OpenHoursMama from "./components/OpenHoursMama";
import About from "./components/About";

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
