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
        url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1",
        alt: "Mama Reykjavik Logo",
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
