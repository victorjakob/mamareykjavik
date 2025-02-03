import FormWL from "@/app/components/whitelotus/FormWL";

export const metadata = {
  title: "Rent White Lotus | Mama Reykjavik",
  description:
    "Rent our beautiful White Lotus venue space for your next event. Perfect for ceremonies, workshops, gatherings and private events in Reykjavik.",
  canonical: "https://mamareykjavik.is/whitelotus/rent",
  openGraph: {
    title: "Rent White Lotus Event Venue | Mama Reykjavik",
    description:
      "Book White Lotus venue for your next event. An ideal space for ceremonies, workshops, gatherings and private events in the heart of Reykjavik.",
    url: "https://mamareykjavik.is/whitelotus/rent",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/whitelotusbanner.jpg?alt=media&token=ddb5d9ad-25af-4307-b37f-ceaa1b79002a",
        width: 1200,
        height: 630,
        alt: "White Lotus Venue Space",
      },
    ],
    type: "website",
  },
};

export default function Rent() {
  return (
    <div>
      <FormWL />
    </div>
  );
}
