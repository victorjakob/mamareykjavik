import { cookies } from "next/headers";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";

  const translations = {
    en: {
      title: "Book a Private Cacao Ceremony | Mama Reykjavik",
      description:
        "Request a private cacao ceremony with Mama Reykjavik. Fill out our booking form and we'll get back to you soon.",
      ogTitle: "Book a Private Cacao Ceremony | Mama Reykjavik",
      ogDescription:
        "Request a private cacao ceremony with Mama Reykjavik. Fill out our booking form and we'll get back to you soon.",
    },
    is: {
      title: "Bókaðu Einkakakóathöfn | Mama Reykjavík",
      description:
        "Biðja um einkakakóathöfn með Mama Reykjavík. Fylltu út bókunareyðublaðið okkar og við endurheimtum til þín fljótlega.",
      ogTitle: "Bókaðu Einkakakóathöfn | Mama Reykjavík",
      ogDescription:
        "Biðja um einkakakóathöfn með Mama Reykjavík. Fylltu út bókunareyðublaðið okkar og við endurheimtum til þín fljótlega.",
    },
  };

  const t = translations[language];

  return {
    title: t.title,
    description: t.description,
    canonical: "https://mama.is/cacao-prep/private-booking",
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: "https://mama.is/cacao-prep/private-booking",
      siteName: "Mama Reykjavik",
      images: [
        {
          url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752335005/caca_c1ku48.webp",
          width: 1200,
          height: 630,
          alt: "Private Cacao Ceremony Booking - Mama Reykjavik",
        },
      ],
      type: "website",
      locale: language === "is" ? "is_IS" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: t.ogTitle,
      description: t.ogDescription,
      images: [
        {
          url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1752335005/caca_c1ku48.webp",
          alt: "Private Cacao Ceremony Booking - Mama Reykjavik",
        },
      ],
    },
  };
}

export default function PrivateBookingLayout({ children }) {
  return <>{children}</>;
}
