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
      "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1",
    description:
      "Experience authentic Vietnamese cuisine and vibrant events at Mama Reykjavik. Join us for delicious food, cultural experiences, and community gatherings in the heart of Reykjavik.",
    servesCuisine: "Vietnamese",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bankastræti 2",
      addressLocality: "Reykjavik",
      postalCode: "101",
      addressCountry: "IS",
    },
    telephone: "+354-766-6262",
    email: "team@mama.is",
    url: "https://mama.is/restaurant",
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
    ],
  };

  // Local Business Schema for White Lotus
  const whiteLotusSchema = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    "@id": "https://mama.is/whitelotus",
    name: "White Lotus Venue",
    description:
      "Exclusive event venue in the heart of Reykjavik. Perfect space for ceremonies, workshops, gatherings and private events.",
    image:
      "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/whitelotusbanner.jpg?alt=media&token=ddb5d9ad-25af-4307-b37f-ceaa1b79002a",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bankastræti 2",
      addressLocality: "Reykjavik",
      postalCode: "101",
      addressCountry: "IS",
    },
    telephone: "+354-766-6262",
    email: "team@whitelotus.is",
    url: "https://mama.is/whitelotus",
    sameAs: [
      "https://www.facebook.com/profile.php?id=61566431262645",
      "https://www.instagram.com/whitelotusvenue",
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

  return (
    <>
      {/* Organization Schema - Always present */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />

      {/* Restaurant Schema - On restaurant pages */}
      {isRestaurantPage && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(restaurantSchema),
          }}
        />
      )}

      {/* White Lotus Schema - On White Lotus pages */}
      {isWhiteLotusPage && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(whiteLotusSchema),
          }}
        />
      )}
    </>
  );
}
