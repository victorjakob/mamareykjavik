import HomePage from "@/app/components/homepage/HomePage";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  // Always use English for home page metadata
  const t = {
    title: "Mama Reykjavik | Restaurant & Events",
    description:
      "Experience authentic Vietnamese cuisine and vibrant events at Mama Reykjavik. Join us for delicious food, cultural experiences, and community gatherings in the heart of Reykjavik.",
    ogTitle: "Mama Reykjavik | Restaurant & Events",
    ogDescription:
      "Experience multicultural honest cuisine and vibrant events at Mama Reykjavik. Join us for delicious food, cultural experiences, and community gatherings in the heart of Reykjavik.",
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
          url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1",
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
