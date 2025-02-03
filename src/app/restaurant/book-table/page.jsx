import BookRedirect from "@/app/components/restaurant/BookRedirect";

export const metadata = {
  title: "Book a Table | Mama Reykjavik",
  description:
    "Reserve your table at Mama Reykjavik restaurant. Experience our unique atmosphere and delicious conscious dining menu.",
  canonical: "https://mamareykjavik.is/restaurant/book-table",
  openGraph: {
    title: "Book a Table at Mama Reykjavik Restaurant",
    description:
      "Make a reservation at Mama Reykjavik restaurant. Join us for a memorable dining experience in the heart of Reykjavik.",
    url: "https://mamareykjavik.is/restaurant/book-table",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Logo%20bigger.jpeg?alt=media&token=704baa9f-90bd-47f2-900c-0ab8535eed0b",
        width: 1200,
        height: 630,
        alt: "Mama Reykjavik Restaurant",
      },
    ],
    type: "website",
  },
};

export default function BookTable() {
  return <BookRedirect />;
}
