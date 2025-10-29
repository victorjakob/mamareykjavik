import Story from "../components/about-us/1-story";
import WhatWeOffer from "../components/about-us/2-whatWeOffer";
import Community from "../components/about-us/3-community";
import NextSteps from "../components/about-us/4-nextSteps";
import LongTermVision from "../components/about-us/5-longterm";
import BePart from "../components/about-us/6-bePart";
import Welcome from "../components/about-us/Welcome";
import { cookies } from "next/headers";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "en";

  const translations = {
    en: {
      title: "About Us | Mama Reykjavik",
      description:
        "Learn about Mama Reykjavik & White Lotus - our story, vision, and commitment to creating a conscious community space in Reykjavik.",
      ogTitle: "About Mama Reykjavik & White Lotus",
      ogDescription:
        "Discover our journey, values and vision as we create a conscious community space bringing people together through food, events and experiences.",
    },
    is: {
      title: "Um okkur | Mama Reykjavík",
      description:
        "Lærðu um Mama Reykjavík & White Lotus - sögu okkar, sjónarhorn og skuldbinding við að búa til meðvitað samfélagsrými í Reykjavík.",
      ogTitle: "Um Mama Reykjavík & White Lotus",
      ogDescription:
        "Uppgötvaðu ferð okkar, gildi og sjónarhorn þegar við búum til meðvitað samfélagsrými sem koma fólki saman í gegnum mat, viðburði og reynslu.",
    },
  };

  const t = translations[language];

  return {
    title: t.title,
    description: t.description,
    canonical: "https://mama.is/about",
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      url: "https://mama.is/about",
      images: [
        {
          url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1",
          alt: "Mama Reykjavik Logo",
        },
      ],
      type: "website",
    },
  };
}

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
