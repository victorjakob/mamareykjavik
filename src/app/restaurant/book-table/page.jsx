import BookRedirect from "@/app/components/restaurant/BookRedirect";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/restaurant/book-table";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "Book a Table | Mama Reykjavik",
      description:
        "Reserve your table at Mama Reykjavik restaurant. Experience our unique atmosphere and delicious conscious dining menu.",
      ogTitle: "Book a Table at Mama Reykjavik Restaurant",
      ogDescription:
        "Make a reservation at Mama Reykjavik restaurant. Join us for a memorable dining experience in the heart of Reykjavik.",
    },
    is: {
      title: "Bóka borð | Mama Reykjavík",
      description:
        "Bókaðu borð á Mama Reykjavík veitingastað. Upplifðu einstaka stemningu okkar og góðan meðvitaðan mat.",
      ogTitle: "Bóka borð á Mama Reykjavík Veitingastað",
      ogDescription:
        "Gerðu bókun á Mama Reykjavík veitingastað. Komdu með okkur fyrir ógleymanlega matarupplifun í hjarta Reykjavíkur.",
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
          url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/mamabanner.jpg",
          alt: "Mama Reykjavik Logo",
        },
      ],
      type: "website",
      locale: ogLocale(language),
    },
  };
}

export default function BookTable() {
  return <BookRedirect />;
}
