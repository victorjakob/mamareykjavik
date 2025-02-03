import MyTickets from "@/app/components/profile/MyTickets";

export const metadata = {
  title: "My Tickets | Mama Reykjavik",
  description: "View and manage your event tickets for Mama Reykjavik events.",
  canonical: "https://mamareykjavik.is/profile/my-tickets",
  openGraph: {
    title: "My Tickets | Mama Reykjavik",
    description:
      "View and manage your tickets for upcoming Mama Reykjavik events.",
    url: "https://mamareykjavik.is/profile/my-tickets",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/whitelotus-23.appspot.com/o/mamabanner.jpg?alt=media&token=ec0ea207-6b4b-42af-80c2-156776003de1",
        alt: "Mama Reykjavik banner",
      },
    ],
    type: "website",
  },
};

export default function MyTicketsPage() {
  return <MyTickets />;
}
