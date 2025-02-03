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
        url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1",
        alt: "Mama Reykjavik Logo",
      },
    ],
    type: "website",
  },
};

export default function BookTable() {
  return <BookRedirect />;
}
