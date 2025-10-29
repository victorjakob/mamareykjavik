import FormWL from "@/app/whitelotus/components/FormWL";
import { cookies } from "next/headers";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";

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

  return {
    title: t.title,
    description: t.description,
    canonical: "https://mama.is/whitelotus/rent",
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: "https://mama.is/whitelotus/rent",
      images: [
        {
          url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/whitelotusbanner.jpg?alt=media&token=ddb5d9ad-25af-4307-b37f-ceaa1b79002a",
          width: 1200,
          height: 630,
          alt: "White Lotus Venue Space",
        },
      ],
      type: "website",
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
