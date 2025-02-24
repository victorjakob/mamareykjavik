import OpenHoursMama from "./components/homepage/OpenHoursMama";
import About from "./components/homepage/About";
import Hero from "./components/homepage/Hero";

export const metadata = {
  title: "Mama Reykjavik | Real, Honest Food & Unforgettable Events",
  description:
    "Welcome to Mama Reykjavik & White Lotus - a conscious community space bringing people together through food, events and experiences in the heart of Reykjavik.",
  canonical: "https://mama.is",
  openGraph: {
    title: "Mama Reykjavik | Conscious Community Space",
    description:
      "A conscious community space in Reykjavik bringing people together through food, events and meaningful experiences.",
    url: "https://mama.is",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1",
        width: 1200,
        height: 630,
        alt: "Mama Reykjavik",
      },
    ],
    type: "website",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen min-w-screen">
      <main>
        <Hero />
        <About />
        <OpenHoursMama />
      </main>
    </div>
  );
}
