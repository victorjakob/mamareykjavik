// /private-session/[slug] — individual practitioner page.
// Server entry: fetches data, then renders the public view.
// 404 if practitioner is inactive or missing.

import { notFound } from "next/navigation";

import { alternatesFor, getLocaleFromHeaders, ogLocale } from "@/lib/seo";
import { formatMetadata } from "@/lib/seo-utils";

import { getPractitionerBySlug, groupSlotsByDate } from "../_lib/data";
import { COPY } from "../_lib/copy";
import PractitionerView from "./PractitionerView";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const locale = await getLocaleFromHeaders();
  const data = await getPractitionerBySlug(slug);

  if (!data) {
    return { title: "Practitioner not found | Mama Reykjavik" };
  }
  const { practitioner } = data;
  const pathname = `/private-session/${practitioner.slug}`;
  const alternates = alternatesFor({ locale, pathname, translated: true });

  const title =
    practitioner.meta_seo_title || `${practitioner.name} | Mama Reykjavik`;
  const description =
    practitioner.meta_seo_description ||
    `Private sessions with ${practitioner.name}${
      practitioner.country_of_origin ? `, visiting from ${practitioner.country_of_origin}` : ""
    }, in residence at Mama Reykjavik.`;

  const formatted = formatMetadata({ title, description });

  return {
    title: formatted.title,
    description: formatted.description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      type: "profile",
      locale: ogLocale(locale),
      images: practitioner.photo_url
        ? [{ url: practitioner.photo_url, alt: practitioner.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: practitioner.photo_url ? [practitioner.photo_url] : undefined,
    },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const locale = await getLocaleFromHeaders();
  const data = await getPractitionerBySlug(slug);

  if (!data) notFound();

  const groupedSlots = groupSlotsByDate(data.slots, locale);
  const t = COPY[locale] || COPY.en;

  return (
    <PractitionerView
      locale={locale}
      t={t}
      practitioner={data.practitioner}
      offerings={data.offerings}
      groupedSlots={groupedSlots}
    />
  );
}
