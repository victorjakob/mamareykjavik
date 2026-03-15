import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";
import TakeAwayRedirect from "@/app/components/restaurant/TakeAwayRedirect";

export const revalidate = 300;
const WOLT_URL = "https://wolt.com/en/isl/reykjavik/restaurant/mama-reykjavik";
const OG_IMAGE =
  "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/take-away";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "Takeaway | Mama Reykjavik",
      description:
        "Order Mama Reykjavik takeaway through Wolt. Get our plant-based dishes delivered in Reykjavik.",
      ogTitle: "Takeaway at Mama Reykjavik",
      ogDescription:
        "Order Mama Reykjavik takeaway on Wolt and enjoy plant-based favorites at home.",
      twitterTitle: "Order Takeaway | Mama Reykjavik",
      twitterDescription:
        "Order plant-based takeaway from Mama Reykjavik through Wolt.",
      keywords: [
        "Mama Reykjavik takeaway",
        "vegan takeaway Reykjavik",
        "order Mama Reykjavik",
        "plant-based delivery Reykjavik",
        "Wolt Mama Reykjavik",
      ],
    },
    is: {
      title: "Takeaway | Mama Reykjavík",
      description:
        "Pantaðu takeaway frá Mama Reykjavík í gegnum Wolt. Plönturéttir sendir í Reykjavík.",
      ogTitle: "Takeaway hjá Mama Reykjavík",
      ogDescription:
        "Pantaðu takeaway frá Mama Reykjavík á Wolt og njóttu plönturétta heima.",
      twitterTitle: "Panta takeaway | Mama Reykjavík",
      twitterDescription:
        "Pantaðu plönturétti frá Mama Reykjavík í takeaway með Wolt.",
      keywords: [
        "Mama Reykjavík takeaway",
        "vegan takeaway Reykjavík",
        "panta Mama Reykjavík",
        "plönturéttir heim",
        "Wolt Mama Reykjavík",
      ],
    },
  };

  const t = translations[language] || translations.en;
  const formatted = formatMetadata({
    title: t.title,
    description: t.description,
  });

  return {
    title: formatted.title,
    description: formatted.description,
    keywords: t.keywords,
    alternates,
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: alternates.canonical,
      siteName: "Mama Reykjavik",
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: "Mama Reykjavik takeaway",
        },
      ],
      type: "website",
      locale: ogLocale(language),
    },
    twitter: {
      card: "summary_large_image",
      title: t.twitterTitle,
      description: t.twitterDescription,
      images: [
        {
          url: OG_IMAGE,
          alt: "Mama Reykjavik takeaway",
        },
      ],
    },
  };
}

export default async function TakeAwayPage() {
  const language = await getLocaleFromHeaders();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: language === "is" ? "Takeaway hjá Mama Reykjavík" : "Takeaway at Mama Reykjavik",
    url: `https://mama.is${language === "is" ? "/is" : ""}/take-away`,
    mainEntity: {
      "@type": "Restaurant",
      name: "Mama Reykjavik",
      servesCuisine: "Vegan",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Bankastraeti 2",
        addressLocality: "Reykjavik",
        postalCode: "101",
        addressCountry: "IS",
      },
      sameAs: [WOLT_URL],
      potentialAction: {
        "@type": "OrderAction",
        target: WOLT_URL,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TakeAwayRedirect />
    </>
  );
}
