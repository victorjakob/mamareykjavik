import HeroVenue from "@/app/whitelotus/components/HeroVenue";
import ImageSlider from "@/app/whitelotus/components/ImageSlider";
import InfoVenue from "@/app/whitelotus/components/InfoVenue";
import CTA from "@/app/whitelotus/components/CTA";
import { cookies } from "next/headers";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";

  const translations = {
    en: {
      title: "White Lotus | Mama Reykjavik",
      description:
        "Discover our beautiful event venue White Lotus. The perfect space for ceremonies, workshops, gatherings and private events in Reykjavik.",
      ogTitle: "White Lotus Event Venue | Mama Reykjavik",
      ogDescription:
        "Host your next event at White Lotus. A beautiful and versatile venue space perfect for ceremonies, workshops, gatherings and private events.",
    },
    is: {
      title: "White Lotus | Mama Reykjavík",
      description:
        "Kannaðu fallega viðburðastaðinn okkar White Lotus. Fullkomið rými fyrir athafnir, verkstæði, samkomur og einkaviðburði í Reykjavík.",
      ogTitle: "White Lotus Viðburðastaður | Mama Reykjavík",
      ogDescription:
        "Hýstu næsta viðburðinn þinn á White Lotus. Fallega og fjölhæfur viðburðastaður fullkominn fyrir athafnir, verkstæði, samkomur og einkaviðburði.",
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
