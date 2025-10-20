import BrandContent from "./BrandContent";

export const metadata = {
  title: "Brand Resources | Mama Reykjavik & White Lotus",
  description:
    "Download official logos and brand assets for Mama Reykjavik and White Lotus Venue. High-quality brand resources for partners and media.",
  canonical: "https://mama.is/brand",
  keywords:
    "Mama Reykjavik brand, logo download, brand assets, White Lotus branding, press kit, media resources Iceland, Mama logo, brand guidelines",
  openGraph: {
    title: "Brand Resources | Mama & White Lotus",
    description:
      "Download official logos and brand assets for Mama Reykjavik and White Lotus Venue.",
    url: "https://mama.is/brand",
    type: "website",
    images: [
      {
        url: "https://cmqoetecaasivfzxgnxe.supabase.co/storage/v1/object/public/brand/logo-merged.png",
        width: 1200,
        height: 630,
        alt: "Mama Reykjavik & White Lotus Brand Resources",
      },
    ],
  },
};

export default function BrandPage() {
  return <BrandContent />;
}
