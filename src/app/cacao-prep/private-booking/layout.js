import { cookies } from "next/headers";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";

  const translations = {
    en: {
      title: "Private Cacao Ceremony | Mama Reykjavík",
      description:
        "An intimate cacao ceremony for your group, retreat, or gathering. Held at White Lotus, your venue, or in nature. From 10 guests, from 50,000 ISK.",
      ogTitle: "Private Cacao Ceremony | Mama Reykjavík",
      ogDescription:
        "An intimate cacao ceremony for your group, retreat, or gathering. Held at White Lotus, your venue, or in nature.",
    },
    is: {
      title: "Einka kakó-athöfn | Mama Reykjavík",
      description:
        "Innileg kakó-athöfn fyrir hóp, ferð eða samkomu. Haldin í White Lotus, hjá þér eða úti í náttúrunni. Frá 10 gestum, frá 50.000 kr.",
      ogTitle: "Einka kakó-athöfn | Mama Reykjavík",
      ogDescription:
        "Innileg kakó-athöfn fyrir hóp, ferð eða samkomu. Haldin í White Lotus, hjá þér eða úti í náttúrunni.",
    },
  };

  const t = translations[language];

  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: "https://mama.is/cacao-prep/private-booking",
    },
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
