import { headers } from "next/headers";

export default async function StructuredData() {
  // Read pathname from the header set by src/proxy.js — keeps this component
  // server-only so it doesn't drag the layout tree into the client bundle.
  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") || "/";

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
      telephone: "+354 766 6262",
      contactType: "customer service",
      email: "team@mama.is",
    },
    sameAs: [
      "https://www.facebook.com/mamareykjavik",
      "https://www.instagram.com/mamareykjavik",
      "https://www.kornhladan.is/",
    ],
  };

  // Restaurant Schema - for the homepage and restaurant pages
  const restaurantSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": "https://mama.is/#restaurant",
    name: "Mama Reykjavik",
    image:
      "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/mamabanner.jpg",
    description:
      "Mama Reykjavik is a 100% plant-based community restaurant serving world-inspired whole-food cuisine — Indian dhal, West African stew, Mexican chilli, homemade naan, ceremonial cacao, and more. Located in the heart of Reykjavik at Bankastræti 2.",
    servesCuisine: ["Vegan", "Plant-based", "Indian", "West African", "Mexican", "International"],
    priceRange: "$$",
    hasMenu: "https://mama.is/restaurant/menu",
    acceptsReservations: "https://www.dineout.is/mamareykjavik",
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
    telephone: "+354 766 6262",
    email: "team@mama.is",
    url: "https://mama.is",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "426",
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
      "White Lotus is an intimate cultural and spiritual event venue at Bankastræti 2, Reykjavik. Home to cacao ceremonies, yoga, live music, wellness workshops, dance events, and private gatherings. Capacity: 150 standing, 80 seated. Professional sound and lighting included.",
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
    telephone: "+354 770 5111",
    email: "team@mama.is",
    url: "https://mama.is/whitelotus",
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Professional PA System", value: true },
      { "@type": "LocationFeatureSpecification", name: "Stage Lighting", value: true },
      { "@type": "LocationFeatureSpecification", name: "Projector", value: true },
      { "@type": "LocationFeatureSpecification", name: "Private Chef Available", value: true },
      { "@type": "LocationFeatureSpecification", name: "Dance Floor", value: true },
    ],
    containedInPlace: {
      "@type": "Restaurant",
      name: "Mama Reykjavík",
      url: "https://mama.is",
    },
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
          text: "Yes — 100% plant-based. No meat, no fish, no dairy, no eggs. Ever. Everything on our menu is made from whole, plant-based ingredients prepared fresh in our kitchen.",
        },
      },
      {
        "@type": "Question",
        name: "Do you have gluten-free and nut-free options at Mama Reykjavik?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Most of our curries, stews, soups and hummus are naturally gluten-free, and we mark all allergens clearly on the menu. Many dishes are nut-free — just let the team know and we'll guide you.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need to book a table at Mama Reykjavik?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Walk-ins are always welcome. That said, during peak tourist season (June–August) and weekends we strongly recommend booking — especially for groups of 4 or more. Reserve online via Dineout in about 30 seconds.",
        },
      },
      {
        "@type": "Question",
        name: "Where is Mama Reykjavik located?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bankastræti 2, 101 Reykjavík, walk in the port right at the start of Laugavegur and find the entrance — in the heart of downtown. It's a 1-minute walk from the main shopping street and 10 minutes from Harpa or Hallgrímskirkja.",
        },
      },
      {
        "@type": "Question",
        name: "What are Mama Reykjavik's opening hours?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Open every day, 11:30 to 21:00. Last orders around 20:30. Lunch, dinner, tea, cacao — come whenever feels right.",
        },
      },
      {
        "@type": "Question",
        name: "Does Mama Reykjavik deliver?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes — order via Wolt for delivery anywhere in Reykjavík. Same kitchen, same recipes, warm and ready in about 30 minutes.",
        },
      },
      {
        "@type": "Question",
        name: "Can Mama Reykjavik cater my event or office lunch?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. We cater corporate lunches, private gatherings, wellness retreats and birthdays. Minimum 10 portions, 1 week notice. Corporate lunches start from 3,000 kr per head. Get in touch via our catering page at mama.is/catering.",
        },
      },
      {
        "@type": "Question",
        name: "Is Mama Reykjavik suitable for kids and families?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Completely. The space is warm and relaxed, portions are generous, and kids tend to love the naan, hummus, soup and mild curries. High chairs are available on request.",
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
        name: "Is Mama Reykjavik good for tourists?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Mama Reykjavik is rated among the top 4 of 504 restaurants in Reykjavik on TripAdvisor with a 4.9/5 score across 400+ reviews, and is consistently described as one of the best dining experiences in Iceland by international visitors.",
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
        name: "How much does it cost to rent White Lotus in Reykjavík?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Rental prices vary by duration, day of week, and services required. Shorter daytime events start from 50,000 ISK. Contact us for a tailored quote within 24 hours.",
        },
      },
      {
        "@type": "Question",
        name: "How many people does White Lotus hold?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "White Lotus holds up to 150 standing guests and 80 seated. The room reconfigures quickly for any format.",
        },
      },
      {
        "@type": "Question",
        name: "Does White Lotus have sound and lighting equipment?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes — professional PA system, stage and disco lighting, microphones, DI box, mixer, and projector are all included in the rental.",
        },
      },
      {
        "@type": "Question",
        name: "Can I hire a private chef for my event at White Lotus?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. White Lotus has its own private chef who designs a fully custom menu around your event — from grazing boards to sit-down dinners, with a curated bar to match.",
        },
      },
      {
        "@type": "Question",
        name: "Where is White Lotus located in Reykjavík?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "White Lotus is located at Bankastræti 2, 101 Reykjavík, right next to Mama Reykjavík in the city centre.",
        },
      },
      {
        "@type": "Question",
        name: "What types of events can be hosted at White Lotus Reykjavík?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "White Lotus hosts concerts, DJ nights, cacao ceremonies, yoga mornings, corporate dinners, gallery openings, film screenings, private celebrations, talks, workshops, and healing circles.",
        },
      },
    ],
  };

  // EventVenue Schema — Kornhlaðan
  // Kept compatible with the canonical entity at https://www.kornhladan.is/
  // by using a self-referential @id pointing at this URL on mama.is so Google
  // doesn't merge it with the dedicated site.
  const kornhladanSchema = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    "@id": "https://mama.is/kornhladan",
    name: "Kornhlaðan",
    description:
      "Kornhlaðan is a historic 1834 grain warehouse turned event hall at Bankastræti 2, Reykjavík. 111 m², up to 150 standing or 85 seated. Suited for corporate events, weddings, and private celebrations. Operated by White Lotus ehf. and Blessing ehf.",
    image:
      "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/v1762152239/korn_7_mktawg.jpg",
    maximumAttendeeCapacity: 150,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bankastræti 2",
      addressLocality: "Reykjavík",
      postalCode: "101",
      addressCountry: "IS",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 64.1475,
      longitude: -21.9354,
    },
    telephone: "+354 770 5111",
    email: "team@whitelotus.is",
    url: "https://mama.is/kornhladan",
    sameAs: ["https://www.kornhladan.is/"],
  };

  // FAQ Schema — Kornhlaðan (corporate-targeted long-tail)
  const kornhladanFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Kornhlaðan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Kornhlaðan is a historic event venue at Bankastræti 2 in downtown Reykjavík. Built in 1834 as a grain warehouse, then a bakery, today it is a 111 m² private rental hall used for corporate events, weddings, and private gatherings. It is operated alongside Mama Reykjavík and White Lotus by White Lotus ehf. and Blessing ehf.",
        },
      },
      {
        "@type": "Question",
        name: "How many people does Kornhlaðan hold?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Kornhlaðan holds up to 150 standing guests or 85 seated for a sit-down dinner. The 111 m² room reconfigures quickly between formats.",
        },
      },
      {
        "@type": "Question",
        name: "Is Kornhlaðan a good corporate event venue in Reykjavík?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes — Kornhlaðan is a popular choice for corporate events in Reykjavík: annual parties, product launches, team offsites, all-hands dinners, panel evenings, and awards. The hall includes a professional PA system, projector, adjustable lighting, and a full licensed bar.",
        },
      },
      {
        "@type": "Question",
        name: "Can I host a wedding at Kornhlaðan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Kornhlaðan hosts ceremonies, receptions, dinners, and dancing in a single room — all up to 150 guests. Visit kornhladan.is for the gallery, FAQ, availability calendar, and to request a tailored quote.",
        },
      },
      {
        "@type": "Question",
        name: "Where is Kornhlaðan located?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bankastræti 2, 101 Reykjavík — at the start of Laugavegur, in the heart of the city. Next door to Mama Reykjavík and White Lotus.",
        },
      },
      {
        "@type": "Question",
        name: "How do I book Kornhlaðan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Submit an inquiry at https://www.kornhladan.is/book — a tailored quote typically arrives within 24 hours. Or call +354 770 5111.",
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
  const isKornhladanPage = normalizedPathname?.startsWith("/kornhladan");
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
    kornhladan: "Kornhlaðan",
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

      {/* Restaurant Schema — on home and restaurant pages (same @id, single entity) */}
      {(isRestaurantPage || isHomePage) && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
        />
      )}

      {/* Restaurant FAQ — only on /restaurant pages, not the homepage */}
      {isRestaurantPage && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantFaqSchema) }}
        />
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

      {/* Kornhlaðan EventVenue + FAQ — on /kornhladan */}
      {isKornhladanPage && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(kornhladanSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(kornhladanFaqSchema) }}
          />
        </>
      )}
    </>
  );
}
