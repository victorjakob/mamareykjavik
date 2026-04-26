import WhiteLotusPageRedesign from "@/app/whitelotus/components/WhiteLotusPageRedesign";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/whitelotus";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

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
      title: "White Lotus — Fjölbreytt viðburðarými í Reykjavík",
      description:
        "Glæsilegt rými fyrir viðburði í miðbæ Reykjavíkur fyrir tónlist, hreyfingu, athafnir og fagnað. White Lotus er við hlið Mama Reykjavík og hentar jafnt fyrir tónleika, kakóathafnir, jóga og einkaviðburði.",
      ogTitle: "White Lotus — Fjölbreytt viðburðarými í Reykjavík",
      ogDescription:
        "Haltu viðburð hjá White Lotus í miðbæ Reykjavíkur. Glæsilegt og sveigjanlegt rými fyrir tónleika, kakóathafnir, jóga, fyrirtækjaviðburði og fagnað.",
    },
  };

  const t = translations[language];
  const formatted = formatMetadata({
    title: t.title,
    description: t.description,
  });

  return {
    title: formatted.title,
    description: formatted.description,
    alternates,
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: alternates.canonical,
      images: [
        {
          url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/whitelotusbanner.jpg",
          width: 1200,
          height: 630,
          alt: "White Lotus Venue Space",
        },
      ],
      type: "website",
      locale: ogLocale(language),
    },
  };
}

export default async function Venue() {
  // Note: EventVenue + FAQPage JSON-LD for /whitelotus is emitted by the
  // shared <StructuredData /> component mounted in src/app/layout.js.
  // Do NOT add inline JSON-LD here — it will trigger Google Search Console's
  // "Duplicate field FAQPage" warning.
  return (
    <div className="relative isolate overflow-hidden bg-[#110f0d] min-h-screen">
      <WhiteLotusPageRedesign />
    </div>
  );
}
