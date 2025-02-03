import Story from "../components/about-us/1-story";
import WhatWeOffer from "../components/about-us/2-whatWeOffer";
import Community from "../components/about-us/3-community";
import NextSteps from "../components/about-us/4-nextSteps";
import LongTermVision from "../components/about-us/5-longterm";
import BePart from "../components/about-us/6-bePart";
import Welcome from "../components/about-us/Welcome";

export const metadata = {
  title: "About Us | Mama Reykjavik",
  description:
    "Learn about Mama Reykjavik & White Lotus - our story, vision, and commitment to creating a conscious community space in Reykjavik.",
  canonical: "https://mamareykjavik.is/about",
  openGraph: {
    title: "About Mama Reykjavik & White Lotus",
    description:
      "Discover our journey, values and vision as we create a conscious community space bringing people together through food, events and experiences.",
    url: "https://mamareykjavik.is/about",
    images: [
      {
        url: "https://mamareykjavik.is/assets/event-banner.jpg",
        width: 1200,
        height: 630,
        alt: "About Mama Reykjavik",
      },
    ],
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main>
      <Welcome />
      <Story />
      <WhatWeOffer />
      <Community />
      <NextSteps />
      <LongTermVision />
      <BePart />
    </main>
  );
}
