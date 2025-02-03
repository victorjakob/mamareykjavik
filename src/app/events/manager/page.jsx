import ManageEvents from "@/app/components/events/ManageEvents";

export const metadata = {
  title: "Event Manager | Mama Reykjavik",
  description:
    "Manage and organize events at Mama Reykjavik & White Lotus. Add, edit, and delete events for your venue.",
  canonical: "https://mamareykjavik.is/events/manager",
  openGraph: {
    title: "Event Manager | Mama Reykjavik",
    description:
      "Administrative interface for managing events at Mama Reykjavik & White Lotus.",
    url: "https://mamareykjavik.is/events/manager",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/whitelotusbanner.jpg?alt=media&token=ddb5d9ad-25af-4307-b37f-ceaa1b79002a",
        width: 1200,
        height: 630,
        alt: "Mama Reykjavik Event Management",
      },
    ],
    type: "website",
  },
};

export default function EventManager() {
  return (
    <div className="mt-14 sm:mt-32 sm:px-6 lg:px-8">
      <ManageEvents />
    </div>
  );
}
