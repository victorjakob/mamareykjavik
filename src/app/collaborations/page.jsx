import CollaborationsContent from "./CollaborationsContent";

export const metadata = {
  title: "Our Collaborations | Mama Reykjavik",
  description:
    "Discover our trusted partners and collaborations. We work with like-minded Icelandic companies who share our passion for quality, sustainability, and community.",
  canonical: "https://mama.is/collaborations",
  keywords:
    "Mama Reykjavik partners, collaborations Iceland, Maul.is, business partnerships Reykjavik, sustainable partnerships, Iceland food partnerships",
  openGraph: {
    title: "Our Trusted Partners | Mama Reykjavik",
    description:
      "We're proud to collaborate with like-minded Icelandic companies who share our passion for quality, sustainability, and community.",
    url: "https://mama.is/collaborations",
    type: "website",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1",
        width: 1200,
        height: 630,
        alt: "Mama Reykjavik Collaborations & Partners",
      },
    ],
  },
};

export default function CollaborationsPage() {
  return <CollaborationsContent />;
}
