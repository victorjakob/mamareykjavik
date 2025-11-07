import { cookies } from "next/headers";
import SuccessPageClient from "./SuccessPageClient";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";

  const translations = {
    en: {
      title: "Purchase Successful! | Mama Reykjavik",
      description:
        "Your 5 Meals for Winter card is ready! Check your email for your magic link.",
    },
    is: {
      title: "Kaup Tókust! | Mama Reykjavík",
      description:
        "5 Réttir fyrir veturinn kortið þitt er tilbúið! Athugaðu tölvupóstinn þinn fyrir töfralinkinn þinn.",
    },
  };

  const t = translations[language];
  const ogImage =
    "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1762502519/Screenshot_2025-11-07_at_15.00.51_lfef1n.png";

  return {
    title: t.title,
    description: t.description,

    openGraph: {
      title: t.title,
      description: t.description,
      url: "https://mama.is/5/success",
      siteName: "Mama Reykjavik",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "5 Meals for Winter - Purchase Successful",
        },
      ],
      locale: language === "is" ? "is_IS" : "en_US",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: t.title,
      description: t.description,
      images: [ogImage],
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
