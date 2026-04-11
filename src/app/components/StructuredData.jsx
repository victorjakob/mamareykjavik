"use client";

import { usePathname } from "next/navigation";

export default function StructuredData() {
  const pathname = usePathname();

  // Organization Schema - appears on all pages
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Mama Reykjavik",
    alternateName: "Mama",
    url: "https://mama.is",
    logo: "https://cmqoetecaasivfzxgnxe.supabase.co/storage/v1/object/public/brand/mama-original.png",
    description:
      "A conscious community space in Reykjavik bringing people together through food, events and meaningful experiences.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bankastræti 2",
      addressLocality: "Reykjavik",
      postalCode: "101",
      addressCountry: "IS",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+354-766-6262",
      contactType: "customer service",
      email: "team@mama.is",
    },
    sameAs: [
      "https://www.facebook.com/mamareykjavik",
      "https://www.instagram.com/mamareykjavik",
    ],
  };

  // Restaurant Schema - for restaurant pages
  const restaurantSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": "https://mama.is/restaurant",
    name: "Mama Reykjavik",
    image:
      "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/mamabanner.jpg",
    description:
      "Mama Reykjavik is a 100% plant-based community restaurant serving world-inspired whole-food cuisine — Indian dhal, West African stew, Mexican chilli, homemade naan, ceremonial cacao, and more. Located in the heart of Reykjavik at Bankastræti 2.",
    servesCuisine: ["Vegan", "Plant-based", "Indian", "West African", "Mexican", "International"],
    priceRange: "$$",
    hasMenu: "https://mama.is/restaurant/menu",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bankastræti 2",
      addressLocality: "Reykjavik",
      postalCode: "101",
      addressCountry: "IS",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 64.1462,
      longitude: -21.9419,
    },
    hasMap: "https://maps.google.com/?q=Bankastræti+2,+101+Reykjavik",
    telephone: "+354-766-6262",
    email: "team@mama.is",
    url: "https://mama.is/restaurant",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "400",
      bestRating: "5",
      worstRating: "1",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "11:30",
        closes: "21:00",
      },
    ],
    sameAs: [
      "https://www.facebook.com/mamareykjavik",
      "https://www.instagram.com/mamareykjavik",
      "https://www.tripadvisor.com/Restaurant_Review-g189970-d21116777-Reviews-Mama_Reykjavik-Reykjavik_Capital_Region.html",
    ],
  };

  // Local Business Schema for White Lotus
  const whiteLotusSchema = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    "@id": "https://mama.is/whitelotus",
    name: "White Lotus",
    description:
      "White Lotus is an intimate cultural and spiritual event venue at Bankastræti 2, Reykjavik. Home to cacao ceremonies, yoga, live music, wellness workshops, dance events, and private gatherings. Capacity: 150 standing, 80 seated.",
    image:
      "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/whitelotusbanner.jpg",
    maximumAttendeeCapacity: 150,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bankastræti 2",
      addressLocality: "Reykjavik",
      postalCode: "101",
      addressCountry: "IS",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 64.1462,
      longitude: -21.9419,
    },
    telephone: "+354-766-6262",
    email: "team@mama.is",
    url: "https://mama.is/whitelotus",
    sameAs: [
      "https://www.facebook.com/profile.php?id=61566431262645",
      "https://www.instagram.com/whitelotusvenue",
    ],
  };

  // WebSite Schema — enables Google Sitelinks search box in results
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://mama.is/#website",
    url: "https://mama.is",
    name: "Mama Reykjavik",
    description:
      "100% plant-based restaurant and White Lotus event space in Reykjavik, Iceland.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://mama.is/events?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  // FAQ Schema — Restaurant page
  const restaurantFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is Mama Reykjavik fully vegan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Mama Reykjavik is 100% plant-based. We do not serve meat, fish, or dairy in any form. Every dish on our menu is made from whole, plant-based ingredients.",
        },
      },
      {
        "@type": "Question",
        name: "What kind of food does Mama Reykjavik serve?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Mama serves world-inspired plant-based cuisine drawing from India, West Africa, Mexico, the Middle East, and Iceland. Signature dishes include Dhal a la Mama, West Africa peanut stew, Chilli Sin Carne, Mama Curry, homemade Garlic Naan, and Ceremonial Cacao.",
        },
      },
      {
        "@type": "Question",
        name: "Where is Mama Reykjavik located?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Mama Reykjavik is located at Bankastræti 2, 101 Reykjavik, Iceland — in the heart of downtown Reykjavik, just off Laugavegur.",
        },
      },
      {
        "@type": "Question",
        name: "Can I book a table at Mama Reykjavik?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can reserve a table at mama.is/restaurant/book-table. We welcome walk-ins too, though reservations are recommended during peak tourist season.",
        },
      },
      {
        "@type": "Question",
        name: "Is Mama Reykjavik good for tourists?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Mama Reykjavik is rated #2–4 of 504 restaurants in Reykjavik on TripAdvisor with a 4.9/5 score across 400+ reviews, and is consistently described as one of the best dining experiences in Iceland by international visitors.",
        },
      },
    ],
  };

  // FAQ Schema — White Lotus page
  const whiteLotousFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is White Lotus in Reykjavik?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "White Lotus is an intimate cultural and spiritual event venue inside Mama Reykjavik at Bankastræti 2. It hosts cacao ceremonies, yoga, live music, wellness workshops, dance events, and private gatherings. Capacity is 150 standing or 80 seated.",
        },
      },
      {
        "@type": "Question",
        name: "Can I rent White Lotus for a private event?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. White Lotus is available for private events including ceremonies, workshops, corporate gatherings, and celebrations. You can submit a booking inquiry at mama.is/whitelotus/booking.",
        },
      },
      {
        "@type": "Question",
        name: "How many people does White Lotus hold?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "White Lotus has a capacity of 150 people standing or 80 people seated, making it ideal for intimate gatherings, ceremonies, and medium-sized events.",
        },
      },
      {
        "@type": "Question",
        name: "What events are hosted at White Lotus?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "White Lotus hosts a regular programme of cacao ceremonies, yoga classes, live music nights, wellness workshops, conscious dining experiences, dance events, and cultural gatherings. Browse upcoming events at mama.is/events.",
        },
      },
    ],
  };

  // FAQ Schema — Cacao prep page
  const cacaoFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is a cacao ceremony?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A cacao ceremony is a heart-opening ritual using ceremonial-grade cacao — a sacred plant medicine used by Mesoamerican cultures for thousands of years. Participants drink warm cacao together in a guided, intentional setting to support connection, meditation, and inner exploration.",
        },
      },
      {
        "@type": "Question",
        name: "How do I prepare for a cacao ceremony at White Lotus?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We recommend arriving on an empty or light stomach (no heavy meals 2–3 hours before), avoiding caffeine before the ceremony, staying well hydrated, and wearing comfortable clothing. Set an intention for what you'd like to explore or release.",
        },
      },
      {
        "@type": "Question",
        name: "Can I book a private cacao ceremony at Mama Reykjavik?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Private ceremonial cacao sessions can be arranged at White Lotus. Submit your inquiry at mama.is/cacao-prep/private-booking.",
        },
      },
      {
        "@type": "Question",
        name: "Is ceremonial cacao safe for everyone?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ceremonial cacao is generally safe and non-psychoactive. However, people on antidepressants (MAOIs/SSRIs), those with serious heart conditions, or pregnant women should consult a doctor before participating. We always recommend disclosing any health conditions when booking.",
        },
      },
    ],
  };

  // Determine which schemas to include based on current page
  const normalizedPathname = pathname?.startsWith("/is/")
    ? pathname.slice(3)
    : pathname === "/is"
      ? "/"
      : pathname;

  const isRestaurantPage = normalizedPathname?.startsWith("/restaurant");
  const isWhiteLotusPage = normalizedPathname?.startsWith("/whitelotus");
  const isEventsPage = normalizedPathname?.startsWith("/events");
  const isCacaoPage = normalizedPathname?.startsWith("/cacao-prep");
  const isHomePage = normalizedPathname === "/";

  // BreadcrumbList Schema — auto-generated from URL segments
  // Human-readable labels for known path segments
  const SEGMENT_LABELS = {
    restaurant: "Restaurant",
    menu: "Menu",
    "book-table": "Book a Table",
    whitelotus: "White Lotus",
    booking: "Book a Space",
    rent: "Venue Rental",
    events: "Events",
    "past-events": "Past Events",
    shop: "Shop",
    "ceremonial-cacao": "Ceremonial Cacao",
    "cacao-prep": "Cacao Ceremonies",
    "private-booking": "Private Booking",
    about: "About",
    contact: "Contact",
    reviews: "Reviews",
    tours: "Tours",
    "summer-market": "Summer Market",
    apply: "Apply",
    collaborations: "Collaborations",
    "take-away": "Take Away",
    giftcard: "Gift Cards",
    policies: "Policies",
    terms: "Terms",
    privacy: "Privacy Policy",
    store: "Store Policy",
    tickets: "Ticket Policy",
    "hosting-wl": "Hosting Policy",
  };

  const buildBreadcrumbs = () => {
    if (!normalizedPathname || normalizedPathname === "/") return null;

    const segments = normalizedPathname.split("/").filter(Boolean);
    const items = [
      {
        "@type": "ListItem",
        position: 1,
        name: "Mama Reykjavik",
        item: "https://mama.is",
      },
    ];

    let cumulativePath = "";
    segments.forEach((segment, index) => {
      cumulativePath += `/${segment}`;
      const label =
        SEGMENT_LABELS[segment] ||
        // For dynamic slugs (event names, product slugs), title-case the slug
        segment
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

      items.push({
        "@type": "ListItem",
        position: index + 2,
        name: label,
        item: `https://mama.is${cumulativePath}`,
      });
    });

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items,
    };
  };

  const breadcrumbSchema = buildBreadcrumbs();

  return (
    <>
      {/* Organization Schema — always present */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* WebSite Schema — always present, enables search box in Google results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      {/* BreadcrumbList — on all non-home pages */}
      {!isHomePage && breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}

      {/* Restaurant Schema + FAQ — on restaurant pages */}
      {isRestaurantPage && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantFaqSchema) }}
          />
        </>
      )}

      {/* White Lotus Schema + FAQ — on whitelotus pages */}
      {isWhiteLotusPage && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(whiteLotusSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(whiteLotousFaqSchema) }}
          />
        </>
      )}

      {/* Cacao FAQ — on cacao-prep pages */}
      {isCacaoPage && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(cacaoFaqSchema) }}
        />
      )}
    </>
  );
}
