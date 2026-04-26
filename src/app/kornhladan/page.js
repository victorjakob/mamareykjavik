import KornhladanPage from "@/app/kornhladan/components/KornhladanPage";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/kornhladan";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "Kornhlaðan — Historic Event Venue at Bankastræti 2 | Mama Reykjavík",
      description:
        "Kornhlaðan, the historic 1834 grain warehouse at Bankastræti 2 — Reykjavík's hidden corporate event venue and wedding hall. Up to 150 guests. Operated alongside Mama Reykjavík and White Lotus.",
      ogTitle: "Kornhlaðan — Corporate Events & Weddings in Downtown Reykjavík",
      ogDescription:
        "A historic 111 m² hall at Bankastræti 2 for corporate offsites, annual parties, product launches, and intimate weddings. Up to 150 guests. From Mama Reykjavík.",
    },
    is: {
      title: "Kornhlaðan — Sögulegur veislusalur á Bankastræti 2 | Mama Reykjavík",
      description:
        "Kornhlaðan á Bankastræti 2 er sögulegur veislusalur frá 1834 — fyrirtækjaviðburðir, brúðkaup og einkaviðburðir í miðbæ Reykjavíkur. Allt að 150 gestir.",
      ogTitle: "Kornhlaðan — Fyrirtækjaviðburðir og brúðkaup í miðbæ Reykjavíkur",
      ogDescription:
        "Sögulegt 111 m² rými á Bankastræti 2 fyrir árshátíðir, vörukynningar, vinnufundi og brúðkaup. Allt að 150 gestir. Frá Mama Reykjavík.",
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
          url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/v1762152239/korn_7_mktawg.jpg",
          width: 1200,
          height: 630,
          alt: "Kornhlaðan — historic venue at Bankastræti 2, Reykjavík",
        },
      ],
      type: "website",
      locale: ogLocale(language),
    },
  };
}

export default async function Kornhladan() {
  const language = await getLocaleFromHeaders();
  return (
    <div className="relative isolate overflow-hidden bg-[#0b0a08] min-h-screen">
      <KornhladanPage locale={language} />
    </div>
  );
}
