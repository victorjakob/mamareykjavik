import { redirect } from "next/navigation";

export const metadata = {
  title: "Terms of Service | Mama Reykjavik",
  description:
    "Review the terms that govern reservations, events, online purchases, and digital experiences with Mama Reykjavik & White Lotus.",
  alternates: {
    canonical: "https://mama.is/policies/terms",
  },
};

export default function TermsRedirectPage() {
  redirect("/policies");
}
