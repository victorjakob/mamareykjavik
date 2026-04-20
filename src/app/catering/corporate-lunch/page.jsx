import CorporateLunchPage from "@/app/components/catering/CorporateLunchPage";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/catering/corporate-lunch";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "Corporate Lunch Delivery Reykjavík | Plant-Based Office Catering | Mama",
      description:
        "Fresh, 100% plant-based corporate lunch delivery across Reykjavík. Stews, curries, dahl and naan made from scratch — delivered to your office. Minimum 10 portions, weekly or one-off orders.",
      ogTitle: "Corporate Lunch Delivery Reykjavík — Mama Reykjavík",
      ogDescription:
        "Nourishing plant-based lunches delivered to your office. World-inspired, made fresh daily. Minimum 10 portions. Request a quote today.",
    },
    is: {
      title: "Hádegismatur á skrifstofu í Reykjavík | Plöntubundinn matur | Mama",
      description:
        "Ferskur, 100% plöntubundinn hádegismatur sendur á skrifstofu þína í Reykjavík. Súpur, karí, dahl og naan — gerðar frá grunni. Lágmark 10 skammtar.",
      ogTitle: "Hádegismatur á skrifstofu — Mama Reykjavík",
      ogDescription:
        "Næringarríkur plöntubundinn matur sendur á skrifstofu þína. Lágmark 10 skammtar. Biðjum um tilboð í dag.",
    },
  };

  const t = translations[language] || translations.en;
  const formatted = formatMetadata({ title: t.title, description: t.description });

  return {
    title: formatted.title,
    description: formatted.description,
    alternates,
    keywords:
      "corporate lunch delivery Reykjavik, office catering Reykjavik, plant-based corporate catering Iceland, vegan office lunch Reykjavik, team lunch delivery Iceland, conscious catering Reykjavik",
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: alternates.canonical,
      images: [
        {
          url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/mamadahl.jpg",
          width: 1200,
          height: 630,
          alt: "Corporate lunch delivery Reykjavík — Mama Reykjavík",
        },
      ],
      type: "website",
      locale: ogLocale(language),
    },
  };
}

// ── JSON-LD structured data (LocalBusiness + FoodService) ─────────────────────
function StructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FoodService",
        "@id": "https://mama.is/catering/corporate-lunch#service",
        "name": "Corporate Lunch Delivery — Mama Reykjavík",
        "description":
          "Fresh, 100% plant-based corporate lunch delivery across Reykjavík. Minimum 10 portions, weekly or one-off orders. World-inspired stews, curries and dahl made from scratch.",
        "url": "https://mama.is/catering/corporate-lunch",
        "provider": {
          "@type": "Restaurant",
          "@id": "https://mama.is/#restaurant",
          "name": "Mama Reykjavík",
          "url": "https://mama.is",
          "telephone": "+3546167855",
          "email": "team@mama.is",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Bankastræti 2",
            "addressLocality": "Reykjavík",
            "postalCode": "101",
            "addressCountry": "IS",
          },
          "servesCuisine": ["Vegan", "Plant-Based", "International"],
          "priceRange": "$$",
          "hasMap": "https://maps.google.com/?q=Bankastræti+2,+Reykjavík",
        },
        "areaServed": {
          "@type": "City",
          "name": "Reykjavík",
        },
        "availableChannel": {
          "@type": "ServiceChannel",
          "serviceUrl": "https://mama.is/catering/quote",
          "serviceType": "Online Quote Request",
        },
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is the minimum order for corporate lunch delivery in Reykjavík?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The minimum order is 10 portions per delivery. We deliver across Greater Reykjavík.",
            },
          },
          {
            "@type": "Question",
            "name": "Do you offer weekly office lunch delivery in Reykjavík?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. We offer both recurring weekly deliveries and one-off orders for corporate events. You can adjust quantities or pause with one week's notice.",
            },
          },
          {
            "@type": "Question",
            "name": "Is the corporate lunch menu 100% plant-based?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, every dish on our catering menu is 100% plant-based and made from scratch in our Bankastræti kitchen.",
            },
          },
          {
            "@type": "Question",
            "name": "How much notice do you need for corporate lunch delivery?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We ask for at least one week's notice for the first order. Ongoing weekly deliveries are agreed in advance.",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function CorporateLunchRoute() {
  return (
    <>
      <StructuredData />
      <CorporateLunchPage />
    </>
  );
}
