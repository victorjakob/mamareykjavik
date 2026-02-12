import Link from "next/link";
import DualLanguageText from "@/app/components/DualLanguageText";
import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

const policies = [
  {
    titleEn: "General Terms of Service",
    titleIs: "Almennir þjónustuskilmálar",
    descriptionEn:
      "How we handle reservations, events, online purchases, and community experiences.",
    descriptionIs:
      "Hvernig við meðhöndlum bókanir, viðburði, netkaup og samfélagsupplifanir.",
    href: "/policies/terms",
    ctaEn: "👉 Read the terms →",
    ctaIs: "👉 Lesa skilmála →",
  },
  {
    titleEn: "Privacy Policy",
    titleIs: "Persónuverndarstefna",
    descriptionEn:
      "Details on the personal information we collect, how we use it, and your rights.",
    descriptionIs:
      "Upplýsingar um þær persónuupplýsingar sem við söfnum, hvernig við notum þær og hvaða réttindi þú hefur.",
    href: "/policies/privacy",
    ctaEn: "👉 Review privacy details →",
    ctaIs: "👉 Skoða persónuvernd →",
  },
  {
    titleEn: "Mama Store Terms & Conditions",
    titleIs: "Skilmálar Mama Store",
    descriptionEn:
      "All about shipping, returns, product care, and payments for our online store.",
    descriptionIs:
      "Allt um sendingar, skil, umhirðu vara og greiðslur í netverslun okkar.",
    href: "/policies/store",
    ctaEn: "👉 Explore store policy →",
    ctaIs: "👉 Skoða verslunarskilmála →",
  },
  {
    titleEn: "Ticketing & Event Terms",
    titleIs: "Miða- og viðburðarskilmálar",
    descriptionEn:
      "Guidelines for event tickets, attendance, and cancellations across our experiences.",
    descriptionIs:
      "Leiðbeiningar um miðakaup, þátttöku og afbókanir í tengslum við viðburði og upplifanir okkar.",
    href: "/policies/tickets",
    ctaEn: "👉 View ticket terms →",
    ctaIs: "👉 Skoða miðaskilmála →",
  },
  {
    titleEn: "Event Host Policy (White Lotus)",
    titleIs: "Event Host Policy (White Lotus)",
    descriptionEn:
      "Capacity, sound system guidelines, cleaning, damages, safety, payments, and liability for hosts.",
    descriptionIs:
      "Capacity, sound system guidelines, cleaning, damages, safety, payments, and liability for hosts.",
    href: "/policies/hosting-wl",
    ctaEn: "👉 Read host policy →",
    ctaIs: "👉 Read host policy →",
  },
];

export async function generateMetadata() {
  const language = await getLocaleFromHeaders();
  const pathname = "/policies";
  const alternates = alternatesFor({ locale: language, pathname, translated: true });

  const translations = {
    en: {
      title: "Policies & Legal | Mama Reykjavik",
      description:
        "Browse all of Mama Reykjavik & White Lotus policies in one place, including privacy, terms of service, and store guidelines.",
    },
    is: {
      title: "Skilmálar og stefna | Mama Reykjavík",
      description:
        "Skoðaðu alla skilmála og stefnur Mama Reykjavík & White Lotus á einum stað, þar með talið persónuvernd, þjónustuskilmála og verslunarskilmála.",
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

export default function PoliciesIndexPage() {
  return (
    <div className="relative mx-auto w-full max-w-5xl px-6 py-20">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50 via-white to-emerald-50/30" />
      <div className="flex flex-col items-center gap-12">
        <header className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">
            Mama Reykjavik & White Lotus
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-emerald-900 sm:text-5xl">
            <DualLanguageText
              element="span"
              className="block"
              en="Policies & Legal"
              is="Skilmálar og stefna"
            />
          </h1>
          <DualLanguageText
            className="mt-4 max-w-2xl text-sm text-emerald-900/70"
            en="Everything you need to know about how we operate — from safeguarding your data to shipping your cacao and welcoming you into our spaces."
            is="Allt sem þú þarft að vita um hvernig við störfum — frá verndun persónuupplýsinga til sendingar á kakói og móttöku þinni í okkar helgu rýmum."
          />
        </header>

        <div className="grid w-full gap-6 md:grid-cols-2">
          {policies.map((policy) => (
            <Link
              key={policy.href}
              href={policy.href}
              className="group rounded-3xl border border-emerald-100/80 bg-white/90 p-6 shadow-lg shadow-emerald-100/40 backdrop-blur transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-emerald-200/50"
            >
              <div className="flex flex-col gap-4">
                <div>
                  <DualLanguageText
                    element="h2"
                    className="font-serif text-2xl text-emerald-900"
                    en={policy.titleEn}
                    is={policy.titleIs}
                  />
                  <DualLanguageText
                    className="mt-2 text-sm text-emerald-900/70"
                    en={policy.descriptionEn}
                    is={policy.descriptionIs}
                  />
                </div>
                <DualLanguageText
                  className="text-sm font-semibold text-emerald-700 transition group-hover:text-emerald-600"
                  en={policy.ctaEn}
                  is={policy.ctaIs}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

