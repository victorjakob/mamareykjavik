import HeroVenue from "@/app/components/whitelotus/HeroVenue";
import ImageSlider from "@/app/components/whitelotus/ImageSlider";
import InfoVenue from "@/app/components/whitelotus/InfoVenue";
import CTA from "@/app/components/whitelotus/CTA";

export const metadata = {
  title: "White Lotus | Mama Reykjavik",
  description:
    "Discover our beautiful event venue White Lotus. The perfect space for ceremonies, workshops, gatherings and private events in Reykjavik.",
  canonical: "https://mamareykjavik.is/whitelotus",
  openGraph: {
    title: "White Lotus Event Venue | Mama Reykjavik",
    description:
      "Host your next event at White Lotus. A beautiful and versatile venue space perfect for ceremonies, workshops, gatherings and private events.",
    url: "https://mamareykjavik.is/whitelotus",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Logo%20bigger.jpeg?alt=media&token=704baa9f-90bd-47f2-900c-0ab8535eed0b",
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
