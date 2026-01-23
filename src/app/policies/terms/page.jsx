import TermsContent from "./TermsContent";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/policies/terms";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "Terms of Service | Mama Reykjavik",
      description:
        "Review the terms that govern reservations, events, online purchases, and digital experiences with Mama Reykjavik & White Lotus.",
    },
    is: {
      title: "Þjónustuskilmálar | Mama Reykjavík",
      description:
        "Lestu skilmála sem gilda um bókanir, viðburði, netkaup og stafrænar upplifanir hjá Mama Reykjavík & White Lotus.",
    },
  };

  const t = translations[language];
  const formatted = formatMetadata({
    title: t.title,
    description: t.description,
  });

  return {
    title: formatted.title,
    description: formatted.description,
    alternates,
    openGraph: {
      title: t.title,
      description: t.description,
      url: alternates.canonical,
      type: "website",
      locale: ogLocale(language),
    },
  };
}

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

