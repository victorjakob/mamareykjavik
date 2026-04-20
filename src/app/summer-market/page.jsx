import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";
import SummerMarketPageClient from "./components/SummerMarketPageClient";

const OG_IMAGE_URL =
  "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1773310721/Summer_Market_mggv0n.png";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/summer-market";
  const alternates = alternatesFor({
    locale: language,
    pathname,
    translated: true,
  });

  const translations = {
    en: {
      title: "White Lotus Summer Market | Vendor Applications | Reykjavík",
      description:
        "Apply to join White Lotus Summer Market in downtown Reykjavík — a small indoor weekend market for handmade goods, wellness offerings, art, and beautiful everyday things.",
      ogTitle: "White Lotus Summer Market | Vendor Applications | Reykjavík",
      ogDescription:
        "A warm indoor weekend market in central Reykjavík with good flow, good people, live ambient music, and space for beautiful products.",
    },
    is: {
      title: "White Lotus Sumarmarkaður | Umsóknir söluaðila | Reykjavík",
      description:
        "Sæktu um bás á White Lotus Sumarmarkaði í miðbæ Reykjavíkur — lítill innimarkaður um helgar fyrir handverk, vellíðunarvörur, list og fallega hluti.",
      ogTitle: "White Lotus Sumarmarkaður | Umsóknir söluaðila | Reykjavík",
      ogDescription:
        "Hlýr innimarkaður um helgar í miðbæ Reykjavíkur — gott flæði, gott fólk, mjúk lifandi tónlist og pláss fyrir fallegar vörur.",
    },
  };

  const t = translations[language] || translations.en;
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
      type: "website",
      locale: ogLocale(language),
      images: [
        {
          url: OG_IMAGE_URL,
          width: 1200,
          height: 675,
          alt: "White Lotus Summer Market atmosphere",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.ogTitle,
      description: t.ogDescription,
      images: [OG_IMAGE_URL],
    },
  };
}

export default function SummerMarketPage() {
  return <SummerMarketPageClient />;
}
