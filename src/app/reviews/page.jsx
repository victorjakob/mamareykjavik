import { createServerSupabase } from "@/util/supabase/server";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";
import ReviewsPageClient from "./components/ReviewsPageClient";

export const revalidate = 300;

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/reviews";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "Guest Reviews | Mama Reykjavik",
      description:
        "Read verified guest reviews about food, atmosphere, and service at Mama Reykjavik.",
      ogTitle: "Guest Reviews | Mama Reykjavik",
      ogDescription:
        "See what guests say about their experience at Mama Reykjavik.",
    },
    is: {
      title: "Umsagnir gesta | Mama Reykjavík",
      description:
        "Lestu umsagnir gesta um mat, stemningu og þjónustu hjá Mama Reykjavík.",
      ogTitle: "Umsagnir gesta | Mama Reykjavík",
      ogDescription: "Sjáðu hvað gestir segja um upplifun sína hjá Mama Reykjavík.",
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
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: alternates.canonical,
      images: [
        {
          url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1",
          width: 1200,
          height: 630,
          alt: "Mama Reykjavik reviews",
        },
      ],
      type: "website",
      locale: ogLocale(language),
    },
  };
}

export default async function ReviewsPage() {
  const language = await getLocaleFromHeaders();
  const isIcelandic = language === "is";
  const t =
    isIcelandic
      ? {
          eyebrow: "Mama Reykjavík",
          heading: "Umsagnir & upplifun gesta",
          intro:
            "Mama Reykjavík er grænmetisveitingastaður og samfélagsrými í miðbæ Reykjavíkur, þekkt fyrir nærandi plöntumáltíðir, notalega stemningu og hlýja þjónustu. Hér má sjá upplifun gesta.",
          featuredTitle: "Valdar umsagnir",
          featuredSubtitle:
            "Nokkur orð frá gestum sem elska Mama upplifunina.",
          displayed: "umsagnir sýndar",
          loadError: "Ekki tókst að hlaða umsögnum núna.",
          emptyTitle: "Umsagnir væntanlegar",
          emptyText:
            "Við erum að safna upplifun gesta og birtum þær hér fljótlega.",
          moreTitle: "Fleiri umsagnir gesta",
          moreSubtitle:
            "Fleiri sögur frá ferðalöngum, heimafólki og gestum sem heimsóttu okkur.",
          bottomTitle: "Notalegur grænmetisveitingastaður í Reykjavík",
          bottomText:
            "Gestir nefna oft nærandi plöntumáltíðir, rausnarlega skammta, hlýja stemningu og vinalega þjónustu. Mama er einnig menningar- og samfélagsrými þar sem fólk kemur saman yfir mat, tengsl og viðburði.",
          tagsTitle: "Vinsæl þemu í umsögnum",
          exploreTitle: "Uppgötvaðu meira hjá Mama",
          featured: "Valið",
          reviewSuffix: "umsögn",
          reviewSuffixPlural: "umsagnir",
          exploreLinks: [
            { label: "Sjá matseðil", href: "/restaurant/menu" },
            { label: "Kynnast sögunni okkar", href: "/is/about" },
            { label: "Bóka borð", href: "/is/restaurant/book-table" },
            { label: "Skrá mig á viðburð", href: "/is/events" },
            { label: "Panta takeaway", href: "/is/take-away" },
          ],
          tags: [
            "Vegan matur",
            "Notaleg stemning",
            "Hlý þjónusta",
            "Hollur matur",
            "Rausnarlegir skammtar",
            "Matur í Reykjavík",
            "Samfélagsandi",
          ],
        }
      : {
          eyebrow: "Mama Reykjavik",
          heading: "Reviews & Guest Experiences",
          intro:
            "Mama Reykjavik is a vegan restaurant and community space in central Reykjavik, known for nourishing plant-based food, cozy atmosphere, and warm hospitality. Here are some of the experiences shared by our guests.",
          featuredTitle: "Featured Reviews",
          featuredSubtitle: "A few words from guests who loved the Mama experience.",
          displayed: "reviews displayed",
          loadError: "Could not load reviews right now.",
          emptyTitle: "Reviews coming soon",
          emptyText:
            "We are gathering guest experiences and will share them here soon.",
          moreTitle: "More Guest Reviews",
          moreSubtitle:
            "More experiences from visitors, travelers, and locals who spent time with us.",
          bottomTitle: "A cozy vegan restaurant in Reykjavik",
          bottomText:
            "Guests often mention the nourishing plant-based food, generous portions, warm atmosphere, and friendly service. Mama is also known as a cultural and community space where people gather for food, connection, and special events.",
          tagsTitle: "Popular themes in our reviews",
          exploreTitle: "Explore more from Mama",
          featured: "Featured",
          reviewSuffix: "review",
          reviewSuffixPlural: "reviews",
          exploreLinks: [
            { label: "See menu", href: "/restaurant/menu" },
            { label: "Know our story", href: "/about" },
            { label: "Book a table", href: "/restaurant/book-table" },
            { label: "Join an event", href: "/events" },
            { label: "Order takeaway", href: "/take-away" },
          ],
          tags: [
            "Vegan food",
            "Cozy atmosphere",
            "Warm service",
            "Healthy meals",
            "Generous portions",
            "Reykjavik dining",
            "Community vibe",
          ],
        };

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, reviewer_name, source, rating, review_text, featured, visible, sort_order")
    .eq("visible", true)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true, nullsFirst: false });

  const reviews = data || [];
  const featuredReviews = reviews.filter((review) => review.featured);
  const moreReviews = reviews.filter((review) => !review.featured);
  const heroGallery = [
    {
      src: "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1773568804/food1_h9t3u0.webp",
      alt: isIcelandic
        ? "Litrik vegan malti a disk i Mama Reykjavik"
        : "Colorful vegan plate served at Mama Reykjavik restaurant",
    },
    {
      src: "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1773568803/ambient3_bdxiq9.webp",
      alt: isIcelandic
        ? "Notaleg innirymisstemning a Mama Reykjavik"
        : "Cozy dining atmosphere inside Mama Reykjavik",
    },
    {
      src: "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1773568802/food2_ydoe8d.webp",
      alt: isIcelandic
        ? "Frisk jurtamalti born fram a Mama Reykjavik"
        : "Fresh plant-based meal served at Mama Reykjavik",
    },
  ];
  const accentGallery = [
    {
      src: "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1773568801/ambient4_xslytc.webp",
      alt: isIcelandic
        ? "Hlilegt horn fyrir matargesti a Mama Reykjavik"
        : "Warm dining corner at Mama Reykjavik restaurant",
    },
    {
      src: "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1773568801/ambient_lfuk2o.webp",
      alt: isIcelandic
        ? "Samfelagsleg stemning og innanhusshonnun a Mama"
        : "Community vibe and interior details at Mama Reykjavik",
    },
    {
      src: "https://res.cloudinary.com/dy8q4hf0k/image/upload/v1773568800/desert_p59aa5.webp",
      alt: isIcelandic
        ? "Eftirrettur framreiddur a Mama Reykjavik"
        : "House dessert served at Mama Reykjavik",
    },
  ];

  return (
    <ReviewsPageClient
      language={language}
      t={t}
      reviews={reviews}
      featuredReviews={featuredReviews}
      moreReviews={moreReviews}
      hasError={Boolean(error)}
      heroGallery={heroGallery}
      accentGallery={accentGallery}
    />
  );
}
