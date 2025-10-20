import CollaborationsContent from "./CollaborationsContent";

export const metadata = {
  title: "Our Collaborations | Mama Reykjavik",
  description:
    "Discover our trusted partners and collaborations. We work with like-minded Icelandic companies who share our passion for quality, sustainability, and community.",
  canonical: "https://mama.is/collaborations",
  openGraph: {
    title: "Our Trusted Partners | Mama Reykjavik",
    description:
      "We're proud to collaborate with like-minded Icelandic companies who share our passion for quality, sustainability, and community.",
    url: "https://mama.is/collaborations",
    type: "website",
  },
};

export default function CollaborationsPage() {
  return <CollaborationsContent />;
}
