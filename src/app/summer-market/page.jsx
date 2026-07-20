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
      title:
        "White Lotus Summer Market | Reykjavík Weekend Market | Vendor Applications",
      description:
        "Apply for a vendor booth at the White Lotus Summer Market in downtown Reykjavík. A small indoor weekend market at Bankastræti 2, every Friday & Saturday in June & July, for handmade goods, wellness offerings, art, and ceremonial cacao. Free entry.",
      keywords:
        "summer market Reykjavik, weekend market Reykjavik, indoor market Iceland, vendor booth Reykjavik, handmade market Iceland, White Lotus market, Bankastræti 2 market, craft market Reykjavik, wellness market Iceland, Mama Reykjavik summer market, vendor application, Reykjavik market June, Reykjavik market July",
      ogTitle: "White Lotus Summer Market — Reykjavík · Bankastræti 2",
      ogDescription:
        "A warm indoor weekend market in central Reykjavík with good flow, good people, live ambient music, and 10 booths for beautiful products. Free entry · June & July · Fri & Sat · 13:00–19:00.",
      ogImageAlt:
        "White Lotus Summer Market in downtown Reykjavík — vendor booths, ceremonial cacao and ambient music at Bankastræti 2",
    },
    is: {
      title:
        "White Lotus Sumarmarkaður | Helgarmarkaður í Reykjavík | Umsóknir söluaðila",
      description:
        "Sæktu um bás á White Lotus Sumarmarkaði í miðbæ Reykjavíkur. Lítill innimarkaður á Bankastræti 2, alla föstudaga og laugardaga í júní og júlí, fyrir handverk, vellíðunarvörur, list og helga kakó. Frítt inn.",
      keywords:
        "sumarmarkaður Reykjavík, helgarmarkaður Reykjavík, innimarkaður Ísland, sölubás Reykjavík, handverksmarkaður Ísland, White Lotus markaður, Bankastræti 2 markaður, listmarkaður Reykjavík, vellíðunarmarkaður Ísland, Mama Reykjavík sumarmarkaður, umsókn söluaðila, markaður Reykjavík júní, markaður Reykjavík júlí",
      ogTitle: "White Lotus Sumarmarkaður — Reykjavík · Bankastræti 2",
      ogDescription:
        "Hlýr innimarkaður um helgar í miðbæ Reykjavíkur — gott flæði, gott fólk, mjúk lifandi tónlist og 10 básar fyrir fallegar vörur. Frítt inn · júní & júlí · fös & lau · 13:00–19:00.",
      ogImageAlt:
        "White Lotus Sumarmarkaður í miðbæ Reykjavíkur — sölubásar, helgi kakó og mjúk tónlist á Bankastræti 2",
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
    keywords: t.keywords,
    alternates,
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: alternates.canonical,
      siteName: "Mama Reykjavik",
      type: "website",
      locale: ogLocale(language),
      images: [
        {
          url: OG_IMAGE_URL,
          width: 1200,
          height: 675,
          alt: t.ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.ogTitle,
      description: t.ogDescription,
      images: [OG_IMAGE_URL],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default function SummerMarketPage() {
  return <SummerMarketPageClient />;
}
