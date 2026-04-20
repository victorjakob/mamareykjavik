import AboutPageRedesign from "../components/about-us/AboutPageRedesign";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/about";

  const translations = {
    en: {
      title: "About Us | Mama Reykjavik",
      description:
        "Learn about Mama Reykjavik & White Lotus - our story, vision, and commitment to creating a conscious community space in Reykjavik.",
      ogTitle: "About Mama Reykjavik & White Lotus",
      ogDescription:
        "Discover our journey, values and vision as we create a conscious community space bringing people together through food, events and experiences.",
    },
    is: {
      title: "Um okkur | Mama Reykjavík",
      description:
        "Lærðu um Mama Reykjavík & White Lotus - sögu okkar, sjónarhorn og skuldbinding við að búa til meðvitað samfélagsrými í Reykjavík.",
      ogTitle: "Um Mama Reykjavík & White Lotus",
      ogDescription:
        "Uppgötvaðu ferð okkar, gildi og sjónarhorn þegar við búum til meðvitað samfélagsrými sem koma fólki saman í gegnum mat, viðburði og reynslu.",
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
    alternates: alternatesFor({ locale: language, pathname, translated: true }),
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: alternatesFor({ locale: language, pathname, translated: true }).canonical,
      images: [
        {
          url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/mamabanner.jpg",
          alt: "Mama Reykjavik Logo",
        },
      ],
      type: "website",
      locale: ogLocale(language),
    },
  };
}

export default function AboutPage() {
  return (
    <main className="bg-[#1f1712]">
      <AboutPageRedesign />
    </main>
  );
}
