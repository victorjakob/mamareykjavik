import FormWL from "@/app/whitelotus/components/FormWL";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/whitelotus/rent";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "Rent White Lotus | Mama Reykjavik",
      description:
        "Rent our beautiful White Lotus venue space for your next event. Perfect for ceremonies, workshops, gatherings and private events in Reykjavik.",
      ogTitle: "Rent White Lotus Event Venue | Mama Reykjavik",
      ogDescription:
        "Book White Lotus venue for your next event. An ideal space for ceremonies, workshops, gatherings and private events in the heart of Reykjavik.",
    },
    is: {
      title: "Leigja White Lotus | Mama Reykjavík",
      description:
        "Leigðu fallega White Lotus viðburðarýmið okkar fyrir næsta viðburðinn þinn. Fullkomið fyrir athafnir, verkstæði, samkomur og einkaviðburði í Reykjavík.",
      ogTitle: "Leigja White Lotus Viðburðastað | Mama Reykjavík",
      ogDescription:
        "Bókaðu White Lotus viðburðastað fyrir næsta viðburðinn þinn. Fullkomið rými fyrir athafnir, verkstæði, samkomur og einkaviðburði í hjarta Reykjavíkur.",
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

export default function Rent() {
  return (
    <div>
      <FormWL />
    </div>
  );
}
