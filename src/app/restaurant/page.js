import OpenHoursMama from "./OpenHoursMama";
import About from "../components/homepage/About";
import Hero from "../components/homepage/Hero";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/restaurant";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title:
        "Mama Reykjavik Restaurant | Real, Honest Food & Unforgettable Events",
      description:
        "Welcome to Mama Reykjavik & White Lotus - a conscious community space bringing people together through food, events and experiences in the heart of Reykjavik.",
      keywords:
        "Mama Reykjavik restaurant, Vietnamese food Iceland, Reykjavik restaurant, plant-based food, conscious dining, Bankastræti restaurant, downtown Reykjavik dining",
      ogTitle: "Mama Reykjavik Restaurant | Conscious Community Space",
      ogDescription:
        "A conscious community space in Reykjavik bringing people together through food, events and meaningful experiences.",
    },
    is: {
      title:
        "Mama Reykjavík Veitingastaður | Raunverulegur, heiðarlegur matur og ógleymanlegir viðburðir",
      description:
        "Velkomin á Mama Reykjavík & White Lotus - meðvitað samfélagsrými sem koma fólki saman í gegnum mat, viðburði og reynslu í hjarta Reykjavíkur.",
      keywords:
        "Mama Reykjavík veitingastaður, víetnamsmatur Ísland, Reykjavík veitingastaður, plöntubundinn matur, meðvitaður matur, Bankastræti veitingastaður, miðbæjar Reykjavík matur",
      ogTitle: "Mama Reykjavík Veitingastaður | Meðvitað Samfélagsrými",
      ogDescription:
        "Meðvitað samfélagsrými í Reykjavík sem koma fólki saman í gegnum mat, viðburði og merkingarbæra reynslu.",
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
    keywords: t.keywords,
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: alternates.canonical,
      images: [
        {
          url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1",
          width: 1200,
          height: 630,
          alt: "Mama Reykjavik Restaurant",
        },
      ],
      type: "website",
      locale: ogLocale(language),
    },
  };
}

export default function Home() {
  return (
    <div className="min-h-screen min-w-screen">
      <main>
        <Hero />
        <About />
        <OpenHoursMama />
      </main>
    </div>
  );
}
