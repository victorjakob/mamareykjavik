import PrivacyContent from "./PrivacyContent";

export const metadata = {
  title: "Privacy Policy | Mama Reykjavik",
  description:
    "Understand how Mama Reykjavik & White Lotus collects, uses, and protects your personal information, cookies, and data rights.",
  alternates: {
    canonical: "https://mama.is/policies/privacy",
  },
};

const LAST_UPDATED = "November 12, 2025";

export default function PrivacyPolicyPage() {
  return <PrivacyContent lastUpdated={LAST_UPDATED} />;
}