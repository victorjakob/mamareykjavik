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
        url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/Logo%20bigger.jpeg?alt=media&token=704baa9f-90bd-47f2-900c-0ab8535eed0b",
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
