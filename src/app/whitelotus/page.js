import HeroVenue from "@/app/whitelotus/components/HeroVenue";
import ImageSlider from "@/app/whitelotus/components/ImageSlider";
import InfoVenue from "@/app/whitelotus/components/InfoVenue";
import CTA from "@/app/whitelotus/components/CTA";

export const metadata = {
  title: "White Lotus | Mama Reykjavik",
  description:
    "Discover our beautiful event venue White Lotus. The perfect space for ceremonies, workshops, gatherings and private events in Reykjavik.",
  canonical: "https://mama.is/whitelotus",
  openGraph: {
    title: "White Lotus Event Venue | Mama Reykjavik",
    description:
      "Host your next event at White Lotus. A beautiful and versatile venue space perfect for ceremonies, workshops, gatherings and private events.",
    url: "https://mama.is/whitelotus",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/whitelotusbanner.jpg?alt=media&token=ddb5d9ad-25af-4307-b37f-ceaa1b79002a",
        width: 1200,
        height: 630,
        alt: "White Lotus Venue Space",
      },
    ],
    type: "website",
  },
};

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
