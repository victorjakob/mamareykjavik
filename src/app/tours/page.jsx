"use client";

import WelcomeText from "./WelcomeText";
import TourCards from "./TourCards";

export default function Tours() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl pt-32 mx-auto text-center">
        <WelcomeText />
        <TourCards />
      </div>
    </div>
  );
}
