import BrandContent from "./BrandContent";

export const metadata = {
  title: "Brand Resources | Mama Reykjavik & White Lotus",
  description:
    "Download official logos and brand assets for Mama Reykjavik and White Lotus Venue. High-quality brand resources for partners and media.",
  canonical: "https://mama.is/brand",
  openGraph: {
    title: "Brand Resources | Mama & White Lotus",
    description:
      "Download official logos and brand assets for Mama Reykjavik and White Lotus Venue.",
    url: "https://mama.is/brand",
    type: "website",
  },
};

export default function BrandPage() {
  return <BrandContent />;
}
