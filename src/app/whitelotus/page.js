import HeroVenue from "@/app/components/whitelotus/HeroVenue";
import ImageSlider from "@/app/components/whitelotus/ImageSlider";
import InfoVenue from "@/app/components/whitelotus/InfoVenue";
import CTA from "@/app/components/whitelotus/CTA";

export default function Venue() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Main Content */}
      <div className="w-full mx-auto pt-4 flex flex-col space-y-10 items-center">
        <HeroVenue />
        <ImageSlider />
        <InfoVenue />
        <CTA />
        <main className="flex-grow"></main>
      </div>
    </div>
  );
}
