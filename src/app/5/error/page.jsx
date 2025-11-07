import { cookies } from "next/headers";
import ErrorClient from "./ErrorClient";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";

  const translations = {
    en: {
      title: "Payment Error | Mama Reykjavik",
      description: "There was an issue with your payment. No charges were made. Please try again or contact support.",
    },
    is: {
      title: "Greiðsluvilla | Mama Reykjavík",
      description: "Það kom upp vandamál með greiðsluna þína. Engar skuldfærslur voru gerðar. Vinsamlegast reyndu aftur eða hafðu samband.",
    },
  };

  const t = translations[language];
  const ogImage = "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1762502519/Screenshot_2025-11-07_at_15.00.51_lfef1n.png";

  return {
    title: t.title,
    description: t.description,
    
    openGraph: {
      title: t.title,
      description: t.description,
      url: "https://mama.is/5/error",
      siteName: "Mama Reykjavik",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "5 Meals for Winter at Mama Reykjavik",
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
      index: false,
      follow: false,
    },
  };
}

export default function ErrorPage() {
  return <ErrorClient />;
}

