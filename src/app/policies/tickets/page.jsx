import { redirect } from "next/navigation";

export const metadata = {
  title: "Ticket Terms & Conditions | Mama Reykjavik",
  description:
    "View the policies that govern ticket purchases, attendance, transfers, and event participation with Mama Reykjavik & White Lotus.",
  alternates: {
    canonical: "https://mama.is/policies/tickets",
  },
};

export default function TicketTermsRedirectPage() {
  redirect("/terms/tickets");
}


