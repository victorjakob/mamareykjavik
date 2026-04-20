import CollaborationsContent from "./CollaborationsContent";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/collaborations";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "Our Collaborations | Mama Reykjavík",
      description:
        "Discover our trusted partners and collaborations. We work with like-minded Icelandic companies who share our passion for quality, sustainability, and community.",
      ogTitle: "Our Trusted Partners | Mama Reykjavík",
      ogDescription:
        "We're proud to collaborate with like-minded Icelandic companies who share our passion for quality, sustainability, and community.",
    },
    is: {
      title: "Samstarfsaðilar okkar | Mama Reykjavík",
      description:
        "Kynntu þér samstarfsaðila okkar. Við vinnum með íslenskum fyrirtækjum sem deila ástríðu okkar fyrir gæðum, sjálfbærni og samfélagi.",
      ogTitle: "Traust samstarf | Mama Reykjavík",
      ogDescription:
        "Við erum stolt af samstarfi við íslensk fyrirtæki sem deila ástríðu okkar fyrir gæðum, sjálfbærni og samfélagi.",
    },
  };

  const t = translations[language] || translations.en;
  const formatted = formatMetadata({ title: t.title, description: t.description });

  return {
    title: formatted.title,
    description: formatted.description,
    alternates,
    keywords:
      "Mama Reykjavik partners, collaborations Iceland, Maul.is, business partnerships Reykjavik, sustainable partnerships, Iceland food partnerships",
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: alternates.canonical,
      type: "website",
      locale: ogLocale(language),
      images: [
        {
          url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/mamabanner.jpg",
          width: 1200,
          height: 630,
          alt: "Mama Reykjavík Collaborations & Partners",
        },
      ],
    },
  };
}

export default function CollaborationsPage() {
  return <CollaborationsContent />;
}
