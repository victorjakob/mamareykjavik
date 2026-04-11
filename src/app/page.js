import HomePage from "@/app/components/homepage/HomePage";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  // Always use English for home page metadata
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

export default function Page() {
  return <HomePage />;
}
