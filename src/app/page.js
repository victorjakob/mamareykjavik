import HomePageRedesign from "@/app/components/homepage/HomePageRedesign";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const t = {
    title: "Mama Reykjavik | 100% Plant-Based Restaurant in Reykjavik",
    description:
      "Mama Reykjavik is a 100% plant-based restaurant at Bankastræti 2 in central Reykjavik, serving world-inspired vegan food, ceremonial cacao, and community events.",
    ogTitle: "Mama Reykjavik | 100% Plant-Based Restaurant in Reykjavik",
    ogDescription:
      "World-inspired vegan food, ceremonial cacao, and warm hospitality in the heart of Reykjavik. Find Mama at Bankastræti 2.",
  };

  
  const formatted = formatMetadata({
    title: t.title,
    description: t.description,
  });

  return {
    title: formatted.title,
    description: formatted.description,
    alternates: {
      canonical: "https://mama.is",
    },
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

// Note: Restaurant + Organization JSON-LD for the homepage is emitted by the
// shared <StructuredData /> component mounted in src/app/layout.js. Do NOT add
// inline JSON-LD here — see src/app/components/StructuredData.jsx.
export default function Page() {
  return <HomePageRedesign />;
}
