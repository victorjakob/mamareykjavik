import RestaurantPage from "../components/restaurant/RestaurantPage";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/restaurant";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title:
        "Mama Restaurant Reykjavik | Vegan Food at Bankastræti 2",
      description:
        "Mama Reykjavik is a 100% plant-based restaurant in central Reykjavik, serving world-inspired vegan food, homemade naan, ceremonial cacao, and warm hospitality.",
      keywords:
        "Mama Reykjavik restaurant, vegan restaurant Reykjavik, plant-based food Iceland, best vegan Iceland, downtown Reykjavik dining, Bankastræti 2 restaurant, vegan lunch Reykjavik, plant-based restaurant Iceland",
      ogTitle: "Mama Restaurant Reykjavik | 100% Plant-Based Food",
      ogDescription:
        "Discover Mama Reykjavik's world-inspired vegan menu, homemade naan, ceremonial cacao, and warm hospitality in downtown Reykjavik.",
    },
    is: {
      title:
        "Mama Reykjavík Veitingastaður | Raunverulegur, heiðarlegur matur og ógleymanlegir viðburðir",
      description:
        "Velkomin á Mama Reykjavík & White Lotus - meðvitað samfélagsrými sem koma fólki saman í gegnum mat, viðburði og reynslu í hjarta Reykjavíkur.",
      keywords:
        "Mama Reykjavík veitingastaður, vegan veitingastaður Reykjavík, plöntubundinn matur Ísland, meðvitaður matur Reykjavík, Bankastræti veitingastaður, miðbæjar Reykjavík matur",
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
          url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/mamabanner.jpg",
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
  return <RestaurantPage />;
}
