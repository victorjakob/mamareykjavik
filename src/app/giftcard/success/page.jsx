import { cookies } from "next/headers";
import SuccessPageClient from "./SuccessPageClient";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";

  const translations = {
    en: {
      title: "Gift Card Purchase Successful! | Mama Reykjavik",
      description:
        "Your gift card is ready! Check your email for your magic link.",
    },
    is: {
      title: "Gjafakort Kaup Tókust! | Mama Reykjavík",
      description:
        "Gjafakortið þitt er tilbúið! Athugaðu tölvupóstinn þinn fyrir töfralinkinn þinn.",
    },
  };

  const t = translations[language];

  return {
    title: t.title,
    description: t.description,

    openGraph: {
      title: t.title,
      description: t.description,
      url: "https://mama.is/giftcard/success",
      siteName: "Mama Reykjavik",
      images: [
        {
          url: "https://mama.is/mamaimg/mamalogo.png",
          width: 1200,
          height: 630,
          alt: "Gift Card Purchase Successful",
        },
      ],
      locale: language === "is" ? "is_IS" : "en_US",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: t.title,
      description: t.description,
      images: ["https://mama.is/mamaimg/mamalogo.png"],
    },

    robots: {
      index: false, // Don't index success pages
      follow: false,
    },
  };
}

export default function SuccessPage() {
  return <SuccessPageClient />;
}

