import ContactForm from "@/app/components/ContactForm";
import Link from "next/link";

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
        url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1",
        alt: "Mama Reykjavik Logo",
      },
    ],
    type: "website",
  },
};

export default function Contact() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-center mt-36 mb-8">Contact Us</h1>
      <div className="text-center mt-6 mb-8">
        <Link
          href="https://www.dineout.is/mamareykjavik?g=2&dt=2025-02-03T13:30&area=anywhere&cats=&type=bookings&isolation=true"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-3 border border-orange-600 text-orange-600 rounded-full font-light tracking-wide hover:tracking-wider hover:bg-orange-600 hover:text-white transition-all duration-300 ease-in-out"
        >
          Book a Table
        </Link>
        <Link
          href="/whitelotus/rent"
          className="inline-block px-8 py-3 ml-4 border border-orange-600 text-orange-600 rounded-full font-light tracking-wide hover:tracking-wider hover:bg-orange-600 hover:text-white transition-all duration-300 ease-in-out"
        >
          Host Your Event
        </Link>
      </div>

      <h2 className="mx-auto font-sans max-w-s md:max-w-screen-sm lg:max-w-screen-md text-base text-center  px-10">
        Have any question? comments? requests? or just want to share a joke.{" "}
        <br /> Please send us a message
      </h2>

      <ContactForm />
    </div>
  );
}
