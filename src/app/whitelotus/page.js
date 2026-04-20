import WhiteLotusPageRedesign from "@/app/whitelotus/components/WhiteLotusPageRedesign";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/whitelotus";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "White Lotus | Mama Reykjavik",
      description:
        "A refined event space for music, movement, ceremony & celebration. Intimate, high-quality venue in downtown Reykjavík for conscious gatherings and creative expression.",
      ogTitle: "White Lotus Event Venue | Mama Reykjavik",
      ogDescription:
        "Host your next event at White Lotus. An intimate, high-quality venue in downtown Reykjavík designed for conscious gatherings, creative expression, and unforgettable nights.",
    },
    is: {
      title: "White Lotus — Fjölbreytt viðburðarými í Reykjavík",
      description:
        "Glæsilegt rými fyrir viðburði í miðbæ Reykjavíkur fyrir tónlist, hreyfingu, athafnir og fagnað. White Lotus er við hlið Mama Reykjavík og hentar jafnt fyrir tónleika, kakóathafnir, jóga og einkaviðburði.",
      ogTitle: "White Lotus — Fjölbreytt viðburðarými í Reykjavík",
      ogDescription:
        "Haltu viðburð hjá White Lotus í miðbæ Reykjavíkur. Glæsilegt og sveigjanlegt rými fyrir tónleika, kakóathafnir, jóga, fyrirtækjaviðburði og fagnað.",
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
      images: [
        {
          url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/whitelotusbanner.jpg",
          width: 1200,
          height: 630,
          alt: "White Lotus Venue Space",
        },
      ],
      type: "website",
      locale: ogLocale(language),
    },
  };
}

function StructuredData() {
  const venueSchema = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    "name": "White Lotus",
    "description": "Intimate event space in downtown Reykjavík for music, movement, ceremony and celebration. Capacity 150 standing, 80 seated. Professional sound and lighting included.",
    "url": "https://mama.is/whitelotus",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Bankastræti 2",
      "addressLocality": "Reykjavík",
      "postalCode": "101",
      "addressCountry": "IS"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "64.1466",
      "longitude": "-21.9426"
    },
    "maximumAttendeeCapacity": 150,
    "amenityFeature": [
      { "@type": "LocationFeatureSpecification", "name": "Professional PA System", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Stage Lighting", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Projector", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Private Chef Available", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Dance Floor", "value": true }
    ],
    "openingHoursSpecification": [
      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday"], "closes": "01:00" },
      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Friday","Saturday"], "closes": "03:00" }
    ],
    "containedInPlace": {
      "@type": "Restaurant",
      "name": "Mama Reykjavík",
      "url": "https://mama.is"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How much does it cost to rent White Lotus in Reykjavík?",
        "acceptedAnswer": { "@type": "Answer", "text": "Rental prices vary by duration, day of week, and services required. Shorter daytime events start from 50,000 ISK. Contact us for a tailored quote within 24 hours." }
      },
      {
        "@type": "Question",
        "name": "How many people does White Lotus hold?",
        "acceptedAnswer": { "@type": "Answer", "text": "White Lotus holds up to 150 standing guests and 80 seated. The room reconfigures quickly for any format." }
      },
      {
        "@type": "Question",
        "name": "Does White Lotus have sound and lighting equipment?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes — professional PA system, stage and disco lighting, microphones, DI box, mixer, and projector are all included in the rental." }
      },
      {
        "@type": "Question",
        "name": "Can I hire a private chef for my event at White Lotus?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. White Lotus has its own private chef who designs a fully custom menu around your event — from grazing boards to sit-down dinners, with a curated bar to match." }
      },
      {
        "@type": "Question",
        "name": "Where is White Lotus located in Reykjavík?",
        "acceptedAnswer": { "@type": "Answer", "text": "White Lotus is located at Bankastræti 2, 101 Reykjavík, right next to Mama Reykjavík in the city centre." }
      },
      {
        "@type": "Question",
        "name": "What types of events can be hosted at White Lotus Reykjavík?",
        "acceptedAnswer": { "@type": "Answer", "text": "White Lotus hosts concerts, DJ nights, cacao ceremonies, yoga mornings, corporate dinners, gallery openings, film screenings, private celebrations, talks, workshops, and healing circles." }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(venueSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  );
}

export default async function Venue() {
  return (
    <div className="relative isolate overflow-hidden bg-[#110f0d] min-h-screen">
      <StructuredData />
      <WhiteLotusPageRedesign />
    </div>
  );
}
