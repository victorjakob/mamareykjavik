import BookingForm from "./BookingForm";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/whitelotus/booking";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "Book White Lotus Venue | Mama Reykjavik",
      description:
        "Book the White Lotus venue for your next event. An intimate, high-quality event space in downtown Reykjavík perfect for celebrations, workshops, concerts, and gatherings.",
      ogTitle: "Book White Lotus Venue | Mama Reykjavik",
      ogDescription:
        "Reserve the White Lotus venue for your special event. A refined event space in downtown Reykjavík designed for conscious gatherings and creative expression.",
    },
    is: {
      title: "Bóka White Lotus Viðburðarstað | Mama Reykjavík",
      description:
        "Bókaðu White Lotus viðburðarstaðinn fyrir næsta viðburðinn þinn. Náinn og hágæða viðburðarstaður í miðbæ Reykjavíkur fullkominn fyrir hátíðahöld, vinnustofur, tónleika og samkomur.",
      ogTitle: "Bóka White Lotus Viðburðarstað | Mama Reykjavík",
      ogDescription:
        "Pantaðu White Lotus viðburðarstaðinn fyrir sérstakan viðburðinn þinn. Fínn viðburðarstaður í miðbæ Reykjavíkur hannaður fyrir meðvitaðar samkomur og skapandi tjáningu.",
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
          url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/whitelotusbanner.jpg?alt=media&token=ddb5d9ad-25af-4307-b37f-ceaa1b79002a",
          width: 1200,
          height: 630,
          alt: "White Lotus Venue Space",
        },
      ],
      type: "website",
      locale: ogLocale(language),
    },
    twitter: {
      card: "summary_large_image",
      title: t.ogTitle,
      description: t.ogDescription,
      images: [
        "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/whitelotusbanner.jpg?alt=media&token=ddb5d9ad-25af-4307-b37f-ceaa1b79002a",
      ],
    },
  };
}

export default function WhiteLotusBookingPage() {
  return <BookingForm />;
}
