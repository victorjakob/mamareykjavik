import MyTickets from "./MyTickets";

export const metadata = {
  title: "My Tickets | Mama Reykjavik",
  description: "View and manage your event tickets for Mama Reykjavik events.",
  canonical: "https://mama.is/profile/my-tickets",
  openGraph: {
    title: "My Tickets | Mama Reykjavik",
    description:
      "View and manage your tickets for upcoming Mama Reykjavik events.",
    url: "https://mama.is/profile/my-tickets",
    images: [
      {
        url: "https://res.cloudinary.com/dy8q4hf0k/image/upload/w_1200,h_630,c_fill,q_auto,f_auto/mama-reykjavik/mamabanner.jpg",
        alt: "Mama Reykjavik banner",
      },
    ],
    type: "website",
  },
};

export default function MyTicketsPage() {
  return <MyTickets />;
}
