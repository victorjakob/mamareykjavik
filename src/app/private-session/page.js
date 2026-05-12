// /private-session — index of in-residence and upcoming visiting practitioners.
// Server entry: pulls data, then renders the client view component.

import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

import { listActivePractitioners } from "./_lib/data";
import { COPY } from "./_lib/copy";
import IndexPage from "./IndexPage";

export async function generateMetadata() {
  const locale = await getLocaleFromHeaders();
  const t = COPY[locale] || COPY.en;
  const pathname = "/private-session";
  const alternates = alternatesFor({ locale, pathname, translated: true });

  const title = "Private sessions | Mama Reykjavik";
  const description = t.indexIntro;
  const formatted = formatMetadata({ title, description });

  return {
    title: formatted.title,
    description: formatted.description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      type: "website",
      locale: ogLocale(locale),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Page() {
  const locale = await getLocaleFromHeaders();
  const practitioners = await listActivePractitioners();
  return <IndexPage locale={locale} practitioners={practitioners} />;
}
