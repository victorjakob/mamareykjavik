import React from "react";
import TermsHeader from "./components/TermsHeader";
import PurchaseTerms from "./components/PurchaseTerms";
import RefundPolicy from "./components/RefundPolicy";
import EventTerms from "./components/EventTerms";
import LiabilityTerms from "./components/LiabilityTerms";
import DataPrivacy from "./components/DataPrivacy";
import ContactInfo from "./components/ContactInfo";

export const metadata = {
  title: "Terms & Conditions - Ticket Purchases | Mama Reykjavik",
  description:
    "Terms and conditions for ticket purchases, refund policies, and event participation at Mama Reykjavik. Read our policies before booking.",
  keywords:
    "terms and conditions, ticket policy, refund policy, Mama Reykjavik, event terms, cancellation policy, Iceland events",
  canonical: "https://mama.is/terms/tickets",
  openGraph: {
    title: "Terms & Conditions - Ticket Purchases | Mama Reykjavik",
    description:
      "Terms and conditions for ticket purchases, refund policies, and event participation at Mama Reykjavik.",
    url: "https://mama.is/terms/tickets",
    siteName: "Mama Reykjavik",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Terms & Conditions - Ticket Purchases | Mama Reykjavik",
    description:
      "Terms and conditions for ticket purchases, refund policies, and event participation at Mama Reykjavik.",
  },
  robots: "index, follow",
};

const TermsPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <TermsHeader />

        <div className="space-y-12 mt-12">
          <PurchaseTerms />
          <RefundPolicy />
          <EventTerms />
          <LiabilityTerms />
          <DataPrivacy />
          <ContactInfo />
        </div>
      </div>
    </main>
  );
};

export default TermsPage;
