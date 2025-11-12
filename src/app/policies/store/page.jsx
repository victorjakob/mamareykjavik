export const metadata = {
  title: "Mama Store – Terms & Conditions / Skilmálar og skilyrði",
  description:
    "Bilingual (EN/IS) overview of Mama Store’s mission, ordering, payments, shipping, returns, privacy, and contact details. Updated November 12, 2025.",
  alternates: {
    canonical: "https://mama.is/policies/store",
  },
};

const LAST_UPDATED = "November 12, 2025";

import StoreContent from "./StoreContent";

export default function StorePolicyPage() {
  return <StoreContent lastUpdated={LAST_UPDATED} />;
}
