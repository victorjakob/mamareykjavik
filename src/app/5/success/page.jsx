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

  return {
    title: t.title,
    description: t.description,
    robots: {
      index: false, // Don't index success pages
      follow: false,
    },
  };
}

export default function SuccessPage() {
  return <SuccessPageClient />;
}
