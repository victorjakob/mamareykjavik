import { redirect } from "next/navigation";

export const metadata = {
  title: "Mama Store – Terms & Conditions",
  description:
    "Learn about Mama Store’s purchasing terms, shipping details, refunds, and data policies. Updated November 12, 2025.",
  alternates: {
    canonical: "https://mama.is/policies/store",
  },
};

export default function StorePolicyRedirectPage() {
  redirect("/policies/store");
}

