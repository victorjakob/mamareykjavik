import BreakfastPage from "../components/breakfast/BreakfastPage";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/breakfast";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "Vegan Breakfast in Reykjavík | Mama — from 9, every day",
      description:
        "Plant-based breakfast at Mama Reykjavik, Bankastræti 2 — served 9:00–11:30 every day from 28 June. 100% vegan, walk-in, and your first filter coffee is on us.",
      keywords:
        "vegan breakfast Reykjavik, breakfast Reykjavik, plant-based breakfast Iceland, vegan brunch Reykjavik, breakfast Bankastræti 2, where to eat breakfast Reykjavik, vegan breakfast Iceland, downtown Reykjavik breakfast",
      ogTitle: "Vegan Breakfast at Mama Reykjavík — from 9, every day",
      ogDescription:
        "Slow plant-based mornings in downtown Reykjavík. Served 9:00–11:30 daily from 28 June — first filter coffee on us.",
    },
    is: {
      title: "Vegan Morgunverður í Reykjavík | Mama — frá kl. 9, alla daga",
      description:
        "Plöntubasaður morgunverður á Mama Reykjavík, Bankastræti 2 — framreitt 9:00–11:30 alla daga frá 28. júní. 100% vegan, engin bókun, og fyrsti kaffibollinn er í boði hússins.",
      keywords:
        "vegan morgunverður Reykjavík, morgunmatur Reykjavík, plöntubasaður morgunverður, vegan brunch Reykjavík, morgunmatur miðbær Reykjavík, hvar að fá morgunmat Reykjavík, morgunverður Bankastræti",
      ogTitle: "Vegan morgunverður á Mama Reykjavík — frá kl. 9, alla daga",
      ogDescription:
        "Hægir, plöntubasaðir morgnar í miðbæ Reykjavíkur. Framreitt 9:00–11:30 alla daga frá 28. júní — fyrsti kaffibollinn frír.",
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
          url: "https://res.cloudinary.com/dy8q4hf0k/video/upload/so_0,w_1200,h_630,c_fill,q_auto,f_auto/IMG_6657_gwloa0.jpg",
          width: 1200,
          height: 630,
          alt: "Vegan breakfast at Mama Reykjavík",
        },
      ],
      type: "website",
      locale: ogLocale(language),
    },
  };
}

export default function Breakfast() {
  return <BreakfastPage />;
}
