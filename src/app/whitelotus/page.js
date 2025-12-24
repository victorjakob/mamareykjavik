import HeroVenue from "@/app/whitelotus/components/HeroVenue";
import ImageSlider from "@/app/whitelotus/components/ImageSlider";
import AboutTheSpace from "@/app/whitelotus/components/AboutTheSpace";
import ImageGallery from "@/app/whitelotus/components/ImageGallery";
import VenueBenefits from "@/app/whitelotus/components/VenueBenefits";
import VenueDetails from "@/app/whitelotus/components/VenueDetails";
import PrivateCatering from "@/app/whitelotus/components/PrivateCatering";
import HostYourEvent from "@/app/whitelotus/components/HostYourEvent";
import { cookies } from "next/headers";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";

  const translations = {
    en: {
      title: "White Lotus | Mama Reykjavik",
      description:
        "A refined event space for music, movement, ceremony & celebration. Intimate, high-quality venue in downtown Reykjavík for conscious gatherings and creative expression.",
      ogTitle: "White Lotus Event Venue | Mama Reykjavik",
      ogDescription:
        "Host your next event at White Lotus. An intimate, high-quality venue in downtown Reykjavík designed for conscious gatherings, creative expression, and unforgettable nights.",
    },
    is: {
      title: "White Lotus | Mama Reykjavík",
      description:
        "Fínn viðburðarstaður fyrir tónlist, hreyfingu, athafnir og hátíðahöld. Náinn og hágæða viðburðarstaður í miðbæ Reykjavíkur fyrir meðvitaðar samkomur og skapandi tjáningu.",
      ogTitle: "White Lotus Viðburðarstaður | Mama Reykjavík",
      ogDescription:
        "Hýstu næsta viðburðinn þinn á White Lotus. Náinn og hágæða viðburðarstaður í miðbæ Reykjavíkur hannaður fyrir meðvitaðar samkomur, skapandi tjáningu og ógleymanlegar nætur.",
    },
  };

  const t = translations[language];

  return {
    title: t.title,
    description: t.description,
    canonical: "https://mama.is/whitelotus",
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
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
}

export default async function Venue() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Main Content */}
      <div className="w-full mx-auto flex flex-col items-center">
        <HeroVenue />
        <AboutTheSpace />
        <VenueBenefits />
        <ImageGallery />

        <VenueDetails />
        <PrivateCatering />
        <HostYourEvent />
      </div>
    </div>
  );
}
