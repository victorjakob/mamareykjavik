import TermsContent from "./TermsContent";

export const metadata = {
  title: "Terms of Service | Mama Reykjavik",
  description:
    "Review the terms that govern reservations, events, online purchases, and digital experiences with Mama Reykjavik & White Lotus.",
  alternates: {
    canonical: "https://mama.is/policies/terms",
  },
};

export default function TermsOfServicePolicy() {
  return (
    <div className="relative mx-auto w-full max-w-4xl px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50 via-white to-emerald-50/30" />
      <article className="space-y-12 rounded-3xl border border-emerald-100/70 bg-white/90 p-8 shadow-xl shadow-emerald-100/40 backdrop-blur">
        <TermsContent />
      </article>
    </div>
  );
}

