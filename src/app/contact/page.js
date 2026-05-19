import ContactClient from "./ContactClient";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/contact";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "Contact Mama Reykjavik | Bankastræti 2, Reykjavik",
      description:
        "Contact Mama Reykjavik, a 100% plant-based restaurant at Bankastræti 2 in central Reykjavik. For bookings, catering, events, and general questions.",
      ogTitle: "Contact Mama Reykjavik | Plant-Based Restaurant in Reykjavik",
      ogDescription:
        "Get in touch with Mama Reykjavik for bookings, catering, events, and general questions.",
    },
    is: {
      title: "Hafa samband | Mama Reykjavík",
      description:
        "Hafðu samband við Mama Reykjavík & White Lotus. Spurningar, beiðnir eða samstarf — sendu okkur skilaboð og við svörum sem fyrst.",
      ogTitle: "Hafðu samband við Mama Reykjavík & White Lotus",
      ogDescription:
        "Spurningar, beiðnir eða samstarf — sendu okkur skilaboð og við svörum sem fyrst.",
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
      type: "website",
      locale: ogLocale(language),
    },
  };
}

export default function ContactPage() {
  return <ContactClient />;
}
