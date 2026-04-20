import HomePageRedesign from "@/app/components/homepage/HomePageRedesign";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const t = {
    title: "Mama Reykjavik | Plant-Based Restaurant & Events",
    description:
      "Mama Reykjavik — rated #1–4 of 504 restaurants in Reykjavik. 100% plant-based world-inspired cuisine, cacao ceremonies, live music, yoga, and community events at White Lotus. Bankastræti 2.",
    ogTitle: "Mama Reykjavik | Plant-Based Restaurant & Events in Iceland",
    ogDescription:
      "World-inspired plant-based food, ceremonial cacao, and conscious events in the heart of Reykjavik. Rated 4.9/5 on TripAdvisor. Bankastræti 2.",
  };

  const formatted = formatMetadata({
    title: t.title,
    description: t.description,
  });

  return {
    title: formatted.title,
    description: formatted.description,
    canonical: "https://mama.is",
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: "https://mama.is",
      images: [
        {
          url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/mamabanner.jpg",
          alt: "Mama Reykjavik Restaurant",
        },
      ],
      type: "website",
    },
  };
}

function StructuredData() {
  const restaurantSchema = {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "FoodEstablishment"],
    "name": "Mama Reykjavík",
    "description":
      "100% plant-based, world-inspired restaurant and conscious community space in the heart of Reykjavík. Serving stews, curries, naans, cacao, and smoothies. Hosting cacao ceremonies, yoga, live music, and wellness workshops.",
    "url": "https://mama.is",
    "telephone": "+354 766 6262",
    "email": "team@mama.is",
    "servesCuisine": ["Plant-based", "Vegan", "World cuisine", "International"],
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Bankastræti 2",
      "addressLocality": "Reykjavík",
      "postalCode": "101",
      "addressCountry": "IS",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "64.1466",
      "longitude": "-21.9426",
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        "opens": "11:30",
        "closes": "21:00",
      },
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "426",
      "bestRating": "5",
    },
    "hasMenu": "https://mama.is/restaurant",
    "reservationUrl": "https://www.dineout.is/mamareykjavik",
    "image":
      "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/mamabanner.jpg",
    "sameAs": [
      "https://www.instagram.com/mama.reykjavik",
      "https://www.facebook.com/mamareykjavik",
    ],
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Mama Reykjavík",
    "description":
      "Plant-based restaurant and community event space in Reykjavík. Home to White Lotus venue for cacao ceremonies, yoga, live music, and conscious gatherings.",
    "url": "https://mama.is",
    "telephone": "+354 766 6262",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Bankastræti 2",
      "addressLocality": "Reykjavík",
      "postalCode": "101",
      "addressCountry": "IS",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "64.1466",
      "longitude": "-21.9426",
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        "opens": "11:30",
        "closes": "21:00",
      },
    ],
    "hasMap": "https://maps.google.com/?q=Bankastræti+2,+101+Reykjavík",
    "image":
      "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/mamabanner.jpg",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
    </>
  );
}

export default function Page() {
  return (
    <>
      <StructuredData />
      <HomePageRedesign />
    </>
  );
}
