import OpenHoursMama from "./components/homepage/OpenHoursMama";
import About from "./components/homepage/About";
import Hero from "./components/homepage/Hero";

export const metadata = {
  title: "Upcoming Events | Mama Reykjavik",
  description:
    "Explore upcoming events at Mama Reykjavik & White Lotus, including cacao ceremonies, conscious dining, and live music experiences.",
  canonical: "https://mamareykjavik.is/events",
  openGraph: {
    title: "Upcoming Events at Mama Reykjavik & White Lotus",
    description:
      "Join us for unique experiences including concerts, cacao ceremonies, live music, ecstatic dance and more.",
    url: "https://mamareykjavik.is/events",
    images: [
      {
        url: "https://mamareykjavik.is/assets/event-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Mama Reykjavik Events",
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
