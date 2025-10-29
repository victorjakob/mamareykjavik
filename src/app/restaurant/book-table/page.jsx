import BookRedirect from "@/app/components/restaurant/BookRedirect";
import { cookies } from "next/headers";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";

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

  return {
    title: t.title,
    description: t.description,
    canonical: "https://mama.is/restaurant/book-table",
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: "https://mama.is/restaurant/book-table",
      images: [
        {
          url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1",
          alt: "Mama Reykjavik Logo",
        },
      ],
      type: "website",
    },
  };
}

export default function BookTable() {
  return <BookRedirect />;
}
